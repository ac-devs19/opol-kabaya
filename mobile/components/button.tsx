import { Button as Btn, ButtonProps } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface BtnProps extends ButtonProps {
  label: string;
}

export default function Button({ label, ...props }: BtnProps) {
  return (
    <Btn className="h-14 rounded-full" {...props}>
      <Text className="font-quicksand-bold text-base">{label}</Text>
    </Btn>
  );
}
