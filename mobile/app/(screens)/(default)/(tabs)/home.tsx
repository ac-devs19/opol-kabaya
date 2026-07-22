import axios from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";
import { ChevronsDownUp, ChevronsUpDown, MoveRight } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTabBar } from "@/hooks/useTabBar";
import { useAuth } from "@/contexts/auth-context";

interface LinkSystem {
  label: string;
  icon: string;
  href: string;
  is_active: string;
}

export default function Home() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
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

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const getLinkSystem = async () => {
    const { data } = await axios.get("/link-systems");
    return data;
  };

  const { data, isLoading, refetch, isRefetching } = useQuery<LinkSystem[]>({
    queryKey: ["link-systems"],
    queryFn: getLinkSystem,
  });

  const visibleItems = expanded ? data : data?.slice(0, 7);

  const getNews = async () => {
    const { data } = await axios.get("https://occ.edu.ph/api/mobile/news");
    return data;
  };

  const { data: newsData } = useQuery({
    queryKey: ["home-news"],
    queryFn: getNews,
  });

  const news = newsData?.data?.slice(0, 2);

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View className="gap-8 pb-20">
        <View className="px-5">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="font-quicksand-bold text-2xl">
                {getGreeting()},
              </Text>
              <Text className="font-quicksand-bold text-2xl">
                {user?.first_name}
              </Text>
            </View>
            <Image
              resizeMode="contain"
              source={require("@/assets/images/kabaya/wonderful-opol.png")}
              className="size-[120px]"
            />
          </View>
        </View>
        <View className="flex-row flex-wrap px-3">
          {visibleItems?.map((item, index) => (
            <View key={index} className="w-1/4 p-2 items-center gap-2">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/webview",
                    params: { url: item.href },
                  })
                }
                activeOpacity={0.7}
                className="border-2 border-primary w-full aspect-square rounded-full items-center justify-center overflow-hidden"
              >
                <Image
                  resizeMode="contain"
                  source={{
                    uri: `http://127.0.0.1:8000/storage/${item.icon}`,
                  }}
                  className="size-full"
                />
              </TouchableOpacity>
              <Text
                numberOfLines={2}
                className="text-center font-quicksand-medium text-xs"
              >
                {item.label}
              </Text>
            </View>
          ))}
          {data && data?.length > 7 && (
            <View className="w-1/4 p-2 items-center gap-2">
              <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
                className="bg-secondary w-full aspect-square rounded-full items-center justify-center overflow-hidden"
              >
                <Icon
                  as={expanded ? ChevronsDownUp : ChevronsUpDown}
                  size={22}
                  strokeWidth={1.5}
                  className="text-primary"
                />
              </TouchableOpacity>
              <Text
                numberOfLines={2}
                className="text-center font-quicksand-medium text-xs"
              >
                {expanded ? "Show Less" : "Show More"}
              </Text>
            </View>
          )}
        </View>
        <View className="gap-2">
          <View className="gap-1 px-5">
            <Text className="font-quicksand-bold text-lg">
              Discover Latest News
            </Text>
            <Text className="font-quicksand-regular text-sm text-muted-foreground">
              Latest news and announcement for Opol
            </Text>
          </View>
          <View className="gap-4">
            {news?.[0] && (
              <Pressable
                onPress={() => router.navigate(`/news/article/${news[0].id}`)}
                className="gap-2 border-b border-muted pb-4"
              >
                <Image
                  source={{
                    uri: `https://lh3.googleusercontent.com/d/${news[0].image}`,
                  }}
                  resizeMode="contain"
                  className="h-64"
                />
                <View className="px-5 gap-2">
                  <Text className="font-quicksand-bold line-clamp-3">
                    {news[0].title}
                  </Text>
                  <Text className="font-quicksand-medium text-sm">
                    {new Date(news[0].date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </Pressable>
            )}
            {news?.[1] && (
              <Pressable
                onPress={() => router.navigate(`/news/article/${news[1].id}`)}
                className="px-5 gap-4 border-b border-muted pb-4"
              >
                <View className="flex-row gap-4">
                  <Text className="flex-1 font-quicksand-semibold line-clamp-3">
                    {news[1].title}
                  </Text>
                  <Image
                    source={{
                      uri: `https://lh3.googleusercontent.com/d/${news[1].image}`,
                    }}
                    className="size-20 rounded-xl"
                  />
                </View>
                <Text className="font-quicksand-medium text-sm">
                  {new Date(news[1].date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </Pressable>
            )}
            <View className="flex-row justify-end px-5">
              <Button
                onPress={() => router.push("/news")}
                variant="secondary"
                size="sm"
                className="rounded-full"
              >
                <Text className="font-quicksand-medium text-sm">See More</Text>
                <MoveRight strokeWidth={1.5} />
              </Button>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
