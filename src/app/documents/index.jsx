import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ScreenWrapper from "../../components/common/ScreenWrapper";
import BackHeader from "../../components/common/BackHeader";
import { getVerificationDetails } from "../../services/profile";

const mask = (value, visible = 4) => {
  const text = String(value || "");
  if (!text) return "Not submitted";
  if (text.length <= visible) return "••••";
  return `${"•".repeat(Math.max(0, text.length - visible))}${text.slice(-visible)}`;
};

export default function DocumentsScreen() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const response = await getVerificationDetails();
    setDetails(response?.verificationDetails || null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const response = await getVerificationDetails();
          if (mounted) setDetails(response?.verificationDetails || null);
        } catch (error) {
          if (__DEV__) console.log("Verification details:", error?.response?.data || error?.message);
          if (mounted) setDetails(null);
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
          <Text style={styles.muted}>Loading verification...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const verified = details?.verified === true;

  return (
    <ScreenWrapper>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.container}
      >
        <BackHeader title="Verification" subtitle="Data stored by the backend" />

        <View style={[styles.banner, verified ? styles.verified : styles.pending]}>
          <Ionicons
            name={verified ? "shield-checkmark" : "time-outline"}
            size={24}
            color={verified ? "#1E7A32" : "#A16207"}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {verified ? "Verified" : details ? "Submitted • Awaiting approval" : "Not submitted"}
            </Text>
            <Text style={styles.bannerSub}>
              Matching requires verified=true on the backend.
            </Text>
          </View>
        </View>

        <Field title="Aadhaar" value={mask(details?.aadhaarCardNumber)} />
        <Field title="PAN" value={mask(details?.panCardNumber)} />
        <Field title="Driving licence" value={mask(details?.drivingLicenseNumber)} />
        <Field title="Bank account" value={mask(details?.bankAccountNumber)} />
        <Field title="IFSC" value={details?.bankIfscCode ? mask(details.bankIfscCode, 4) : "Not submitted"} />
        <Field title="Account name" value={details?.bankAccountName || "Not submitted"} />

        <Text style={styles.note}>
          This screen reads the rider-owned verification endpoint. It does not expose raw KYC data in logs.
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

function Field({ title, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50, backgroundColor: "#F7F8FA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#777", marginTop: 7 },
  banner: { borderRadius: 20, padding: 18, flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 15 },
  verified: { backgroundColor: "#E8FFF1" },
  pending: { backgroundColor: "#FFF7E6" },
  bannerTitle: { fontWeight: "900", color: "#111" },
  bannerSub: { marginTop: 4, color: "#666", fontSize: 12 },
  field: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 10 },
  label: { color: "#888", fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  value: { marginTop: 7, fontSize: 16, fontWeight: "800", color: "#111" },
  note: { color: "#888", fontSize: 11, lineHeight: 17, marginTop: 8 },
});
