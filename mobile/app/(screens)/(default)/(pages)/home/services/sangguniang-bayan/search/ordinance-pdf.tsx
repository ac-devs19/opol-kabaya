import { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppColors } from "@/lib/theme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { debounce } from "lodash";
import { Text } from "@/components/ui/text";
import axios from "@/api/axios";
import { useStore } from "@/hooks/useStore";

interface DriveFile {
  id: string;
  name: string;
}

interface PdfResponse {
  files: DriveFile[];
  nextPageToken: string | null;
}

export default function SearchOrdinancePdf() {
  const { primary } = useAppColors();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { ordinance, setOrdinance } = useStore();

  const getOrdinancePdf = async ({ pageParam }: { pageParam?: string }) => {
    const { data } = await axios.get<PdfResponse>(
      `/services/sb/get-pdf/${ordinance.folder_id}`,
      {
        params: {
          ...(pageParam ? { nextPageToken: pageParam } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        },
      },
    );
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["ordinance-pdfs", debouncedSearch],
      queryFn: getOrdinancePdf,
      initialPageParam: undefined as string | undefined,
      enabled: !!debouncedSearch,
      getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
    });

  const pdf = useMemo(() => {
    return data?.pages.flatMap((page) => page.files) ?? [];
  }, [data]);

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
        data={pdf}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className="bg-background px-6 pt-6 pb-4 flex-row items-center gap-4">
            <View className="flex-1">
              <Input
                placeholder="Search..."
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
            onPress={() => {
              router.replace("/home/services/sangguniang-bayan/webview");
              setOrdinance({
                ...ordinance,
                pdf_id: item.id,
                pdf_name: item.name,
              });
            }}
            className="bg-background active:bg-secondary/80 py-4 px-5 gap-4 border-b border-muted"
          >
            <View className="flex-row gap-4 items-center">
              <Image
                source={require("@/assets/images/icons/pdf.png")}
                className="size-12 rounded-xl"
              />
              <Text className="flex-1 font-quicksand-semibold">
                {item.name}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
