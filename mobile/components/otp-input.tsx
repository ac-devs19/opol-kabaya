import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
};

export default function OtpInput({
  value,
  onChange,
  length = 6,
  error,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", () => {
      inputRef.current?.blur();
    });

    return () => subscription.remove();
  }, []);

  const handleChange = (text: string) => {
    const formatted = text.replace(/[^0-9]/g, "").slice(0, length);
    onChange(formatted);
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="font-quicksand-semibold">OTP</Text>
        {value.length > 0 && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleClear}>
            <Text className="font-quicksand-semibold text-destructive">
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={length}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          className="absolute opacity-0 w-0 h-0"
          autoFocus
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <View className="flex-row justify-between gap-3">
          {Array.from({ length }).map((_, index) => {
            const digit = value[index];
            const isCellFocused =
              isFocused &&
              (index === value.length ||
                (value.length === length && index === length - 1));
            return (
              <View
                key={index}
                className={cn(
                  "bg-secondary/50 flex-1 h-14 items-center justify-center rounded-2xl border",
                  isCellFocused ? "border-primary" : "border-border",
                )}
              >
                <Text className="text-xl font-quicksand-semibold">
                  {digit ?? ""}
                </Text>
              </View>
            );
          })}
        </View>
      </Pressable>
      {error && (
        <Text className="text-xs font-quicksand-medium text-destructive ml-3">
          {error}
        </Text>
      )}
    </View>
  );
}
