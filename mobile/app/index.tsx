import AppLogo from "@/components/app-logo";
import { Redirect, useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetworkState } from "expo-network";
import { View } from "react-native";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";

export default function Index() {
  const { getUser, lock, user, loading } = useAuth();
  const networkState = useNetworkState();

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        getUser();
      } else {
        lock();
      }
    }, [lock, user, getUser]),
  );

  return !networkState.isConnected || loading ? (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center gap-12">
        <AppLogo className="w-48 h-20" />
        <LottieView
          style={{
            width: 150,
            height: 150,
          }}
          source={require("@/assets/animations/liquid-4-dot-loader.json")}
          autoPlay
          loop
        />
      </View>
      {!networkState.isConnected && (
        <View className="absolute bottom-8 px-6">
          <Alert icon={WifiOff}>
            <AlertTitle className="font-figtree-medium">
              Network Error
            </AlertTitle>
            <AlertDescription className="text-sm font-figtree-regular">
              Something went wrong with your network connection. Please check it
              and try again.
            </AlertDescription>
          </Alert>
        </View>
      )}
    </SafeAreaView>
  ) : !user ? (
    <Redirect href="/on-boarding" />
  ) : user.user_session.required_password === 1 ? (
    <Redirect href="/login" />
  ) : (
    <Redirect href="/home" />
  );
}

// import React, { useState, useRef } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   Image,
//   Alert,
// } from 'react-native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import { SafeAreaView } from 'react-native-safe-area-context';

// interface ExtractedIdInfo {
//   idTypeDetected: string;
//   idNumber?: string;
//   lastName?: string;
//   firstName?: string;
//   middleName?: string;
//   dateOfBirth?: string;
//   rawLines: string[];
// }

// export default function PhIdOcrScanner() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [extractedInfo, setExtractedInfo] = useState<ExtractedIdInfo | null>(null);

//   const cameraRef = useRef<CameraView | null>(null);

//   if (!permission) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#3B82F6" />
//       </View>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.text}>We need camera permission to read your ID.</Text>
//         <TouchableOpacity style={styles.button} onPress={requestPermission}>
//           <Text style={styles.buttonText}>Grant Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // 1. Capture Photo from Camera
//   const captureAndReadId = async () => {
//     if (!cameraRef.current || isProcessing) return;

//     try {
//       setIsProcessing(true);
//       const photo = await cameraRef.current.takePictureAsync({
//         quality: 0.8,
//       });

//       if (!photo?.uri) return;
//       setCapturedImage(photo.uri);

//       // 2. Run ML Kit Text Recognition on the captured image
//       const result = await TextRecognition.recognize(photo.uri);
//       const lines = result.blocks.map((block) => block.text.trim());

//       // 3. Parse Philippine ID fields from the recognized text
//       const parsedData = parsePhilippineIdText(lines);
//       setExtractedInfo(parsedData);
//     } catch (error) {
//       Alert.alert('OCR Error', 'Failed to read text from the ID card. Please try again with better lighting.');
//       console.error(error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // 3. Philippine ID Text Parser (Heuristics & RegEx)
//   const parsePhilippineIdText = (lines: string[]): ExtractedIdInfo => {
//     const info: ExtractedIdInfo = {
//       idTypeDetected: 'General Philippine ID',
//       rawLines: lines,
//     };

//     // Helper patterns for PH ID formats
//     const umidPattern = /\b\d{4}-\d{7}-\d{1}\b/; // e.g., 0111-2222222-3
//     const philIdPattern = /\b\d{4}-\d{4}-\d{4}-\d{4}\b/; // e.g., 1234-5678-9012-3456
//     const ltoPattern = /\b[A-Z]\d{2}-\d{2}-\d{6}\b/; // e.g., N01-12-345678
//     const tinPattern = /\b\d{3}-\d{3}-\d{3}-\d{3}\b/; // e.g., 123-456-789-000
//     const dobPattern = /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-]\d{4}\b/i; // MM/DD/YYYY
//     const monthWordDobPattern = /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+\d{4}\b/i;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
//       const upperLine = line.toUpperCase();

//       // --- Detect PH ID Type & Number ---
//       if (umidPattern.test(line)) {
//         info.idTypeDetected = 'UMID Card';
//         info.idNumber = line.match(umidPattern)?.[0];
//       } else if (philIdPattern.test(line)) {
//         info.idTypeDetected = 'PhilID / National ID';
//         info.idNumber = line.match(philIdPattern)?.[0];
//       } else if (ltoPattern.test(line)) {
//         info.idTypeDetected = 'LTO Driver License';
//         info.idNumber = line.match(ltoPattern)?.[0];
//       } else if (tinPattern.test(line)) {
//         info.idTypeDetected = 'TIN Card';
//         info.idNumber = line.match(tinPattern)?.[0];
//       }

//       // --- Detect Date of Birth ---
//       if (!info.dateOfBirth) {
//         const dobMatch = line.match(dobPattern) || line.match(monthWordDobPattern);
//         if (dobMatch) {
//           info.dateOfBirth = dobMatch[0];
//         }
//       }

//       // --- Detect Names using PH ID labels ---
//       // PhilID & UMID typically place the actual name on the line below the label
//       if (
//         upperLine.includes('LAST NAME') ||
//         upperLine.includes('APELYIDO') ||
//         upperLine.includes('SURNAME')
//       ) {
//         const nextLine = lines[i + 1];
//         if (nextLine && !nextLine.toUpperCase().includes('FIRST NAME')) {
//           info.lastName = nextLine;
//         }
//       }

//       if (
//         upperLine.includes('FIRST NAME') ||
//         upperLine.includes('MGA PANGALAN') ||
//         upperLine.includes('GIVEN NAME')
//       ) {
//         const nextLine = lines[i + 1];
//         if (nextLine && !nextLine.toUpperCase().includes('MIDDLE NAME')) {
//           info.firstName = nextLine;
//         }
//       }

//       if (
//         upperLine.includes('MIDDLE NAME') ||
//         upperLine.includes('GITNANG PANGALAN')
//       ) {
//         const nextLine = lines[i + 1];
//         if (nextLine && !nextLine.toUpperCase().includes('DATE OF BIRTH')) {
//           info.middleName = nextLine;
//         }
//       }
//     }

//     return info;
//   };

//   const resetScanner = () => {
//     setCapturedImage(null);
//     setExtractedInfo(null);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {!capturedImage ? (
//         /* Camera Capture Screen */
//         <View style={styles.cameraWrapper}>
//           <CameraView ref={cameraRef} style={styles.camera} facing="back" />
//           <View style={styles.overlay}>
//             <View style={styles.guideFrame} />
//             <Text style={styles.guideText}>
//               Align the front of your Philippine ID inside the frame
//             </Text>

//             <TouchableOpacity
//               style={styles.captureButton}
//               onPress={captureAndReadId}
//               disabled={isProcessing}
//             >
//               {isProcessing ? (
//                 <ActivityIndicator color="#FFF" />
//               ) : (
//                 <Text style={styles.captureButtonText}>Capture & Read ID</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         /* Extracted OCR Results Screen */
//         <ScrollView contentContainerStyle={styles.resultContainer}>
//           <Text style={styles.resultTitle}>Extracted ID Information</Text>

//           <Image source={{ uri: capturedImage }} style={styles.previewImage} />

//           <View style={styles.card}>
//             <Text style={styles.typeBadge}>
//               {extractedInfo?.idTypeDetected || 'Unknown ID'}
//             </Text>

//             <View style={styles.fieldRow}>
//               <Text style={styles.fieldLabel}>ID Number</Text>
//               <Text style={styles.fieldValue}>
//                 {extractedInfo?.idNumber || 'Not detected'}
//               </Text>
//             </View>

//             <View style={styles.fieldRow}>
//               <Text style={styles.fieldLabel}>Last Name</Text>
//               <Text style={styles.fieldValue}>
//                 {extractedInfo?.lastName || 'Not detected'}
//               </Text>
//             </View>

//             <View style={styles.fieldRow}>
//               <Text style={styles.fieldLabel}>First Name</Text>
//               <Text style={styles.fieldValue}>
//                 {extractedInfo?.firstName || 'Not detected'}
//               </Text>
//             </View>

//             <View style={styles.fieldRow}>
//               <Text style={styles.fieldLabel}>Middle Name</Text>
//               <Text style={styles.fieldValue}>
//                 {extractedInfo?.middleName || 'Not detected'}
//               </Text>
//             </View>

//             <View style={styles.fieldRow}>
//               <Text style={styles.fieldLabel}>Date of Birth</Text>
//               <Text style={styles.fieldValue}>
//                 {extractedInfo?.dateOfBirth || 'Not detected'}
//               </Text>
//             </View>
//           </View>

//           {/* Collapsible raw OCR output for debugging */}
//           <Text style={styles.rawTitle}>Raw OCR Text Detected:</Text>
//           <View style={styles.rawBox}>
//             {extractedInfo?.rawLines.map((line, idx) => (
//               <Text key={idx} style={styles.rawText}>
//                 {line}
//               </Text>
//             ))}
//           </View>

//           <TouchableOpacity style={styles.button} onPress={resetScanner}>
//             <Text style={styles.buttonText}>Scan Another PH ID</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#111' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   text: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 16 },
//   cameraWrapper: { flex: 1, position: 'relative' },
//   camera: { flex: 1 },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   guideFrame: {
//     width: 310,
//     height: 195,
//     borderWidth: 2,
//     borderColor: '#3B82F6',
//     borderRadius: 12,
//     backgroundColor: 'transparent',
//   },
//   guideText: {
//     color: '#FFF',
//     marginTop: 20,
//     fontWeight: '600',
//     fontSize: 14,
//     textAlign: 'center',
//     paddingHorizontal: 30,
//   },
//   captureButton: {
//     backgroundColor: '#3B82F6',
//     paddingVertical: 14,
//     paddingHorizontal: 32,
//     borderRadius: 30,
//     marginTop: 30,
//     minWidth: 180,
//     alignItems: 'center',
//   },
//   captureButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
//   resultContainer: { padding: 20 },
//   resultTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
//   previewImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 12,
//     resizeMode: 'contain',
//     backgroundColor: '#000',
//     marginBottom: 16,
//   },
//   card: { backgroundColor: '#222', padding: 16, borderRadius: 12, marginBottom: 20 },
//   typeBadge: {
//     color: '#3B82F6',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 14,
//     textTransform: 'uppercase',
//   },
//   fieldRow: { marginBottom: 12 },
//   fieldLabel: { fontWeight: 'bold', color: '#888', fontSize: 12 },
//   fieldValue: { color: '#FFF', fontSize: 16, marginTop: 2 },
//   rawTitle: { color: '#AAA', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
//   rawBox: {
//     backgroundColor: '#1A1A1A',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   rawText: { color: '#777', fontSize: 12, marginBottom: 4 },
//   button: {
//     backgroundColor: '#3B82F6',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
// });
