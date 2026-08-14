import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getProfile } from "../../services/profile";

export default function ProfileCard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((data) => mounted && setProfile(data))
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const name =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    profile?.rider?.name ||
    profile?.userName ||
    "Rider";

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta}>Rider #{profile?.rider?.riderId ?? "—"}</Text>
        <Text style={styles.status}>
          {profile?.rider?.status || "LOADING"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F7F8FA",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#BBFF5B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontWeight: "900", color: "#111" },
  name: { fontSize: 16, fontWeight: "900", color: "#111" },
  meta: { color: "#777", fontSize: 11, marginTop: 3 },
  status: { color: "#5C9200", fontSize: 10, fontWeight: "900", marginTop: 4 },
});
