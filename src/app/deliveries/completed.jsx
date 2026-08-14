import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import Colors from "../../theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Completed() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleHome = async () => {
    await AsyncStorage.removeItem("activeRide");
    router.replace("/(tabs)/home");
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={70} color="#fff" />
        </View>

        <Text style={styles.title}>
          Delivery Completed 🎉
        </Text>

        <Text style={styles.subtitle}>
          Ride #{params?.id || "—"} was completed successfully.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>RIDE STATUS</Text>
          <Text style={styles.completed}>COMPLETED</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleHome}
        >
          <Ionicons name="home" size={21} color="#111" />
          <Text style={styles.buttonText}>
            Back To Home
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#F7F8FA",
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 28,
    fontSize: 29,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 9,
    color: "#666",
    textAlign: "center",
  },
  card: {
    width: "100%",
    marginTop: 30,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 22,
    alignItems: "center",
  },
  label: {
    color: "#888",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  completed: {
    marginTop: 7,
    color: "#22C55E",
    fontSize: 22,
    fontWeight: "900",
  },
  button: {
    width: "100%",
    height: 58,
    marginTop: 25,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },
});
