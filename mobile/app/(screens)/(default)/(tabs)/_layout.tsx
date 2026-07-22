import AppLogo from "@/components/app-logo";
import TabBar from "@/components/tab-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs } from "expo-router";
import { Bell } from "lucide-react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Quicksand-SemiBold",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        options={{
          header: () => (
            <SafeAreaView edges={["top"]}>
              <View className="p-6 flex-row justify-between items-center">
                <AppLogo />
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <Icon as={Bell} size={24} strokeWidth={1.5} />
                </Button>
              </View>
            </SafeAreaView>
          ),
        }}
        name="home"
      />
      <Tabs.Screen
        options={{
          title: "News",
        }}
        name="news"
      />
      <Tabs.Screen
        options={{
          title: "Emergency",
        }}
        name="emergency"
      />
    </Tabs>
  );
}
