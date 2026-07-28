import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import MPin from "@/components/mpin";
import { useEffect } from "react";

export default function ResetPin() {
  const { device_id, getUser } = useAuth();

  const formSchema = z.object({
    password: z.string().nonempty("The pin field is required."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const { control, handleSubmit, setError, watch } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const password = watch("password");

  const handleCreatePin = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/forgot/reset-pin", {
        ...data,
        device_id,
      });
      await getUser();
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
    handleCreatePin.mutate(data);
  };

  useEffect(() => {
    if (password.length === 4) {
      handleSubmit(onSubmit)();
    }
  }, [password]);

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
            <View className="flex-1 h-2 bg-primary rounded-full" />
          </View>
          <View className="gap-6">
            <View className="gap-3">
              <Text className="font-quicksand-bold text-2xl">Reset PIN</Text>
              <Text className="text-sm text-muted-foreground font-quicksand-regular">
                Please make your new PIN
              </Text>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <MPin onChange={onChange} value={value} />
              )}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
