import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import { router } from "expo-router";
import {
  ChevronRight,
  FingerprintPattern,
  LockKeyholeOpen,
  Moon,
  User,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/services/theme-storage";
import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "@/contexts/auth-context";

export default function Settings() {
  // const { biometrics } = useAuth();
  const { primary } = useAppColors();
  const { theme } = useThemeStore();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // useEffect(() => {
  //   const checkBiometric = async () => {
  //     const hasHardware = await LocalAuthentication.hasHardwareAsync();
  //     const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  //     setIsBiometricAvailable(hasHardware && isEnrolled);
  //   };

  //   checkBiometric();
  // }, []);

  // const handleBiometricSwitch = async (value: boolean) => {
  //   if (value) {
  //     const result = await LocalAuthentication.authenticateAsync({
  //       promptMessage: "Enable biometrics authentication",
  //     });

  //     if (!result.success) return;

  //     await biometrics({ is_biometric: 1 });

  //     setIsBiometricEnabled(true);
  //   } else {
  //     await biometrics({ is_biometric: 0 });

  //     setIsBiometricEnabled(false);
  //   }
  // };

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
              "/account/settings/privacy-security/personal-information",
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
              "/account/settings/privacy-security/change-password",
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
          <Pressable className="bg-background active:bg-secondary/80 flex-row items-center justify-between py-4 px-6">
            <View className="flex-row items-center gap-2">
              <Icon as={FingerprintPattern} size={24} strokeWidth={1.5} />
              <Text className="font-quicksand-semibold">
                Biometrics Authentication
              </Text>
            </View>
            {/* <Switch
              checked={isBiometricEnabled}
              onCheckedChange={handleBiometricSwitch}
            /> */}
          </Pressable>
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
