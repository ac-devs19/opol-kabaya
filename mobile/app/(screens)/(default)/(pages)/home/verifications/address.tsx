import { View } from "react-native";
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
import { address } from "@/components/others";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function Address() {
  const { user, getUser } = useAuth();

  const formSchema = z.object({
    province: z.string().nonempty("The province field is required."),
    municipality: z.string().nonempty("The municipality field is required."),
    barangay: z.string().nonempty("The barangay field is required."),
    postal_code: z.string().nonempty("The postal code field is required."),
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
      province: "",
      municipality: "",
      barangay: "",
      postal_code: "",
    },
  });

  useEffect(() => {
    reset({
      province: user?.province ?? address.province,
      municipality: user?.municipality ?? address.municipality,
      barangay: user?.barangay ?? "",
      postal_code: user?.postal_code ?? address.postal_code,
    });
  }, [user, reset]);

  const handleNext = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/verification/address", data);
      await getUser();
      router.push("/home/verifications/check-information");
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
    handleNext.mutate(data);
  };

  const processing = handleNext.isPending;

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
          <Text className="font-quicksand-bold text-2xl">
            Address Information
          </Text>
          <View className="flex-1 gap-6">
            <Controller
              control={control}
              name="province"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.province?.message}
                  label="Province"
                  placeholder="Your province"
                />
              )}
            />
            <Controller
              control={control}
              name="municipality"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.municipality?.message}
                  label="Municipality"
                  placeholder="Your municipality"
                />
              )}
            />
            <Controller
              control={control}
              name="barangay"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Barangay"
                  placeholder="Select"
                  items={address.barangays}
                  value={value}
                  onChange={onChange}
                  error={errors.barangay?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="postal_code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.postal_code?.message}
                  label="Postal Code"
                  placeholder="Your postal code"
                />
              )}
            />
          </View>
        </View>
        <Button
          label="Next"
          onPress={handleSubmit(onSubmit)}
          loading={processing}
          disabled={processing}
        />
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
