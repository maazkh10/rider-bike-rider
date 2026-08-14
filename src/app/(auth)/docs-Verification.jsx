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
import { getProfile, getVerificationDetails } from "../../services/profile";

const mask = (value) => {
  const text = String(value || "");
  if (!text) return "Not submitted";
  if (text.length <= 4) return "••••";
  return `${"•".repeat(text.length - 4)}${text.slice(-4)}`;
};

export default function VerificationStatus() {
  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, v] = await Promise.all([
      getProfile(),
      getVerificationDetails(),
    ]);
    setProfile(p);
    setVerification(v?.verificationDetails || null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const [p, v] = await Promise.all([
            getProfile(),
            getVerificationDetails(),
          ]);
          if (mounted) {
            setProfile(p);
            setVerification(v?.verificationDetails || null);
          }
        } catch {
          if (mounted) setVerification(null);
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
      <View style={styles.center}>
        <ActivityIndicator color="#6FAF00" />
      </View>
    );
  }

  const verified = verification?.verified === true;

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Verification Status</Text>
      <Text style={styles.subtitle}>
        Rider verification is stored in RIDER_VERIFICATION_DETAILS.
        The reference assigns verification submission/approval to the admin workflow.
      </Text>

      <View style={[styles.statusCard, verified ? styles.good : styles.pending]}>
        <Text style={styles.status}>{verified ? "VERIFIED" : verification ? "SUBMITTED / PENDING" : "NOT SUBMITTED"}</Text>
        <Text style={styles.riderId}>
          Rider ID: {profile?.rider?.riderId ?? "—"}
        </Text>
      </View>

      <Field label="Aadhaar" value={mask(verification?.aadhaarCardNumber)} />
      <Field label="PAN" value={mask(verification?.panCardNumber)} />
      <Field label="Driving licence" value={mask(verification?.drivingLicenseNumber)} />
      <Field label="Bank account" value={mask(verification?.bankAccountNumber)} />
      <Field label="IFSC" value={mask(verification?.bankIfscCode)} />
      <Field label="Account name" value={verification?.bankAccountName || "Not submitted"} />

      <Text style={styles.note}>
        To submit or approve KYC, the admin should use the Rider Verification screen and the documented admin endpoints.
      </Text>
    </ScrollView>
  );
}

function Field({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingTop: 60, backgroundColor: "#F7F8FA", paddingBottom: 50 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "900", color: "#111" },
  subtitle: { color: "#777", lineHeight: 19, marginTop: 7, marginBottom: 18 },
  statusCard: { borderRadius: 20, padding: 20, marginBottom: 15 },
  good: { backgroundColor: "#E8FFF1" },
  pending: { backgroundColor: "#FFF7E6" },
  status: { fontSize: 19, fontWeight: "900", color: "#111" },
  riderId: { color: "#666", marginTop: 5 },
  field: { backgroundColor: "#fff", borderRadius: 16, padding: 15, marginBottom: 10 },
  label: { color: "#888", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  value: { color: "#111", fontWeight: "800", fontSize: 15, marginTop: 6 },
  note: { color: "#888", fontSize: 11, lineHeight: 17, marginTop: 8 },
});
