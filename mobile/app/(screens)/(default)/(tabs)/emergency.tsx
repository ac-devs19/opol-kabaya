import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Copy, Flame, Hospital, Phone } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Emergency() {
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View className="p-5 gap-4">
          <View className="bg-secondary p-4 rounded-3xl gap-4">
            <Text className="font-quicksand-semibold">Hotlines</Text>
            <View className="bg-background p-4 rounded-full flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold">Smart:</Text>
                <Text className="font-quicksand-semibold text-muted-foreground">
                  0912 345 6789
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Icon
                    as={Phone}
                    size={18}
                    strokeWidth={1.5}
                    className="text-primary"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Icon as={Copy} size={18} strokeWidth={1.5} />
                </Button>
              </View>
            </View>
            <View className="bg-background p-4 rounded-full flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold">Globe:</Text>
                <Text className="font-quicksand-semibold text-muted-foreground">
                  0912 345 6789
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Icon
                    as={Phone}
                    size={18}
                    strokeWidth={1.5}
                    className="text-primary"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Icon as={Copy} size={18} strokeWidth={1.5} />
                </Button>
              </View>
            </View>
          </View>
          <View className="flex-row gap-4">
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 flex-row items-center gap-2 bg-secondary rounded-3xl h-20 p-4"
            >
              <Icon
                as={Hospital}
                size={20}
                strokeWidth={1.5}
                className="text-emerald-500"
              />
              <Text className="font-quicksand-medium text-sm">Hospitals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 flex-row items-center gap-2 bg-secondary rounded-3xl h-20 p-4"
            >
              <Icon
                as={Flame}
                size={20}
                strokeWidth={1.5}
                className="text-red-500"
              />
              <Text className="font-quicksand-medium text-sm">
                Fire Protection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
