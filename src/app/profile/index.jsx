import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import {
  getInvoices,
  getProfile,
  getRides,
  updateRiderStatus,
} from "../../services/profile";
import { logout } from "../../services/auth.service";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, r, i] = await Promise.all([
      getProfile(),
      getRides(),
      getInvoices(),
    ]);
    setProfile(p);
    setRides(Array.isArray(r) ? r : []);
    setInvoices(Array.isArray(i) ? i : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const [p, r, i] = await Promise.all([
            getProfile(),
            getRides(),
            getInvoices(),
          ]);
          if (!mounted) return;
          setProfile(p);
          setRides(Array.isArray(r) ? r : []);
          setInvoices(Array.isArray(i) ? i : []);
        } catch (error) {
          if (mounted) {
            Alert.alert(
              "Profile unavailable",
              error?.response?.data?.message || error?.message || "Try again."
            );
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

  const toggleStatus = async () => {
    const current = String(profile?.rider?.status || "AVAILABLE").toUpperCase();
    if (current === "ON_TRIP") return;
    try {
      const next = current === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
      await updateRiderStatus(next);
      await load();
    } catch (error) {
      Alert.alert(
        "Status update failed",
        error?.response?.data?.message || error?.message || "Try again."
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator color="#6FAF00" />
          <Text style={styles.muted}>Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const rider = profile?.rider;
  const completed = rides.filter(
    (r) => String(r?.rideStatus || "").toUpperCase() === "COMPLETED"
  ).length;
  const total = invoices.reduce(
    (sum, invoice) => sum + Number(invoice?.amount || 0),
    0
  );
  const fullName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    rider?.name ||
    profile?.userName ||
    "Rider";

  return (
    <ScreenWrapper>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.container}
      >
        <BackHeader title="Profile" subtitle="Live account data" />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {fullName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.username}>@{profile?.userName}</Text>

          <TouchableOpacity
            style={[
              styles.status,
              rider?.status === "OFFLINE" && styles.offline,
            ]}
            disabled={rider?.status === "ON_TRIP"}
            onPress={toggleStatus}
          >
            <Text style={styles.statusText}>{rider?.status || "UNKNOWN"}</Text>
          </TouchableOpacity>
        </View>

        <Card title="Account">
          <Row label="User ID" value={profile?.userId} />
          <Row label="Rider ID" value={rider?.riderId} />
          <Row label="Email" value={profile?.email} />
          <Row label="Mobile" value={profile?.mobileNumber || rider?.mobileNumber} />
          <Row label="Role" value={profile?.role} />
          <Row label="Verification" value={rider?.verified ? "VERIFIED" : "PENDING"} />
        </Card>

        <View style={styles.stats}>
          <Stat label="Rides" value={rides.length} />
          <Stat label="Completed" value={completed} />
          <Stat label="Invoiced" value={`₹${total.toFixed(0)}`} />
        </View>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/documents")}
        >
          <Text style={styles.linkText}>Open verification details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>{String(value ?? "—")}</Text>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50, backgroundColor: "#F7F8FA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#777", marginTop: 7 },
  profileCard: { backgroundColor: "#fff", borderRadius: 25, padding: 25, alignItems: "center" },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: "#BBFF5B", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24, fontWeight: "900", color: "#111" },
  name: { fontSize: 25, fontWeight: "900", color: "#111", marginTop: 14 },
  username: { color: "#777", marginTop: 4 },
  status: { backgroundColor: "#EAFAD5", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginTop: 14 },
  offline: { backgroundColor: "#EEE" },
  statusText: { fontSize: 11, fontWeight: "900" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 18, marginTop: 15 },
  cardTitle: { fontSize: 18, fontWeight: "900", marginBottom: 6, color: "#111" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F1F1" },
  label: { color: "#777", fontSize: 13 },
  value: { color: "#111", fontSize: 13, fontWeight: "700", maxWidth: "62%", textAlign: "right" },
  stats: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 20, paddingVertical: 18, marginTop: 15 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 19, fontWeight: "900", color: "#111" },
  statLabel: { color: "#777", fontSize: 11, marginTop: 4 },
  link: { marginTop: 15, backgroundColor: "#111", borderRadius: 17, padding: 16, alignItems: "center" },
  linkText: { color: "#fff", fontWeight: "800" },
  logout: { marginTop: 12, backgroundColor: "#FEECEC", borderRadius: 17, padding: 16, alignItems: "center" },
  logoutText: { color: "#C62828", fontWeight: "900" },
});
