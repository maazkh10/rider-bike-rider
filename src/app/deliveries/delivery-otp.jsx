import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import { getActiveRide, endRide } from "../../services/ride";
import { stopLiveLocationTracking, clearActiveRideState } from "../../services/liveLocation.service";

export default function DeliveryCompletion() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [ride, setRide] = useState(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    getActiveRide()
      .then((response) => setRide(response?.data?.activeRide || null))
      .catch(() => {});
  }, [id]);

  const complete = async () => {
    try {
      setEnding(true);
      const riderId = await AsyncStorage.getItem("riderId");
      if (!riderId) throw new Error("Rider ID is missing.");

      await endRide(Number(id), Number(riderId));
      await stopLiveLocationTracking().catch(() => {});
      await clearActiveRideState();

      router.replace({
        pathname: "/deliveries/completed",
        params: { id: String(id) },
      });
    } catch (error) {
      Alert.alert(
        "Unable to complete ride",
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Only a STARTED assigned ride can be completed."
      );
    } finally {
      setEnding(false);
    }
  };

  return (
    <ScreenWrapper>
      <BackHeader title="Complete Ride" subtitle="Backend ride lifecycle" />
      <View style={styles.container}>
        <Text style={styles.title}>Finish the current ride</Text>
        <Text style={styles.subtitle}>
          The current API has no delivery OTP endpoint. Completion is performed by POST /ride/end for the assigned STARTED ride.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>RIDE</Text>
          <Text style={styles.value}>#{ride?.rideId || id}</Text>
          <Text style={[styles.label, { marginTop: 14 }]}>STATUS</Text>
          <Text style={styles.value}>{ride?.rideStatus || "Loading..."}</Text>
          <Text style={[styles.label, { marginTop: 14 }]}>VEHICLE</Text>
          <Text style={styles.value}>{ride?.vehicleName || "—"}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, ending && styles.disabled]}
          disabled={ending}
          onPress={complete}
        >
          {ending ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.buttonText}>Complete Ride</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, justifyContent: "center", backgroundColor: "#F7F8FA" },
  title: { fontSize: 28, fontWeight: "900", color: "#111", textAlign: "center" },
  subtitle: { color: "#666", textAlign: "center", lineHeight: 21, marginTop: 10 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginTop: 25 },
  label: { color: "#888", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  value: { color: "#111", fontSize: 17, fontWeight: "900", marginTop: 5 },
  button: { height: 58, borderRadius: 17, backgroundColor: "#BBFF5B", alignItems: "center", justifyContent: "center", marginTop: 20 },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#111", fontWeight: "900", fontSize: 16 },
});
