import AppLogo from "@/components/app-logo";
import { Platform, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import axios from "@/api/axios";
import { useStore } from "@/hooks/useStore";
import { useMutation } from "@tanstack/react-query";

export default function SignIn() {
  const [isEmail, setIsEmail] = useState(false);
  const { setEmail, setIsRegister } = useStore();

  const formSchema = z
    .object({
      email: z.string().optional(),
      id_number: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (isEmail && !data.email?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "The email field is required.",
        });
      }
      if (!isEmail && !data.id_number?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["id_number"],
          message: "The ID number field is required.",
        });
      }
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
      id_number: "",
    },
  });

  const handleSignIn = useMutation({
    mutationFn: async (data: FormSchema) => {
      setIsRegister(false);
      const response = await axios.post("/sign-in", data);
      setEmail(response.data.email);
      router.push("/otp-verification");
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
          <View className="gap-6">
            {isEmail ? (
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
                    placeholder="Enter your email"
                    keyboardType="email-address"
                  />
                )}
              />
            ) : (
              <Controller
                control={control}
                name="id_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.id_number?.message}
                    label="ID Number"
                    placeholder="Enter your ID number"
                    keyboardType={
                      Platform.OS === "ios" ? "default" : "number-pad"
                    }
                  />
                )}
              />
            )}
            <View className="items-center">
              <TouchableOpacity
                onPress={() => setIsEmail(!isEmail)}
                activeOpacity={0.7}
              >
                <Text className="font-quicksand-semibold text-primary">
                  Login via {!isEmail ? "Email" : "ID Number"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
