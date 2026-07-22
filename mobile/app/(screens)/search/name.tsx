import { ActivityIndicator, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";
import axios from "@/api/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useAppColors } from "@/lib/theme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/hooks/useStore";

export default function SearchName() {
  const { primary } = useAppColors();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { setResident } = useStore();

  const getResident = async ({ pageParam }: { pageParam: number }) => {
    const { data } = await axios.get("/get-residents", {
      params: {
        page: pageParam,
        search: debouncedSearch,
      },
    });
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["residents", debouncedSearch],
      queryFn: getResident,
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
    <SafeAreaView edges={["top"]} className="flex-1">
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className="bg-background p-6 flex-row items-center gap-3">
            <View className="flex-1">
              <Input
                placeholder="Search your name..."
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
            <View className="gap-3 px-6">
              <Text className="text-center font-quicksand-medium">
                No record found for {search}
              </Text>
              <View className="items-center gap-2">
                <Text className="font-quicksand-regular text-center text-sm">
                  If you don't have a record yet, please fill out the form.
                </Text>
                <Button className="rounded-full">
                  <Text className="font-quicksand-semibold">Fill out form</Text>
                </Button>
              </View>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={primary} /> : null
        }
        renderItem={({ item }) => (
          <AlertDialog>
            <AlertDialogTrigger className="bg-background active:bg-secondary/80 py-3 px-6 border-b border-border">
              <Text className="font-quicksand-semibold">
                {item.first_name} {item.last_name}
              </Text>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-quicksand-bold text-center text-xl">
                  Are you {item.first_name} {item.last_name}?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row mt-2">
                <AlertDialogAction
                  onPress={() => {
                    setResident(item);
                    router.back();
                  }}
                  className="flex-1 rounded-full"
                >
                  <Text className="font-quicksand-bold text-center">
                    Continue
                  </Text>
                </AlertDialogAction>
                <AlertDialogCancel className="flex-1 rounded-full">
                  <Text className="font-quicksand-bold text-center">
                    Cancel
                  </Text>
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      />
    </SafeAreaView>
  );
}
