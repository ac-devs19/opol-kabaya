import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useStore } from "@/hooks/useStore";
import { router, Stack } from "expo-router";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";
import { Platform } from "react-native";

export default function SangguniangBayanLayout() {
  const { ordinance } = useStore();

  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
        headerLeft: () => {
          if (router.canGoBack()) {
            return (
              <Button
                variant="secondary"
                size="icon"
                onPress={() => router.back()}
                className="rounded-full"
              >
                <Icon
                  as={Platform.OS === "ios" ? ChevronLeft : ArrowLeft}
                  size={24}
                  strokeWidth={1.5}
                  className="text-primary"
                />
              </Button>
            );
          }
        },
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTitleStyle: {
          fontFamily: "Quicksand-SemiBold",
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Sangguniang Bayan",
        }}
      />
      <Stack.Screen
        name="ordinance-pdf"
        options={{
          title: ordinance.folder_name,
        }}
      />
      <Stack.Screen
        name="search/ordinance-folder"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="search/ordinance-pdf"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="webview"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
