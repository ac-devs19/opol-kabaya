import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import { Button as Btn } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";

export default function CheckInformation() {
  const { user } = useAuth();

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1 p-6 gap-12">
        <View className="flex-1 gap-12">
          <Text className="font-quicksand-bold text-2xl">
            Check Information
          </Text>
          <View className="flex-1 gap-6">
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-quicksand-semibold text-lg text-muted-foreground">
                  Personal Information
                </Text>
                <Btn variant="link">
                  <Text>Edit</Text>
                </Btn>
              </View>
              <View className="flex-row">
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-semibold">First Name:</Text>
                  <Text className="font-quicksand-semibold">Middle Name:</Text>
                  <Text className="font-quicksand-semibold">Last Name:</Text>
                  <Text className="font-quicksand-semibold">Suffix:</Text>
                  <Text className="font-quicksand-semibold">Birth Date:</Text>
                  <Text className="font-quicksand-semibold">Sex:</Text>
                  <Text className="font-quicksand-semibold">
                    Marital Status:
                  </Text>
                  <Text className="font-quicksand-semibold">Religion:</Text>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-medium">
                    {user?.first_name}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.middle_name ?? "N/A"}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.last_name}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.suffix ?? "N/A"}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.birth_date
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(user.birth_date))
                      : undefined}
                  </Text>
                  <Text className="font-quicksand-medium">{user?.sex}</Text>
                  <Text className="font-quicksand-medium">
                    {user?.marital_status}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.religion}
                  </Text>
                </View>
              </View>
            </View>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-quicksand-semibold text-lg text-muted-foreground">
                  Address Information
                </Text>
                <Btn variant="link">
                  <Text>Edit</Text>
                </Btn>
              </View>
              <View className="flex-row">
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-semibold">Province:</Text>
                  <Text className="font-quicksand-semibold">Municipality:</Text>
                  <Text className="font-quicksand-semibold">Barangay:</Text>
                  <Text className="font-quicksand-semibold">Postal Code:</Text>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-medium">
                    {user?.province}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.municipality}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.barangay}
                  </Text>
                  <Text className="font-quicksand-medium">
                    {user?.postal_code}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <Button
          label="Confirm"
          onPress={() => router.push("/home/verifications/identification")}
        />
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
