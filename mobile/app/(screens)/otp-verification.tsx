import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import OtpInput from "@/components/otp-input";
import { useStore } from "@/hooks/useStore";
import axios from "@/api/axios";
import { router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { setToken } from "@/services/auth-storage";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOtpTimer } from "@/hooks/useOtpTimer";

export default function OtpVerification() {
  const { getUser, device_id, token_name } = useAuth();
  const { resident, email, setEmail, isRegister, setIsRegister, isForgot } =
    useStore();
  const { remainingTime, canResend, startTimer, updateTimer } = useOtpTimer();

  const formSchema = z.object({
    otp: z.string().nonempty("The otp field is required."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otp = watch("otp");

  const handleOtpVerification = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post("/verify-otp", {
        ...data,
        email,
        id: resident.id,
        isRegister,
        isForgot,
        device_id,
        token_name,
      });
      if (isRegister || isForgot) {
        router.dismissAll();
        router.replace("/pin");
      } else {
        await setToken(response.data.token);
        await getUser();
      }
      setEmail("");
      setIsRegister(false);
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
    handleOtpVerification.mutate(data);
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [otp]);

  useEffect(() => {
    if (canResend) {
      startTimer();
    }
  }, []);

  useEffect(() => {
    updateTimer();

    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (!canResend) return;

    // await axios.post("/resend-otp", {
    //   id: residentId,
    // });

    startTimer();
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
          <View className="flex-row gap-3">
            <View className="flex-1 h-2 bg-primary rounded-full" />
            <View className="flex-1 h-2 bg-primary rounded-full" />
            <View className="flex-1 h-2 bg-muted rounded-full" />
          </View>
          <View className="gap-6">
            <View className="gap-3">
              <Text className="font-quicksand-bold text-2xl">
                Enter One-Time-Password
              </Text>
              <Text className="text-sm text-muted-foreground font-quicksand-regular">
                Please enter the one-time-password (OTP) that we sent to{" "}
                <Text className="text-sm font-quicksand-medium">{email}</Text>
              </Text>
            </View>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1">
                  <OtpInput onChange={onChange} value={value} />
                  {errors.otp && (
                    <Text className="text-xs font-quicksand-medium text-destructive ml-3">
                      {errors.otp.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <View className="items-center">
              {canResend ? (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text className="font-quicksand-semibold text-primary">
                    Resend code
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text className="font-quicksand-regular text-muted-foreground">
                  {`Resend code in ${Math.floor(remainingTime / 60)}:${String(
                    remainingTime % 60,
                  ).padStart(2, "0")}`}
                </Text>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
