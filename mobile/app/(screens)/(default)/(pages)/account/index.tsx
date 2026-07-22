import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Bell, CircleQuestionMark, Info, Settings } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth-context";

export default function Account() {
  const { user } = useAuth();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1">
        <View className="p-6 gap-10">
          <View className="items-center gap-6">
            <Image
              source={require("@/assets/images/kabaya/user.png")}
              resizeMode="contain"
              className="size-36 rounded-full"
            />
            <View className="gap-3">
              <View className="items-center">
                <Text className="font-quicksand-bold text-3xl">
                  {user?.first_name}
                </Text>
                <Text className="font-quicksand-bold text-3xl">
                  {user?.last_name}
                </Text>
              </View>
              <Text className="font-quicksand-medium text-muted-foreground text-center">
                {user?.id_number}
              </Text>
            </View>
          </View>
          <View className="gap-4">
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => router.navigate("/account/settings")}
                activeOpacity={0.7}
                className="flex-1 bg-secondary p-8 rounded-3xl gap-3"
              >
                <Icon as={Settings} size={24} strokeWidth={1.5} />
                <Text className="font-quicksand-semibold">Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 bg-secondary p-8 rounded-3xl gap-3"
              >
                <Icon as={Bell} size={24} strokeWidth={1.5} />
                <Text className="font-quicksand-semibold">Notifications</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-4">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 bg-secondary p-8 rounded-3xl gap-3"
              >
                <Icon as={CircleQuestionMark} size={24} strokeWidth={1.5} />
                <Text className="font-quicksand-semibold">FAQs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 bg-secondary p-8 rounded-3xl gap-3"
              >
                <Icon as={Info} size={24} strokeWidth={1.5} />
                <Text className="font-quicksand-semibold">About Us</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
