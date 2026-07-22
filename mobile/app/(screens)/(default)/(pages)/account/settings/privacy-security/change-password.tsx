import AppLogo from "@/components/app-logo";
import Button from "@/components/button";
import { Button as IconButton } from "@/components/ui/button";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { FingerprintPattern, ScanFace } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/contexts/auth-context";

export default function ChangePassword() {
  const { } = useAuth();

  const formSchema = z
    .object({
      current_password: z
        .string()
        .nonempty("The current password field is required."),
      password: z.string().nonempty("The password field is required."),
      password_confirmation: z
        .string()
        .nonempty("The password confirmation field is required."),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "The password confirmation does not match.",
      path: ["password_confirmation"],
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <View className="flex-1 p-6 gap-12 justify-between">
        <View className="gap-6">
          <Controller
            control={control}
            name="current_password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.current_password?.message}
                label="Current password"
                placeholder="Your current password"
                secureTextEntry
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
                label="New password"
                placeholder="Create new password"
                secureTextEntry
              />
            )}
          />
          <Controller
            control={control}
            name="password_confirmation"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password_confirmation?.message}
                label="Password confirmation"
                placeholder="Verify password"
                secureTextEntry
              />
            )}
          />
        </View>
        <Button onPress={handleSubmit(onSubmit)} label="Save Changes" />
      </View>
    </KeyboardAwareScrollView>
  );
}
