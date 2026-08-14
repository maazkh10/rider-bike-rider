import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ScreenWrapper from "../../components/common/ScreenWrapper";
import BackHeader from "../../components/common/BackHeader";

export default function Notifications() {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem("rideEvents");
    const parsed = raw ? JSON.parse(raw) : [];
    setEvents(Array.isArray(parsed) ? parsed : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = async () => {
    try { setRefreshing(true); await load(); }
    finally { setRefreshing(false); }
  };

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <BackHeader title="Notifications" subtitle="Live ride events received by this rider" />
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.localId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.type}>
                {String(item.type || item.eventType || item.event || "RIDE EVENT")}
              </Text>
              <Text style={styles.text}>
                Ride #{item.rideId ?? "—"}
                {item.riderId ? ` • Rider #${item.riderId}` : ""}
              </Text>
              <Text style={styles.date}>
                {item.receivedAt ? new Date(item.receivedAt).toLocaleString() : ""}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.muted}>
                Ride requests and lifecycle events received from the backend will appear here.
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
  list: { paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 10 },
  type: { fontSize: 12, fontWeight: "900", color: "#5C9200" },
  text: { marginTop: 6, fontSize: 15, fontWeight: "800", color: "#111" },
  date: { marginTop: 5, fontSize: 10, color: "#999" },
  empty: { marginTop: 20, backgroundColor: "#fff", padding: 25, borderRadius: 20, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#111" },
  muted: { color: "#777", marginTop: 6, textAlign: "center" },
});
