import AppLogo from "@/components/app-logo";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import { router } from "expo-router";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { useOtpAlert } from "@/hooks/useOtpAlert";
import { useAuth } from "@/contexts/auth-context";
import { useLoader } from "@/hooks/useLoader";
import Input from "@/components/input";

export default function SignIn() {
  const { device_id } = useAuth();
  const { canResend, startTimer } = useOtpTimer();
  const { setOpen } = useOtpAlert();
  const { processing, setProcessing } = useLoader();

  const formSchema = z.object({
    email: z.email().nonempty("The email field is required."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSignIn = useMutation({
    mutationFn: async (data: FormSchema) => {
      setProcessing(true);
      await axios.post("/sign-in", { ...data, device_id });
      router.push({
        pathname: "/sign-in/otp-verification",
        params: {
          email: data.email,
        },
      });
    },
    onSuccess: () => {
      startTimer();
    },
    onError: (error: any) => {
      const errors = error.response.data.errors;
      if (errors) {
        Object.keys(errors).forEach((field) => {
          setError(field as keyof FormSchema, {
            type: "server",
            message: errors[field][0],
          });
        });
      }
    },
    onSettled: () => {
      setProcessing(false);
    },
  });

  const onSubmit = async (data: FormSchema) => {
    if (!canResend) {
      setOpen(true);
    } else {
      handleSignIn.mutate(data);
    }
  };

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
          <View className="gap-1">
            <Text className="font-quicksand-bold text-2xl">
              Hello, Welcome!
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-medium">Login to</Text>
              <AppLogo className="w-20 h-10" />
            </View>
          </View>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
                label="Email"
                placeholder="Your email"
                keyboardType="email-address"
              />
            )}
          />
        </View>
        <View className="gap-6">
          <Button
            onPress={handleSubmit(onSubmit)}
            label="Login"
            disabled={processing}
          />
          <View className="flex-row gap-3 items-center">
            <View className="flex-1 border-b border-muted" />
            <Text className="font-quicksand-regular">or</Text>
            <View className="flex-1 border-b border-muted" />
          </View>
          <View className="gap-3">
            <Text className="text-center font-quicksand-regular">
              Not registered yet?
            </Text>
            <Button
              onPress={() => router.replace("/sign-up")}
              variant="outline"
              label="Register your account"
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
