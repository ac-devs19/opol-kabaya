import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import { router } from "expo-router";
import {
  ChevronRight,
  FingerprintPattern,
  LockKeyholeOpen,
  Moon,
  ScanFace,
  User,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/services/theme-storage";
import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "@/contexts/auth-context";
import axios from "@/api/axios";

export default function Settings() {
  const { user, device_id, getUser } = useAuth();
  const { primary } = useAppColors();
  const { theme } = useThemeStore();

  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setIsBiometricEnabled(Boolean(user.user_session.is_biometric));
    }
  }, [user]);

  useEffect(() => {
    const checkBiometricHardware = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          setIsBiometricAvailable(true);

          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType("Face ID");
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType("Fingerprint / Touch ID");
          } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            setBiometricType("Iris Scan");
          }
        }
      } catch (error) {
        console.error("Error checking biometric support:", error);
      }
    };

    checkBiometricHardware();
  }, []);

  const updateBiometricSettingOnBackend = async (enabled: boolean) => {
    try {
      await axios.post("/biometric", {
        is_biometric: enabled ? 1 : 0,
        device_id,
      });
      await getUser();
      return true;
    } catch (e) {
      console.error("Failed to update biometric setting on server:", e);
      return false;
    }
  };

  const handleBiometricSwitch = async (value: boolean) => {
    if (isLoading) return;

    setIsLoading(true);

    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate to enable ${biometricType}`,
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
      });

      if (!result.success) {
        setIsLoading(false);
        return;
      }

      const success = await updateBiometricSettingOnBackend(true);
      if (success) {
        setIsBiometricEnabled(true);
      }
    } else {
      const success = await updateBiometricSettingOnBackend(false);
      if (success) {
        setIsBiometricEnabled(false);
      }
    }

    setIsLoading(false);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <View className="gap-2 py-4">
        <Text className="font-quicksand-semibold text-sm text-muted-foreground px-6">
          Privacy & Security
        </Text>
        <Pressable
          onPress={() =>
            router.navigate(
              "/account/settings/privacy-security/personal-information"
            )
          }
          className="bg-background active:bg-secondary/80 flex-row items-center justify-between py-4 px-6"
        >
          <View className="flex-row items-center gap-2">
            <Icon as={User} size={24} strokeWidth={1.5} />
            <Text className="font-quicksand-semibold">
              Personal Information
            </Text>
          </View>
          <Icon as={ChevronRight} size={24} color={primary} strokeWidth={1.5} />
        </Pressable>
        <Pressable
          onPress={() =>
            router.navigate(
              "/account/settings/privacy-security/change-password"
            )
          }
          className="bg-background active:bg-secondary/80 flex-row items-center justify-between py-4 px-6"
        >
          <View className="flex-row items-center gap-2">
            <Icon as={LockKeyholeOpen} size={24} strokeWidth={1.5} />
            <Text className="font-quicksand-semibold">Change Password</Text>
          </View>
          <Icon as={ChevronRight} size={24} color={primary} strokeWidth={1.5} />
        </Pressable>
        {isBiometricAvailable && (
          <View className="bg-background flex-row items-center justify-between py-4 px-6">
            <View className="flex-row items-center gap-2">
              <Icon as={biometricType === 'Face ID' ? ScanFace : FingerprintPattern} size={24} strokeWidth={1.5} />
              <Text className="font-quicksand-semibold">
                {biometricType} Authentication
              </Text>
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color={primary} />
            ) : (
              <Switch
                checked={isBiometricEnabled}
                onCheckedChange={handleBiometricSwitch}
                disabled={isLoading}
              />
            )}
          </View>
        )}
      </View>
      <View className="gap-2 py-4">
        <Text className="font-quicksand-semibold text-sm text-muted-foreground px-6">
          Appearance
        </Text>
        <Pressable
          onPress={() =>
            router.navigate("/account/settings/appearance/dark-mode")
          }
          className="bg-background active:bg-secondary/80 flex-row items-center justify-between py-4 px-6"
        >
          <View className="flex-row items-center gap-2">
            <Icon as={Moon} size={24} strokeWidth={1.5} />
            <Text className="font-quicksand-semibold">Dark Mode</Text>
          </View>
          <View className="flex-row gap-2">
            <Text className="font-quicksand-regular text-sm capitalize">
              {theme === "dark" ? "On" : theme === "light" ? "Off" : "System"}
            </Text>
            <Icon
              as={ChevronRight}
              size={24}
              color={primary}
              strokeWidth={1.5}
            />
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}