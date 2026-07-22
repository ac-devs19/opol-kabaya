import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Sdg {
  id: number;
  image: string;
}

interface NewsArticle {
  title: string;
  description: string;
  date: Date;
  image: string;
  sdg: Sdg[];
}

export default function Article() {
  const { id } = useLocalSearchParams();
  const { primary } = useAppColors();

  const getArticle = async () => {
    const { data } = await axios.get(
      `https://occ.edu.ph/api/mobile/news/article/${id}`,
    );
    return data;
  };

  const { data, isLoading } = useQuery<NewsArticle>({
    queryKey: ["news-article", id],
    queryFn: getArticle,
  });

  return isLoading ? (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color={primary} />
    </View>
  ) : (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <View className="p-6 gap-6">
        <Image
          source={{
            uri: `https://lh3.googleusercontent.com/d/${data?.image}`,
          }}
          resizeMode="contain"
          className="h-64"
        />
        <View className="flex-row items-center gap-2 flex-wrap">
          {data?.sdg.map((sdg, index) => (
            <Image
              key={index}
              source={{
                uri: `https://lh3.googleusercontent.com/d/${sdg.image}`,
              }}
              className="size-8"
            />
          ))}
        </View>
        <Text className="font-quicksand-bold text-2xl">{data?.title}</Text>
        <Text className="font-quicksand-medium">
          {new Date(data?.date ?? "").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
        <View className="border-b border-border" />
        <Text className="font-quicksand-regular">{data?.description}</Text>
      </View>
    </ScrollView>
  );
}
