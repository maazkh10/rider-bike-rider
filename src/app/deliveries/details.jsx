import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import { getRides } from "../../services/profile";
import { getLocationName } from "../../services/location.service";

export default function DeliveryDetails() {
  const { id } = useLocalSearchParams();
  const [ride, setRide] = useState(null);
  const [route, setRoute] = useState({ pickup: "Loading...", drop: "Loading..." });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const rides = await getRides();
    const found = (rides || []).find((r) => String(r.rideId) === String(id));
    if (!found) throw new Error("Delivery not found.");
    setRide(found);

    const [pickup, drop] = await Promise.all([
      getLocationName(found.pickupLatitude, found.pickupLongitude),
      getLocationName(found.dropLatitude, found.dropLongitude),
    ]);
    setRoute({ pickup: pickup || "Pickup", drop: drop || "Destination" });
  }, [id]);

  useEffect(() => {
    load().catch((error) => console.log(error?.message)).finally(() => setLoading(false));
  }, [load]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator color="#6FAF00" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <BackHeader title="Delivery Details" subtitle={ride?.rideStatus} />
        <View style={styles.card}>
          <Row label="Ride ID" value={ride?.rideId} />
          <Row label="Vehicle" value={ride?.vehicleName} />
          <Row label="Chassis" value={ride?.chassisNo} />
          <Row label="Fare" value={`₹${Number(ride?.fare || 0).toFixed(2)}`} />
          <Row label="Status" value={ride?.rideStatus} />
        </View>
        <View style={styles.card}>
          <Text style={styles.heading}>Pickup</Text>
          <Text style={styles.value}>{route.pickup}</Text>
          <Text style={[styles.heading, { marginTop: 18 }]}>Destination</Text>
          <Text style={styles.value}>{route.drop}</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value ?? "—")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F7F8FA", paddingBottom: 50 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F1F1" },
  label: { color: "#888", fontSize: 12 },
  value: { color: "#111", fontWeight: "800", maxWidth: "68%", textAlign: "right" },
  heading: { fontSize: 16, fontWeight: "900", color: "#111", marginBottom: 6 },
});
