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

export default function SignUp() {
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
            <View className="flex-1 h-2 bg-muted rounded-full" />
            <View className="flex-1 h-2 bg-muted rounded-full" />
          </View>
          <AppLogo className="w-36 h-10" />
          <View className="gap-3">
            <Text className="font-quicksand-bold text-2xl">
              Let&apos;s Get Started!
            </Text>
            <Pressable onPress={() => router.push("/search/name")}>
              <View pointerEvents="none">
                <Input
                  placeholder="Search your name..."
                  className="rounded-full px-4"
                />
              </View>
            </Pressable>
          </View>
        </View>
        <View className="gap-3">
          <Text className="text-center font-quicksand-regular">
            Already registered?
          </Text>
          <Button
            onPress={() => router.push("/pin")}
            variant="outline"
            label="Login here"
          />
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
