import AppLogo from "@/components/app-logo";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import NumberPad from "@/components/number-pad";
import PinInput from "@/components/pin-input";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Icon } from "@/components/ui/icon";
import { FingerprintPattern, ScanFace } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { useOtpAlert } from "@/hooks/useOtpAlert";

export default function Login() {
  const { getUser, logout, user, device_id } = useAuth();
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { canResend } = useOtpTimer();
  const { setOpen } = useOtpAlert();

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
      await axios.post("/login", { ...data, device_id });
      await getUser();
    },
    onError: () => {
      resetField("password");
    },
  });

  const handleBiometricLogin = useMutation({
    mutationFn: async () => {
      await axios.post("/login/biometric", { device_id });
      await getUser();
    },
    onError: (error) => {
      console.log("Biometric login failed:", error);
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

  const promptBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        setIsBiometricAvailable(true);

        if (user?.user_session?.is_biometric) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Log in to your account",
            fallbackLabel: "Use PIN",
            cancelLabel: "Cancel",
          });

          if (result.success) {
            handleBiometricLogin.mutate();
          }
        }
      }
    } catch (error) {
      console.error("Biometric error:", error);
    }
  };

  useEffect(() => {
    promptBiometric();
  }, [user?.user_session?.is_biometric]);

  const handleForgotPin = async () => {
    if (!canResend) {
      setOpen(true);
    } else {
      try {
        await axios.post("/forgot-pin");
        router.push({
          pathname: "/forgot/otp-verification",
          params: {
            mobile_number: user?.mobile_number,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const checkBiometricHardware = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const types =
            await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (
            types.includes(
              LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
            )
          ) {
            setBiometricType("Face ID");
          } else if (
            types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
          ) {
            setBiometricType("Fingerprint / Touch ID");
          } else if (
            types.includes(LocalAuthentication.AuthenticationType.IRIS)
          ) {
            setBiometricType("Iris Scan");
          }
        }
      } catch (error) {
        console.error("Error checking biometric support:", error);
      }
    };

    checkBiometricHardware();
  }, []);

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
              {isBiometricAvailable && user?.user_session.is_biometric ? (
                <View className="items-center">
                  <Button
                    onPress={promptBiometric}
                    variant="secondary"
                    className="rounded-full flex-row items-center gap-2"
                    size="sm"
                  >
                    <Icon
                      as={
                        biometricType === "Face ID"
                          ? ScanFace
                          : FingerprintPattern
                      }
                      size={24}
                      strokeWidth={1.5}
                    />
                    <Text className="font-quicksand-semibold">
                      Login with {biometricType}
                    </Text>
                  </Button>
                </View>
              ) : null}
              <NumberPad value={value} onChange={onChange} maxLength={4} />
              <View className="flex-row items-center justify-evenly">
                <TouchableOpacity onPress={handleForgotPin} activeOpacity={0.7}>
                  <Text className="font-quicksand-semibold text-primary">
                    Forgot your PIN?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logout} activeOpacity={0.7}>
                  <Text className="font-quicksand-semibold text-primary">
                    Switch Account
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
