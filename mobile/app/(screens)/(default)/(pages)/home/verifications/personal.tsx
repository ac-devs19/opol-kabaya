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
import { maritalStatuses, religions, suffixs } from "@/components/others";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import DatePicker from "@/components/date-picker";

export default function Personal() {
  const { user, getUser } = useAuth();

  const formSchema = z.object({
    first_name: z.string().nonempty("The first name field is required."),
    suffix: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().nonempty("The last name field is required."),
    birth_date: z.date(),
    sex: z.string().nonempty("The sex field is required."),
    marital_status: z
      .string()
      .nonempty("The marital status field is required."),
    religion: z.string().nonempty("The religion field is required."),
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
      birth_date: undefined,
      sex: "",
      marital_status: "",
      religion: "",
    },
  });

  useEffect(() => {
    reset({
      first_name: user?.first_name ?? "",
      suffix: user?.suffix ?? "",
      middle_name: user?.middle_name ?? "",
      last_name: user?.last_name ?? "",
      birth_date: user?.birth_date ? new Date(user.birth_date) : undefined,
      sex: user?.sex ?? "",
      marital_status: user?.marital_status ?? "",
      religion: user?.religion ?? "",
    });
  }, [user, reset]);

  const handleNext = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/verification/personal", {
        ...data,
        birth_date: data.birth_date.toISOString().split("T")[0],
      });
      await getUser();
      router.push("/home/verifications/address");
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
            <View className="flex-1 h-2 bg-muted rounded-full" />
            <View className="flex-1 h-2 bg-muted rounded-full" />
          </View>
          <View className="gap-3">
            <Text className="font-quicksand-bold text-2xl">
              Personal Information
            </Text>
            <Text className="text-sm text-muted-foreground font-quicksand-regular">
              Please fill out your personal details below
            </Text>
          </View>
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
              name="birth_date"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  onChange={onChange}
                  value={value}
                  label="Birth Date"
                />
              )}
            />
            <Controller
              control={control}
              name="sex"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Sex"
                  placeholder="Select"
                  items={[
                    {
                      label: "Male",
                      value: "Male",
                    },
                    {
                      label: "Female",
                      value: "Female",
                    },
                  ]}
                  value={value}
                  onChange={onChange}
                  error={errors.sex?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="marital_status"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Marital Status"
                  placeholder="Select"
                  items={maritalStatuses}
                  value={value}
                  onChange={onChange}
                  error={errors.marital_status?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="religion"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Religion"
                  placeholder="Select"
                  items={religions}
                  value={value}
                  onChange={onChange}
                  error={errors.religion?.message}
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
