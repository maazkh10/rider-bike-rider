import { StyleSheet, Text, View } from "react-native";

export default function ProfileHeader({ profile, rides = [], invoices = [] }) {
  const name =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    profile?.rider?.name ||
    profile?.userName ||
    "Rider";
  const total = invoices.reduce((s, i) => s + Number(i?.amount || 0), 0);

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.id}>Rider ID • {profile?.rider?.riderId ?? "—"}</Text>
      <Text style={styles.status}>{profile?.rider?.status || "—"}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>{rides.length} rides</Text>
        <Text style={styles.stat}>₹{total.toFixed(0)}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card:{backgroundColor:"#fff",borderRadius:25,padding:25,alignItems:"center"},
  avatar:{width:85,height:85,borderRadius:43,backgroundColor:"#BBFF5B",alignItems:"center",justifyContent:"center"},
  avatarText:{fontSize:24,fontWeight:"900"},
  name:{fontSize:23,fontWeight:"900",marginTop:12,color:"#111"},
  id:{color:"#777",marginTop:4},
  status:{color:"#5C9200",fontWeight:"900",marginTop:8},
  stats:{flexDirection:"row",gap:20,marginTop:15},
  stat:{fontWeight:"800",color:"#111"},
});
