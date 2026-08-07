import { useLoader } from "@/hooks/useLoader";
import LottieView from "lottie-react-native";
import { Modal, View } from "react-native";

export default function Loader({ loading = false }: { loading?: boolean }) {
  const { processing } = useLoader();

  return (
    <Modal
      visible={processing || loading}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <LottieView
          style={{
            width: 150,
            height: 150,
          }}
          source={require("@/assets/animations/liquid-4-dot-loader.json")}
          autoPlay
          loop
        />
      </View>
    </Modal>
  );
}
