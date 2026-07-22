import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WebViewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();

  return (
    <SafeAreaView className="flex-1">
      <WebView source={{ uri: url }} />
    </SafeAreaView>
  );
}
