import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";
import { Button as Btn } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SquarePen } from "lucide-react-native";

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
          <View className="gap-3">
            <Text className="font-quicksand-bold text-2xl">
              Check Information
            </Text>
            <Text className="text-sm text-muted-foreground font-quicksand-regular">
              Please make sure the details are correct
            </Text>
          </View>
          <View className="flex-1 gap-6">
            <View className="gap-3">
              <View className="border-b border-border pb-2 flex-row items-center justify-between">
                <Text className="font-quicksand-semibold">
                  Personal Information
                </Text>
                <Btn
                  onPress={() => {
                    router.dismissAll();
                    router.replace("/home/verifications/personal");
                  }}
                  variant="link"
                  size="sm"
                  className="rounded-full px-2 py-1"
                >
                  <Text className="font-quicksand-semibold text-xs">
                    Edit Details
                  </Text>
                  <Icon as={SquarePen} strokeWidth={1.5} />
                </Btn>
              </View>
              <View className="flex-row">
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-medium text-muted-foreground">
                    First Name:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Middle Name:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Last Name:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Suffix:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Birth Date:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Sex:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Marital Status:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Religion:
                  </Text>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-semibold">
                    {user?.first_name}
                  </Text>
                  <Text className="font-quicksand-semibold">
                    {user?.middle_name ?? "N/A"}
                  </Text>
                  <Text className="font-quicksand-semibold">
                    {user?.last_name}
                  </Text>
                  <Text className="font-quicksand-semibold">
                    {user?.suffix ?? "N/A"}
                  </Text>
                  <Text className="font-quicksand-semibold">
                    {user?.birth_date
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(user.birth_date))
                      : undefined}
                  </Text>
                  <Text className="font-quicksand-semibold">{user?.sex}</Text>
                  <Text className="font-quicksand-semibold">
                    {user?.marital_status}
                  </Text>
                  <Text className="font-quicksand-semibold">
                    {user?.religion}
                  </Text>
                </View>
              </View>
            </View>
            <View className="gap-3">
              <View className="border-b border-border pb-2 flex-row items-center justify-between">
                <Text className="font-quicksand-semibold">
                  Address Information
                </Text>
                <Btn
                  onPress={() => router.back()}
                  variant="link"
                  size="sm"
                  className="rounded-full px-2 py-1"
                >
                  <Text className="font-quicksand-semibold text-xs">
                    Edit Details
                  </Text>
                  <Icon as={SquarePen} strokeWidth={1.5} />
                </Btn>
              </View>
              <View className="flex-row">
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Province:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Municipality:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Barangay:
                  </Text>
                  <Text className="font-quicksand-medium text-muted-foreground">
                    Postal Code:
                  </Text>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="font-quicksand-semibold">
                    {user?.province}
                  </Text>
                  <Text className="font-quicksand-semibold">
                    {user?.municipality}
                  </Text>
                  <Text className="font-quicksand-semibold">
                    {user?.barangay}
                  </Text>
                  <Text className="font-quicksand-semibold">
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
