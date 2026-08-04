import AppLogo from "@/components/app-logo";
import { Alert, Pressable, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import { router } from "expo-router";
import Select from "@/components/select";
import { suffixs } from "@/components/others";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "@/hooks/useStore";
import { useEffect } from "react";
import InputPhone from "@/components/input-phone";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { useOtpAlert } from "@/hooks/useOtpAlert";

export default function SignUp() {
  const { resident, setResident } = useStore();
  const { canResend } = useOtpTimer()
  const { setOpen } = useOtpAlert()

  const formSchema = z.object({
    first_name: z.string().nonempty("The first name field is required."),
    suffix: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().nonempty("The last name field is required."),
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
    reset,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      suffix: "",
      middle_name: "",
      last_name: "",
      mobile_number: "",
    },
  });

  useEffect(() => {
    reset({
      first_name: resident.first_name ?? "",
      suffix: resident.suffix ?? "",
      middle_name: resident.middle_name ?? "",
      last_name: resident.last_name ?? "",
      mobile_number: resident.mobile_number ?? "",
    });
  }, [resident, reset]);

  const handleSignUp = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/sign-up", { ...data, id: resident.id });
      router.push({
        pathname: "/sign-up/otp-verification",
        params: {
          mobile_number: data.mobile_number,
        },
      });
      setResident();
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
      if (errors.mobile_number) {
        Alert.alert("Error!", errors.mobile_number[0]);
      }
    },
  });

  const onSubmit = async (data: FormSchema) => {
    if (!canResend) {
      setOpen(true)
    } else {
      handleSignUp.mutate(data);
    }
  };

  const showForm = resident.id !== null;
  const processing = handleSignUp.isPending;

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
          <View className="flex-row gap-3">
            <View className="flex-1 h-2 bg-primary rounded-full" />
            <View className="flex-1 h-2 bg-muted rounded-full" />
            <View className="flex-1 h-2 bg-muted rounded-full" />
          </View>
          <AppLogo className="w-36 h-10" />
          <Text className="font-quicksand-bold text-2xl">
            Let&apos;s Get Started!
          </Text>
          {!resident.id ? (
            <Pressable onPress={() => router.push("/search/name")}>
              <View pointerEvents="none">
                <Input
                  placeholder="Search your name..."
                  className="rounded-full px-4"
                />
              </View>
            </Pressable>
          ) : (
            <View className="flex-1 gap-6">
              <View className="flex-row gap-3">
                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-1">
                      <Input
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        error={errors.first_name?.message}
                        label="First name"
                        placeholder="Your first name"
                      />
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="suffix"
                  render={({ field: { onChange, value } }) => (
                    <View className="w-32">
                      <Select
                        label="Suffix"
                        placeholder="Select"
                        items={suffixs}
                        value={value}
                        onChange={onChange}
                      />
                    </View>
                  )}
                />
              </View>
              <Controller
                control={control}
                name="middle_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    label="Middle name"
                    placeholder="Your middle name"
                  />
                )}
              />
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.last_name?.message}
                    label="Last name"
                    placeholder="Your last name"
                  />
                )}
              />
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
          )}
        </View>
        {showForm && (
          <View className="flex-row items-center justify-center gap-1">
            <Text className="font-quicksand-medium">Not you?</Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/search/name");
                setResident();
              }}
              activeOpacity={0.7}
            >
              <Text className="font-quicksand-semibold text-primary">
                Search here
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="gap-6">
          {showForm && (
            <View className="gap-6">
              <Button
                onPress={handleSubmit(onSubmit)}
                label="Register"
                loading={processing}
                disabled={processing}
              />
              <View className="flex-row gap-3 items-center">
                <View className="flex-1 border-b border-muted" />
                <Text className="font-quicksand-regular">or</Text>
                <View className="flex-1 border-b border-muted" />
              </View>
            </View>
          )}
          <View className="gap-3">
            <Text className="text-center font-quicksand-regular">
              Already registered?
            </Text>
            <Button
              onPress={() => router.replace("/sign-in")}
              variant="outline"
              label="Login here"
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
