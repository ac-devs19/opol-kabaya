import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Select from '@/components/select';
import { idTypes } from '@/components/others';
import { Button } from '@/components/ui/button';

type ScanStep = 'SELECT_TYPE' | 'SCAN_FRONT' | 'SCAN_BACK' | 'RESULTS';

interface ExtractedIdInfo {
  idTypeDetected: string;
  idNumber?: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  dateOfBirth?: string;
  rawLines: string[];
}

export default function Identification() {
  const [permission, requestPermission] = useCameraPermissions();

  // Workflow States
  const [scanStep, setScanStep] = useState<ScanStep>('SELECT_TYPE');
  const [selectedIdType, setSelectedIdType] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Image & Data States
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [scannedLines, setScannedLines] = useState<string[]>([]);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedIdInfo | null>(null);

  const cameraRef = useRef<CameraView | null>(null);

  // --- 1. Handle Camera Open ---
  const handleOpenCamera = () => {
    if (!permission?.granted) {
      Alert.alert(
        'Camera Permission Required',
        'We need camera permission to read your ID.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: requestPermission },
        ]
      );
      return;
    }
    setIsCameraActive(true);
  };

  // --- 2. Camera Capture Logic ---
  const captureAndReadId = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo?.uri) return;

      // Run ML Kit Text Recognition
      const result = await TextRecognition.recognize(photo.uri);
      const newLines = result.blocks.map((block) => block.text.trim());
      const accumulatedLines = [...scannedLines, ...newLines];

      if (scanStep === 'SCAN_FRONT') {
        setFrontImage(photo.uri);
        setScannedLines(accumulatedLines);
        setScanStep('SCAN_BACK');
        setIsCameraActive(false);
      } else if (scanStep === 'SCAN_BACK') {
        setBackImage(photo.uri);

        // Parse data from both front and back
        const parsedData = parsePhilippineIdText(accumulatedLines, selectedIdType);
        setExtractedInfo(parsedData);
        setScanStep('RESULTS');
        setIsCameraActive(false);
      }
    } catch (error) {
      Alert.alert(
        'OCR Error',
        'Failed to read text from the ID card. Please try again with better lighting.'
      );
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. SMARTER PHILIPPINE ID TEXT PARSER ---
  const parsePhilippineIdText = (lines: string[], manualType: string): ExtractedIdInfo => {
    const info: ExtractedIdInfo = {
      idTypeDetected: manualType,
      rawLines: lines,
    };

    // Helper functions for name extraction
    const isLabelLine = (str: string) => {
      const s = str.toUpperCase();
      return (
        s.includes('LAST NAME') || s.includes('FIRST NAME') || s.includes('MIDDLE NAME') ||
        s.includes('APELYIDO') || s.includes('PANGALAN') || s.includes('SURNAME') ||
        s.includes('DATE OF BIRTH') || s.includes('SEX') || s.includes('BLOOD TYPE') ||
        s.includes('ADDRESS') || s.includes('GIVEN NAME') || s.includes('WEIGHT') ||
        s.includes('HEIGHT')
      );
    };

    const cleanNameValue = (val: string, prefixRegex?: RegExp) => {
      let cleaned = val.trim();
      if (prefixRegex) {
        cleaned = cleaned.replace(prefixRegex, '').trim();
      }
      return cleaned;
    };

    const umidPattern = /\b\d{4}-\d{7}-\d{1}\b/;
    const philIdPattern = /\b\d{4}-\d{4}-\d{4}-\d{4}\b/;
    const ltoPattern = /\b[A-Z]\d{2}-\d{2}-\d{6}\b/;
    const tinPattern = /\b\d{3}-\d{3}-\d{3}-\d{3}\b/;
    const dobPattern = /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-]\d{4}\b/i;
    const monthWordDobPattern = /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+\d{4}\b/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upperLine = line.toUpperCase();

      // Detect ID Number
      if (!info.idNumber) {
        if (umidPattern.test(line)) info.idNumber = line.match(umidPattern)?.[0];
        else if (philIdPattern.test(line)) info.idNumber = line.match(philIdPattern)?.[0];
        else if (ltoPattern.test(line)) info.idNumber = line.match(ltoPattern)?.[0];
        else if (tinPattern.test(line)) info.idNumber = line.match(tinPattern)?.[0];
      }

      // Detect DOB
      if (!info.dateOfBirth) {
        const dobMatch = line.match(dobPattern) || line.match(monthWordDobPattern);
        if (dobMatch) info.dateOfBirth = dobMatch[0];
      }

      // --- Detect Last Name ---
      if (!info.lastName) {
        // Driver's License format check (e.g., "1. DELA CRUZ")
        const ltoLastMatch = upperLine.match(/^1[\.\-\s]+(.+)/);
        if (ltoLastMatch && !isLabelLine(ltoLastMatch[1])) {
          info.lastName = cleanNameValue(line, /^1[\.\-\s]+/);
        }
        // Standard Stacked Label Check (e.g., "Last Name" then next line is the name)
        else if (upperLine.includes('LAST NAME') || upperLine.includes('APELYIDO') || upperLine.includes('SURNAME')) {
          if (line.includes(':')) {
            const val = line.substring(line.indexOf(':') + 1).trim();
            if (val) info.lastName = cleanNameValue(val);
          } else {
            const nextLine = lines[i + 1];
            if (nextLine && !isLabelLine(nextLine)) {
              info.lastName = cleanNameValue(nextLine, /^1[\.\-\s]+/);
            }
          }
        }
      }

      // --- Detect First Name ---
      if (!info.firstName) {
        const ltoFirstMatch = upperLine.match(/^2[\.\-\s]+(.+)/);
        if (ltoFirstMatch && !isLabelLine(ltoFirstMatch[1])) {
          info.firstName = cleanNameValue(line, /^2[\.\-\s]+/);
        } else if (upperLine.includes('FIRST NAME') || upperLine.includes('MGA PANGALAN') || upperLine.includes('GIVEN NAME')) {
          if (line.includes(':')) {
            const val = line.substring(line.indexOf(':') + 1).trim();
            if (val) info.firstName = cleanNameValue(val);
          } else {
            const nextLine = lines[i + 1];
            if (nextLine && !isLabelLine(nextLine)) {
              info.firstName = cleanNameValue(nextLine, /^2[\.\-\s]+/);
            }
          }
        }
      }

      // --- Detect Middle Name ---
      if (!info.middleName) {
        const ltoMiddleMatch = upperLine.match(/^3[\.\-\s]+(.+)/);
        if (ltoMiddleMatch && !isLabelLine(ltoMiddleMatch[1])) {
          info.middleName = cleanNameValue(line, /^3[\.\-\s]+/);
        } else if (upperLine.includes('MIDDLE NAME') || upperLine.includes('GITNANG PANGALAN')) {
          if (line.includes(':')) {
            const val = line.substring(line.indexOf(':') + 1).trim();
            if (val) info.middleName = cleanNameValue(val);
          } else {
            const nextLine = lines[i + 1];
            if (nextLine && !isLabelLine(nextLine)) {
              info.middleName = cleanNameValue(nextLine, /^3[\.\-\s]+/);
            }
          }
        }
      }
    }

    return info;
  };

  const resetScanner = () => {
    setSelectedIdType('');
    setFrontImage(null);
    setBackImage(null);
    setScannedLines([]);
    setExtractedInfo(null);
    setScanStep('SELECT_TYPE');
  };

  return (
    <>
      {/* FULL SCREEN CAMERA MODAL */}
      <Modal visible={isCameraActive} animationType="slide" transparent={false}>
        <View className="flex-1 relative">
          <CameraView ref={cameraRef} style={{ flex: 1, width: '100%', height: '100%' }} facing="back" />

          {/* Camera Overlay */}
          <View className="absolute inset-0 justify-center items-center">
            <View className="w-[310px] h-[195px] border-2 border-blue-500 rounded-xl bg-transparent" />

            <Text className="text-white mt-6 font-semibold text-base text-center px-8">
              Align the <Text className="text-blue-400 font-bold">{scanStep === 'SCAN_FRONT' ? 'FRONT' : 'BACK'}</Text> of your {selectedIdType} inside the frame
            </Text>

            <TouchableOpacity
              className={`py-4 px-8 rounded-full mt-8 min-w-[200px] items-center ${isProcessing ? 'bg-blue-800' : 'bg-blue-500'}`}
              onPress={captureAndReadId}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Capture {scanStep === 'SCAN_FRONT' ? 'Front' : 'Back'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Close Camera Button */}
          <TouchableOpacity
            className="absolute top-4 right-4 bg-black/50 p-3 rounded-full"
            onPress={() => setIsCameraActive(false)}
            disabled={isProcessing}
          >
            <Text className="text-white font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MAIN UI */}
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <SafeAreaView edges={["bottom"]} className="flex-1 p-6 gap-12">

          {/* Progress & Selection Section */}
          <View className="flex-1 gap-12">
            <View className="flex-row gap-3">
              <View className="flex-1 h-2 bg-primary rounded-full" />
              <View className="flex-1 h-2 bg-primary rounded-full" />
              <View className="flex-1 h-2 bg-primary rounded-full" />
            </View>
            <Text className="font-quicksand-bold text-2xl">Identification</Text>

            <Select
              label="ID Types"
              placeholder="Select"
              items={idTypes}
              value={selectedIdType}
              onChange={(value) => {
                setSelectedIdType(value);
                setScanStep('SCAN_FRONT');
              }}
            />

            {(scanStep === 'SCAN_FRONT' || scanStep === 'SCAN_BACK') && (
              <View className="gap-6">

                {/* FRONT ID BLOCK */}
                <View className="gap-1">
                  <Text className="font-quicksand-semibold">Front</Text>
                  {frontImage ? (
                    <Image source={{ uri: frontImage }} className="w-full h-48 rounded-2xl bg-black resize-contain" />
                  ) : (
                    <View className="bg-secondary h-48 rounded-2xl items-center justify-center">
                      <Button className="rounded-full" onPress={handleOpenCamera}>
                        <Text className="font-semibold text-white">Open Camera</Text>
                      </Button>
                    </View>
                  )}
                </View>

                {/* BACK ID BLOCK */}
                {scanStep === 'SCAN_BACK' && (
                  <View className="gap-1">
                    <Text className="font-quicksand-semibold">Back</Text>
                    <View className="bg-secondary h-48 rounded-2xl items-center justify-center">
                      <Button className="rounded-full" onPress={handleOpenCamera}>
                        <Text className="font-semibold text-white">Open Camera</Text>
                      </Button>
                    </View>
                  </View>
                )}

              </View>
            )}
          </View>

          {/* RESULTS SECTION (Only visible when scanStep is RESULTS) */}
          {scanStep === 'RESULTS' && (
            <View>
              <Text className="text-white text-2xl font-bold mb-4 text-center">
                ID Verification Complete
              </Text>

              <View className="flex-row justify-between mb-5">
                <View className="flex-1 mr-2">
                  <Text className="text-neutral-400 text-xs font-bold mb-1">FRONT</Text>
                  {frontImage && (
                    <Image source={{ uri: frontImage }} className="w-full h-28 rounded-lg bg-black resize-contain" />
                  )}
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-neutral-400 text-xs font-bold mb-1">BACK</Text>
                  {backImage && (
                    <Image source={{ uri: backImage }} className="w-full h-28 rounded-lg bg-black resize-contain" />
                  )}
                </View>
              </View>

              <View className="bg-neutral-800 p-5 rounded-2xl mb-6 border border-neutral-700">
                <Text className="text-blue-400 text-lg font-bold mb-4 uppercase tracking-wider">
                  {extractedInfo?.idTypeDetected || 'Unknown ID Type'}
                </Text>

                {['idNumber', 'lastName', 'firstName', 'middleName', 'dateOfBirth'].map((field) => (
                  <View key={field} className="mb-3">
                    <Text className="font-bold text-neutral-400 text-xs capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Text>
                    <Text className="text-white text-lg mt-0.5">{(extractedInfo as any)?.[field] || 'Not detected'}</Text>
                  </View>
                ))}
              </View>

              <Text className="text-neutral-500 text-sm font-bold mb-2">Raw OCR Text Detected:</Text>
              <View className="bg-black/50 p-3 rounded-lg mb-6 border border-neutral-800">
                {extractedInfo?.rawLines.map((line, idx) => (
                  <Text key={idx} className="text-neutral-400 text-xs mb-1">
                    {line}
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                className="bg-blue-500 py-4 rounded-xl items-center mb-8"
                onPress={resetScanner}
              >
                <Text className="text-white text-base font-bold">Scan Another ID</Text>
              </TouchableOpacity>
            </View>
          )}

        </SafeAreaView>
      </KeyboardAwareScrollView>
    </>
  );
}