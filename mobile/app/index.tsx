import Button from "@/components/button";
import { router } from "expo-router";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button onPress={() => router.push("/sign-in")} label="Click" />
    </View>
  );
}
