import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function ScreenLayout() {
  return (
    <BottomSheetModalProvider>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </QueryClientProvider>
      </KeyboardProvider>
    </BottomSheetModalProvider>
  );
}
