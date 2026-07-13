import AppLogo from "@/components/app-logo";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { router } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";

export default function SearchName() {
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView className="flex-1 p-6">
        <View className="flex-1">
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Input
                placeholder="Search your name..."
                autoFocus
                className="rounded-full px-4"
              />
            </View>
            <Button
              onPress={() => router.back()}
              variant="secondary"
              size="icon"
              className="rounded-full"
            >
              <Icon as={X} size={24} strokeWidth={1.5} />
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
