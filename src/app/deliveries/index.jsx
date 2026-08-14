import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import ScreenWrapper from "../../components/common/ScreenWrapper";
import BackHeader from "../../components/common/BackHeader";
import { getRides, getActiveRideProfile } from "../../services/profile";

export default function Deliveries() {
  const router = useRouter();
  const [rides, setRides] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [rideData, activeData] = await Promise.all([
      getRides(),
      getActiveRideProfile(),
    ]);
    setRides(Array.isArray(rideData) ? rideData : []);
    setActive(activeData?.activeRide || null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const [rideData, activeData] = await Promise.all([
            getRides(),
            getActiveRideProfile(),
          ]);
          if (!mounted) return;
          setRides(Array.isArray(rideData) ? rideData : []);
          setActive(activeData?.activeRide || null);
        } catch {
          if (mounted) {
            setRides([]);
            setActive(null);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  const refresh = async () => {
    try { setRefreshing(true); await load(); }
    finally { setRefreshing(false); }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator color="#6FAF00" />
          <Text style={styles.muted}>Loading deliveries...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <BackHeader title="Deliveries" subtitle="Assignments from the backend" />

        {active ? (
          <TouchableOpacity
            style={styles.active}
            onPress={() =>
              router.push({
                pathname:
                  String(active.rideStatus).toUpperCase() === "STARTED"
                    ? "/deliveries/delivery-map"
                    : "/deliveries/pickup-map",
                params: { id: String(active.rideId) },
              })
            }
          >
            <Text style={styles.activeLabel}>ACTIVE RIDE</Text>
            <Text style={styles.activeTitle}>{active.vehicleName}</Text>
            <Text style={styles.activeSub}>
              #{active.rideId} • {active.rideStatus}
            </Text>
          </TouchableOpacity>
        ) : null}

        <FlatList
          data={rides}
          keyExtractor={(item) => String(item.rideId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/history/details",
                  params: { id: String(item.rideId) },
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.vehicleName || "Bike"}</Text>
                <Text style={styles.sub}>
                  Ride #{item.rideId} • {item.rideStatus}
                </Text>
                <Text style={styles.chassis}>
                  {item.chassisNo || "No chassis recorded"}
                </Text>
              </View>
              <Text style={styles.fare}>
                ₹{Number(item.fare || 0).toFixed(0)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No deliveries yet</Text>
              <Text style={styles.muted}>
                New ride requests arrive through the live rider WebSocket.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F8FA", paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#777", marginTop: 6, textAlign: "center" },
  list: { paddingBottom: 40 },
  active: { backgroundColor: "#111", borderRadius: 20, padding: 18, marginBottom: 14 },
  activeLabel: { color: "#A8D85B", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  activeTitle: { color: "#fff", fontSize: 20, fontWeight: "900", marginTop: 6 },
  activeSub: { color: "#bbb", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  title: { fontSize: 15, fontWeight: "900", color: "#111" },
  sub: { fontSize: 12, color: "#666", marginTop: 4 },
  chassis: { fontSize: 11, color: "#999", marginTop: 5 },
  fare: { fontSize: 16, fontWeight: "900", color: "#5C9200" },
  empty: { backgroundColor: "#fff", borderRadius: 20, padding: 25, alignItems: "center", marginTop: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#111" },
});
