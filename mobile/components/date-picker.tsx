import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useAppColors } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  mode?: "date" | "time" | "datetime";
  display?: "default" | "spinner" | "calendar" | "clock";
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select",
  mode = "date",
  display = Platform.OS === "ios" ? "spinner" : "default",
  minimumDate,
  maximumDate,
  label,
  error,
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const { card, primary } = useAppColors();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const closeResolver = useRef<(() => void) | null>(null);

  const handleOpen = useCallback(() => {
    bottomSheetModalRef.current?.present();
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    return new Promise<void>((resolve) => {
      closeResolver.current = resolve;
      bottomSheetModalRef.current?.close();
      setShow(false);
    });
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleShow = () => {
    setShow(!show);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }

    if (event.type === "dismissed") return;

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View className="gap-1">
      <Pressable
        onPress={Platform.OS === "ios" ? handleOpen : handleShow}
        className="relative"
      >
        {label && (
          <Text
            className={cn(
              "absolute top-2 left-3 z-10 text-xs font-quicksand-semibold",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {label}
          </Text>
        )}
        <View pointerEvents="none">
          <Input
            className={cn(
              "bg-secondary/50 h-14 font-quicksand-semibold pr-12 rounded-2xl border-transparent focus:border-border selection:text-primary",
              label && "pb-0 pt-4",
              error && "border-destructive",
            )}
            value={
              value
                ? new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(value)
                : ""
            }
            placeholder={placeholder}
            readOnly
          />
        </View>
      </Pressable>
      {Platform.OS === "ios" ? (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: card }}
          handleIndicatorStyle={{ backgroundColor: primary }}
          enableDynamicSizing={false}
          onDismiss={() => {
            closeResolver.current?.();
            closeResolver.current = null;
          }}
        >
          <View className="flex-row items-center justify-between mx-6 mb-6">
            <Text className="font-quicksand-bold">{placeholder}</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Text className="font-quicksand-semibold text-primary">Done</Text>
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView>
            <SafeAreaView edges={["bottom"]} className="px-6 gap-2">
              <View className="items-center">
                {show && (
                  <DateTimePicker
                    value={value ?? new Date()}
                    mode={mode}
                    display={display}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onChange={handleChange}
                  />
                )}
              </View>
            </SafeAreaView>
          </BottomSheetScrollView>
        </BottomSheetModal>
      ) : (
        show && (
          <DateTimePicker
            value={value ?? new Date()}
            mode={mode}
            display={display}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}
