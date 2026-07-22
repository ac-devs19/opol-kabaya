import AppLogo from "@/components/app-logo";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import NumberPad from "@/components/number-pad";
import PinInput from "@/components/pin-input";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useStore } from "@/hooks/useStore";

export default function Login() {
  const { getUser, logout, user } = useAuth();
  const { setIsForgot, setEmail } = useStore();

  const formSchema = z.object({
    password: z.string().nonempty(),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const { control, handleSubmit, watch, resetField } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const password = watch("password");

  const handleLogin = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/login", data);
      await getUser();
    },
    onError: () => {
      resetField("password");
    },
  });

  const onSubmit = async (data: FormSchema) => {
    handleLogin.mutate(data);
  };

  useEffect(() => {
    if (password.length === 4) {
      handleSubmit(onSubmit)();
    }
  }, [password]);

  const handleForgotPin = async () => {
    try {
      setIsForgot(true);
      await axios.post("/forgot-pin");
      setEmail(user?.email);
      router.push("/otp-verification");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <SafeAreaView className="flex-1 gap-12">
            <View className="flex-1 p-6 gap-12">
              <View className="items-end">
                <TouchableOpacity onPress={logout} activeOpacity={0.7}>
                  <Text className="font-quicksand-semibold text-primary">
                    Switch Account
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1 items-center justify-center gap-3">
                <View className="items-center">
                  <AppLogo className="w-48 h-20" />
                  <View className="gap-1 items-center">
                    <Text className="font-quicksand-bold text-xl">
                      Welcome Back!
                    </Text>
                    <Text className="font-quicksand-bold text-2xl text-primary">
                      {user?.first_name} {user?.last_name}
                    </Text>
                  </View>
                </View>
                <Text className="font-quicksand-semibold text-muted-foreground">
                  Enter your PIN
                </Text>
                <View className="w-full">
                  <PinInput
                    value={value}
                    length={4}
                    error={!!handleLogin.isError}
                  />
                </View>
              </View>
            </View>
            <View className="gap-6">
              <NumberPad value={value} onChange={onChange} maxLength={4} />
              <View className="items-center">
                <TouchableOpacity onPress={handleForgotPin} activeOpacity={0.7}>
                  <Text className="font-quicksand-semibold text-primary">
                    Forgot your PIN?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        )}
      />
    </ScrollView>
  );
}
