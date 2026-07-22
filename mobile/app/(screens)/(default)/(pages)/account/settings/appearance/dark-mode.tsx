import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import { useThemeStore } from "@/services/theme-storage";
import { Check } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function DarkMode() {
  const { theme, setTheme } = useThemeStore();
  const { primary } = useAppColors();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <View className="p-5 gap-2">
        <View className="bg-secondary p-4 gap-4 rounded-3xl">
          {["dark", "light", "system"].map((mode) => (
            <TouchableOpacity
              key={mode}
              activeOpacity={0.7}
              onPress={() => setTheme(mode as any)}
              className="bg-background p-4 rounded-full flex-row items-center justify-between"
            >
              <Text className="font-quicksand-semibold">
                {mode === "dark" ? "On" : mode === "light" ? "Off" : "System"}
              </Text>
              {theme === mode && (
                <Icon as={Check} size={24} color={primary} strokeWidth={1.5} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text className="font-quicksand-medium text-sm">
          If system is selected, Kayaba App will automatically adjust your
          appearance based on your device&apos;s system settings.
        </Text>
      </View>
    </ScrollView>
  );
}
