import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import OtpInput from "@/components/otp-input";
import axios from "@/api/axios";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { useLoader } from "@/hooks/useLoader";
import { Icon } from "@/components/ui/icon";
import { Info } from "lucide-react-native";

export default function OtpVerification() {
  const { email } = useLocalSearchParams();
  const { remainingTime, canResend, startTimer, updateTimer, resetTimer } =
    useOtpTimer();
  const { processing, setProcessing } = useLoader();

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
      setProcessing(true);
      await axios.post("/sign-up/verify-otp", {
        ...data,
        email,
      });
      router.dismissAll();
      router.replace({
        pathname: "/sign-up/create-pin",
        params: {
          email,
        },
      });
    },
    onSuccess: () => {
      resetTimer();
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
    handleOtpVerification.mutate(data);
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [otp]);

  useEffect(() => {
    updateTimer();

    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      await axios.post("/resend-otp", {
        email,
      });
    },
    onSuccess: () => {
      startTimer();
    },
    onSettled: () => {
      setProcessing(false);
    },
  });

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
                <OtpInput
                  onChange={onChange}
                  value={value}
                  error={errors.otp?.message}
                />
              )}
            />
            <View className="items-center">
              {canResend ? (
                <TouchableOpacity
                  onPress={() => handleResend.mutate()}
                  activeOpacity={0.7}
                  disabled={processing}
                >
                  <Text className="font-quicksand-semibold text-primary">
                    Resend code
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text className="font-quicksand-regular text-muted-foreground">
                  {`Resend code in ${
                    Math.floor(remainingTime / 60) > 0
                      ? `${Math.floor(remainingTime / 60)} minute${Math.floor(remainingTime / 60) === 1 ? "" : "s"} `
                      : ""
                  }${remainingTime % 60} second${remainingTime % 60 <= 1 ? "" : "s"}`}
                </Text>
              )}
            </View>
          </View>
          <View className="border border-border p-4 rounded-3xl bg-primary-foreground">
            <View className="flex-row gap-2">
              <Icon
                as={Info}
                className="text-primary"
                size={24}
                strokeWidth={1.5}
              />
              <View className="flex-1">
                <Text className="text-primary font-quicksand-medium text-sm">
                  Kindly wait for at least{" "}
                  <Text className="text-primary font-quicksand-bold text-sm">
                    3 minutes
                  </Text>{" "}
                  for the{" "}
                  <Text className="text-primary font-quicksand-bold text-sm">
                    OTP
                  </Text>{" "}
                  to arrive. Sometimes, there may be delays in receiving it.
                  Thank you for your patience.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
