import { router, Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Platform } from "react-native";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";

const queryClient = new QueryClient();

export default function ScreenLayout() {
  const { user } = useAuth();

  return (
    <BottomSheetModalProvider>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
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
              headerStyle: {
                backgroundColor: "transparent",
              },
              headerTitle: "",
              headerShadowVisible: false,
            }}
          >
            <Stack.Protected guard={!user}>
              <Stack.Screen
                options={{
                  headerShown: false,
                }}
                name="on-boarding"
              />
              <Stack.Screen
                options={{
                  headerShown: false,
                }}
                name="(auth)"
              />
            </Stack.Protected>
            <Stack.Protected guard={!!user}>
              <Stack.Screen
                options={{
                  headerShown: false,
                }}
                name="(default)"
              />
            </Stack.Protected>
            <Stack.Screen
              name="search/name"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="search/news"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
          </Stack>
        </QueryClientProvider>
      </KeyboardProvider>
    </BottomSheetModalProvider>
  );
}
