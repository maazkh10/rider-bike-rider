import { useCallback, useEffect, useState } from "react";
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

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import { getRides } from "../../services/profile";
import { getLocationName } from "../../services/location.service";

export default function History() {
  const router = useRouter();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getRides();
    setRides(Array.isArray(data) ? data : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const data = await getRides();
          if (mounted) setRides(Array.isArray(data) ? data : []);
        } catch (error) {
          if (mounted) setRides([]);
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
          <Text style={styles.muted}>Loading rides...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <BackHeader title="History" subtitle="Rides from the database" />
        <FlatList
          data={rides}
          keyExtractor={(item) => String(item.rideId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <HistoryItem item={item} onPress={() =>
            router.push({
              pathname: "/history/details",
              params: { id: String(item.rideId) },
            })
          } />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No rides found</Text>
              <Text style={styles.muted}>
                Completed and assigned rides will appear here.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
}

function HistoryItem({ item, onPress }) {
  const [pickup, setPickup] = useState("Loading...");
  const [drop, setDrop] = useState("Loading...");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [a, b] = await Promise.all([
          getLocationName(item.pickupLatitude, item.pickupLongitude),
          getLocationName(item.dropLatitude, item.dropLongitude),
        ]);
        if (mounted) {
          setPickup(a || "Pickup");
          setDrop(b || "Destination");
        }
      } catch {
        if (mounted) {
          setPickup("Pickup");
          setDrop("Destination");
        }
      }
    })();
    return () => { mounted = false; };
  });

  const status = String(item.rideStatus || "").toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {item.vehicleName || "Bike delivery"}
          </Text>
          <Text style={styles.sub}>Ride #{item.rideId}</Text>
        </View>
        <Text style={styles.status}>{status || "UNKNOWN"}</Text>
      </View>

      <Text style={styles.location}>● {pickup}</Text>
      <Text style={styles.location}>● {drop}</Text>

      <View style={styles.bottom}>
        <Text style={styles.meta}>{item.chassisNo || "No chassis"}</Text>
        <Text style={styles.amount}>₹{Number(item.fare || 0).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F8FA", paddingHorizontal: 20 },
  list: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: "#777", marginTop: 6, textAlign: "center" },
  empty: { backgroundColor: "#fff", padding: 25, borderRadius: 20, alignItems: "center", marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#111" },
  card: { backgroundColor: "#fff", borderRadius: 19, padding: 17, marginBottom: 11 },
  top: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "900", color: "#111" },
  sub: { color: "#888", fontSize: 11, marginTop: 3 },
  status: { fontSize: 10, fontWeight: "900", color: "#5C9200" },
  location: { color: "#555", fontSize: 12, marginTop: 6 },
  bottom: { borderTopWidth: 1, borderTopColor: "#F1F1F1", marginTop: 12, paddingTop: 12, flexDirection: "row", justifyContent: "space-between" },
  meta: { color: "#888", fontSize: 11 },
  amount: { fontWeight: "900", color: "#111" },
});
