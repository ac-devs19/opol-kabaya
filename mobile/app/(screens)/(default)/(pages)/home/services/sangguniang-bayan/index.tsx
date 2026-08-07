import axios from "@/api/axios";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import { useStore } from "@/hooks/useStore";
import { useAppColors } from "@/lib/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  View,
} from "react-native";

interface DriveFile {
  id: string;
  name: string;
}

interface FolderResponse {
  files: DriveFile[];
  nextPageToken: string | null;
}

export default function SangguniangBayan() {
  const { primary } = useAppColors();
  const { setOrdinance } = useStore();

  const getOrdinanceFolder = async ({ pageParam }: { pageParam?: string }) => {
    const { data } = await axios.get<FolderResponse>(
      "/services/sb/get-folder",
      {
        params: {
          ...(pageParam ? { nextPageToken: pageParam } : {}),
        },
      },
    );
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["ordinance-folders"],
      queryFn: getOrdinanceFolder,
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
    });

  const folders = useMemo(() => {
    return data?.pages.flatMap((page) => page.files) ?? [];
  }, [data]);

  return isLoading ? (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color={primary} />
    </View>
  ) : (
    <FlatList
      data={folders}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <View className="bg-background px-5 pt-5 pb-4">
          <Pressable
            onPress={() =>
              router.push(
                "/home/services/sangguniang-bayan/search/ordinance-folder",
              )
            }
          >
            <View pointerEvents="none">
              <Input placeholder="Search..." className="rounded-full px-4" />
            </View>
          </Pressable>
        </View>
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color={primary} className="my-4" />
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => {
            router.push("/home/services/sangguniang-bayan/ordinance-pdf");
            setOrdinance({
              folder_id: item.id,
              folder_name: item.name,
            });
          }}
          className="bg-background active:bg-secondary/80 py-4 px-5 gap-4 border-b border-muted"
        >
          <View className="flex-row gap-4 items-center">
            <Image
              source={require("@/assets/images/icons/folder.png")}
              className="size-12 rounded-xl"
            />
            <Text className="flex-1 font-quicksand-semibold">{item.name}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}
