import { Stack } from "expo-router";
import ScreenBackButton from "../../components/common/ScreenBackButton";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: true,
      title: "",
      headerBackTitle: "",
      headerLeft: () => <ScreenBackButton fallback="/(auth)/login" />,
      animation: "slide_from_right",
      gestureEnabled: true,
    }} />
  );
}
