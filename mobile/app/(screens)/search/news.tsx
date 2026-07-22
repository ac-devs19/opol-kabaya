import { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAppColors } from "@/lib/theme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { debounce } from "lodash";
import { Text } from "@/components/ui/text";

export default function SearchNews() {
  const { primary } = useAppColors();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const getNews = async ({ pageParam }: { pageParam: number }) => {
    const { data } = await axios.get(`https://occ.edu.ph/api/mobile/news`, {
      params: {
        page: pageParam,
        search: debouncedSearch,
      },
    });
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["search-news", debouncedSearch],
      queryFn: getNews,
      initialPageParam: 1,
      enabled: !!debouncedSearch,
      getNextPageParam: (lastPage) => {
        return lastPage.current_page < lastPage.last_page
          ? lastPage.current_page + 1
          : undefined;
      },
    });

  const newsData = data?.pages.flatMap((page) => page.data) ?? [];

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 1000),
    [],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const isTyping = search !== debouncedSearch;

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className="bg-background px-6 pt-6 pb-4 flex-row items-center gap-4">
            <View className="flex-1">
              <Input
                placeholder="Search news..."
                value={search}
                onChangeText={handleSearch}
                autoFocus
                className="rounded-full px-4"
              />
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
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        ListEmptyComponent={
          isTyping || isLoading ? (
            <ActivityIndicator color={primary} />
          ) : search ? (
            <Text className="text-center">No results found for {search}</Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={primary} className="mb-2" />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.replace(`/news/article/${item.id}`)}
            className="bg-background active:bg-secondary/80 py-4 px-6 gap-4"
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
    </SafeAreaView>
  );
}
