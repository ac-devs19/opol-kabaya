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
import InputPhone from "@/components/input-phone";

export default function SignIn() {
  const formSchema = z.object({
    mobile_number: z
      .string()
      .nonempty("The mobile number field is required.")
      .regex(/^[0-9]+$/, "The mobile number must be numeric.")
      .length(10, "The mobile number must be exactly 10 digits.")
      .regex(/^9\d{9}$/, "The mobile number must start with 9."),
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
      mobile_number: "",
    },
  });

  const handleSignIn = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/sign-in", data);
      router.push({
        pathname: "/sign-in/otp-verification",
        params: {
          mobile_number: data.mobile_number,
        },
      });
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
  });

  const onSubmit = async (data: FormSchema) => {
    handleSignIn.mutate(data);
  };

  const processing = handleSignIn.isPending;

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
            name="mobile_number"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputPhone
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.mobile_number?.message}
              />
            )}
          />
        </View>
        <View className="gap-6">
          <Button
            onPress={handleSubmit(onSubmit)}
            label="Login"
            loading={processing}
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
