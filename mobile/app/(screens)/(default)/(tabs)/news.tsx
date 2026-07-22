import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import { useTabBar } from "@/hooks/useTabBar";
import { useAppColors } from "@/lib/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { useRef } from "react";
import {
  ActivityIndicator,
  Image,
  FlatList,
  View,
  Pressable,
} from "react-native";

export default function News() {
  const { primary } = useAppColors();
  const setVisible = useTabBar((s) => s.setVisible);

  const lastOffset = useRef(0);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset > lastOffset.current + 10) {
      setVisible(false);
    } else if (currentOffset < lastOffset.current - 10) {
      setVisible(true);
    }

    lastOffset.current = currentOffset;
  };

  const getNews = async ({ pageParam }: { pageParam: number }) => {
    const { data } = await axios.get("https://occ.edu.ph/api/mobile/news", {
      params: {
        page: pageParam,
      },
    });
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["news"],
      queryFn: getNews,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.current_page < lastPage.last_page
          ? lastPage.current_page + 1
          : undefined;
      },
    });

  const newsData = data?.pages.flatMap((page) => page.data) ?? [];

  return isLoading ? (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color={primary} />
    </View>
  ) : (
    <FlatList
      onScroll={handleScroll}
      scrollEventThrottle={16}
      data={newsData}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <View className="bg-background px-5 pb-4">
          <Pressable onPress={() => router.navigate("/search/news")}>
            <View pointerEvents="none">
              <Input
                placeholder="Search news..."
                className="rounded-full px-4"
              />
            </View>
          </Pressable>
        </View>
      }
      onEndReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color={primary} className="mb-2" />
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.navigate(`/news/article/${item.id}`)}
          className="bg-background active:bg-secondary/80 py-4 px-5 gap-4 border-b border-muted"
        >
          <Text className="font-quicksand-medium">
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <View className="flex-row gap-4">
            <Text className="flex-1 font-quicksand-semibold line-clamp-3">
              {item.title}
            </Text>
            <Image
              source={{
                uri: `https://lh3.googleusercontent.com/d/${item.image}`,
              }}
              className="size-20 rounded-xl"
            />
          </View>
        </Pressable>
      )}
    />
  );
}
