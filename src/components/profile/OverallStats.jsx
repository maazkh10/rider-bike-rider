import { StyleSheet, Text, View } from "react-native";

export default function OverallStats({ profile, rides = [], invoices = [] }) {
  const completed = rides.filter((r) => String(r?.rideStatus).toUpperCase() === "COMPLETED").length;
  const total = invoices.reduce((s, i) => s + Number(i?.amount || 0), 0);
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Overall Performance</Text>
      <Row label="Total rides" value={rides.length} />
      <Row label="Completed rides" value={completed} />
      <Row label="Lifetime invoiced" value={`₹${total.toFixed(2)}`} />
      <Row label="Status" value={profile?.rider?.status} />
    </View>
  );
}
function Row({label,value}){return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{String(value ?? "—")}</Text></View>}
const styles=StyleSheet.create({card:{backgroundColor:"#fff",borderRadius:20,padding:18,marginTop:15},heading:{fontSize:18,fontWeight:"900",color:"#111",marginBottom:5},row:{flexDirection:"row",justifyContent:"space-between",paddingVertical:10,borderBottomWidth:1,borderBottomColor:"#F1F1F1"},label:{color:"#777"},value:{fontWeight:"800",color:"#111"}});
