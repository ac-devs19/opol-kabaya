import { WebView } from "react-native-webview";
import { useStore } from "@/hooks/useStore";
import axios from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";
import { useAppColors } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";

export default function WebViewScreen() {
  const { ordinance } = useStore();
  const { primary } = useAppColors();

  const getOrdinancePdf = async () => {
    const { data } = await axios.get(
      `/services/sb/preview-pdf/${ordinance.pdf_id}`,
    );
    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["ordinance-pdf", ordinance.pdf_id],
    queryFn: getOrdinancePdf,
  });

  return isLoading ? (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color={primary} />
    </View>
  ) : (
    <View className="flex-1">
      <View className="p-6 flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="font-quicksand-semibold line-clamp-1">
            {ordinance.pdf_name}
          </Text>
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
      <WebView source={{ uri: data.previewLink }} />
    </View>
  );
}
