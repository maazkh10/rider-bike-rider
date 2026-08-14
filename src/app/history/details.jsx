import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import ScreenWrapper from "../../components/common/ScreenWrapper";
import BackHeader from "../../components/common/BackHeader";
import { getRides } from "../../services/profile";
import { getLocationName } from "../../services/location.service";

export default function HistoryDetails() {
  const { id } = useLocalSearchParams();
  const [ride, setRide] = useState(null);
  const [addresses, setAddresses] = useState({
    pickup: "Loading...",
    drop: "Loading...",
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const rides = await getRides();
    const found = (rides || []).find(
      (item) => String(item.rideId) === String(id)
    );

    if (!found) throw new Error("Ride was not found in your account history.");

    setRide(found);

    const [pickup, drop] = await Promise.all([
      getLocationName(found.pickupLatitude, found.pickupLongitude),
      getLocationName(found.dropLatitude, found.dropLongitude),
    ]);

    setAddresses({
      pickup: pickup || "Pickup",
      drop: drop || "Destination",
    });
  }, [id]);

  useEffect(() => {
    load()
      .catch((error) => console.log("Ride details:", error?.message))
      .finally(() => setLoading(false));
  }, [load]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator color="#6FAF00" />
          <Text style={styles.muted}>Loading ride...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!ride) {
    return (
      <ScreenWrapper>
        <BackHeader title="Ride details" />
        <View style={styles.center}>
          <Text style={styles.title}>Ride not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <BackHeader title={`Ride #${ride.rideId}`} subtitle={ride.rideStatus} />

        <View style={styles.card}>
          <Row label="Vehicle" value={ride.vehicleName} />
          <Row label="Chassis" value={ride.chassisNo} />
          <Row label="Fare" value={`₹${Number(ride.fare || 0).toFixed(2)}`} />
          <Row label="Status" value={ride.rideStatus} />
          <Row label="Rider ID" value={ride.riderId} />
          <Row label="Admin ID" value={ride.adminId} />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Route</Text>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{addresses.pickup}</Text>
          <Text style={[styles.label, { marginTop: 18 }]}>Destination</Text>
          <Text style={styles.value}>{addresses.drop}</Text>
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
  muted: { color: "#777", marginTop: 7 },
  title: { fontSize: 20, fontWeight: "900" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F1F1" },
  label: { color: "#888", fontSize: 12, fontWeight: "700" },
  value: { color: "#111", fontSize: 13, fontWeight: "800", maxWidth: "65%", textAlign: "right" },
  section: { fontSize: 18, fontWeight: "900", color: "#111", marginBottom: 14 },
});
