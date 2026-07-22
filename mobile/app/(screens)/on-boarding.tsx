import AppLogo from "@/components/app-logo";
import Button from "@/components/button";
import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnBoarding() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center">
        <AppLogo className="w-48 h-20" />
      </View>
      <View className="gap-6 p-6">
        <Button
          onPress={() => router.push("/sign-up")}
          label="Start an account"
        />
        <Button
          onPress={() => router.push("/sign-in")}
          label="Sign in"
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}
