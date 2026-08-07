import AppLogo from "@/components/app-logo";
import { Redirect, useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetworkState } from "expo-network";
import { View } from "react-native";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";

export default function Index() {
  const { getUser, lock, user, loading } = useAuth();
  const networkState = useNetworkState();

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        getUser();
      } else {
        lock();
      }
    }, [lock, user, getUser]),
  );

  return !networkState.isConnected || loading ? (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center gap-12">
        <AppLogo className="w-48 h-20" />
        <LottieView
          style={{
            width: 150,
            height: 150,
          }}
          source={require("@/assets/animations/liquid-4-dot-loader.json")}
          autoPlay
          loop
        />
      </View>
      {!networkState.isConnected && (
        <View className="absolute bottom-8 px-6">
          <Alert icon={WifiOff}>
            <AlertTitle className="font-figtree-medium">
              Network Error
            </AlertTitle>
            <AlertDescription className="text-sm font-figtree-regular">
              Something went wrong with your network connection. Please check it
              and try again.
            </AlertDescription>
          </Alert>
        </View>
      )}
    </SafeAreaView>
  ) : !user ? (
    <Redirect href="/on-boarding" />
  ) : user.user_session.required_password === 1 ? (
    <Redirect href="/login" />
  ) : (
    <Redirect href="/home" />
  );
}
