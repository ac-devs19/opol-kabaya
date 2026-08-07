import { useAuth } from "@/contexts/auth-context";
import { Stack } from "expo-router";

export default function HomeLayout() {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={user?.user_verified_at === null ? true : false}>
        <Stack.Screen name="verifications" />
        <Stack.Screen name="services" />
      </Stack.Protected>
    </Stack>
  );
}
