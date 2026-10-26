import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function ScreenBackButton({ fallback = "/" }) {
  const router = useRouter();
  const handleBack = () => router.canGoBack() ? router.back() : router.replace(fallback);
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" activeOpacity={0.8} onPress={handleBack} style={styles.button}>
      <Ionicons name="chevron-back" size={24} color="#111" />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#EAFAD5", marginRight: 10 },
});
