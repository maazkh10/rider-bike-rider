import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import { getInvoices } from "../../services/profile";

export default function Earnings() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getInvoices();
    setInvoices(Array.isArray(data) ? data : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const data = await getInvoices();
          if (mounted) setInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
          if (mounted) setInvoices([]);
          console.log("Earnings:", error?.response?.data || error?.message);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  const refresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator color="#6FAF00" />
          <Text style={styles.muted}>Loading invoices...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const total = invoices.reduce(
    (sum, invoice) => sum + Number(invoice?.amount || 0),
    0
  );

  return (
    <ScreenWrapper>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        contentContainerStyle={styles.container}
      >
        <BackHeader title="Earnings" subtitle="Invoices from completed rides" />

        <View style={styles.wallet}>
          <Text style={styles.label}>TOTAL INVOICED</Text>
          <Text style={styles.total}>₹{total.toFixed(2)}</Text>
          <Text style={styles.sub}>
            {invoices.length} invoice{invoices.length === 1 ? "" : "s"}
          </Text>
        </View>

        <Text style={styles.heading}>Transactions</Text>

        {invoices.map((invoice) => (
          <View key={String(invoice.invoiceId)} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name="receipt-outline" size={22} color="#5C9200" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Ride #{invoice.rideId}</Text>
              <Text style={styles.date}>
                {invoice.createdAt
                  ? new Date(invoice.createdAt).toLocaleString()
                  : "Date unavailable"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.amount}>
                ₹{Number(invoice.amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.status}>{invoice.status || "PENDING"}</Text>
            </View>
          </View>
        ))}

        {!invoices.length && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No invoices yet</Text>
            <Text style={styles.muted}>
              An invoice is created by the backend when a STARTED ride is ended.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50, backgroundColor: "#F7F8FA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#777", marginTop: 7, textAlign: "center" },
  wallet: {
    backgroundColor: "#BBFF5B",
    borderRadius: 25,
    padding: 24,
    marginTop: 8,
    marginBottom: 25,
  },
  label: { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: "#555" },
  total: { fontSize: 38, fontWeight: "900", color: "#111", marginTop: 7 },
  sub: { color: "#444", marginTop: 5 },
  heading: { fontSize: 22, fontWeight: "900", color: "#111", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAFAD5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: { fontWeight: "800", color: "#111" },
  date: { color: "#888", marginTop: 4, fontSize: 11 },
  amount: { fontWeight: "900", color: "#111" },
  status: { color: "#6FAF00", fontSize: 10, fontWeight: "800", marginTop: 4 },
  empty: { backgroundColor: "#fff", padding: 25, borderRadius: 20, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
});
