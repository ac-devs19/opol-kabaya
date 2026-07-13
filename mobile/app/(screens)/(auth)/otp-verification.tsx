import AppLogo from "@/components/app-logo";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import OtpInput from "@/components/otp-input";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1 p-6 gap-12">
        <View className="flex-1 gap-12">
          <View className="flex-row gap-3">
            <View className="flex-1 h-2 bg-primary rounded-full" />
            <View className="flex-1 h-2 bg-primary rounded-full" />
            <View className="flex-1 h-2 bg-muted rounded-full" />
          </View>
          <View className="gap-3">
            <Text className="font-quicksand-bold text-2xl">
              OTP Verification
            </Text>
            <OtpInput value={otp} onChange={setOtp} length={6} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
