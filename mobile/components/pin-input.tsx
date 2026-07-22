import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

type PinInputProps = {
  value: string;
  length?: number;
  error?: boolean;
};

export default function PinInput({
  value,
  length = 4,
  error = false,
}: PinInputProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (error) {
      translateX.value = withSequence(
        withTiming(-12, { duration: 35 }),
        withTiming(12, { duration: 35 }),
        withTiming(-10, { duration: 35 }),
        withTiming(10, { duration: 35 }),
        withTiming(-6, { duration: 35 }),
        withTiming(6, { duration: 35 }),
        withTiming(0, { duration: 35 }),
      );
    }
  }, [error]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={animatedStyle} className="flex-row justify-evenly">
      {Array.from({ length }).map((_, index) => {
        const filled = index < value.length;
        return (
          <View
            key={index}
            className={cn(
              "size-5 rounded-full border border-border",
              filled ? "bg-primary" : "bg-secondary",
            )}
          />
        );
      })}
    </Animated.View>
  );
}
