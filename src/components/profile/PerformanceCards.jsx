import { StyleSheet, Text, View } from "react-native";

export default function PerformanceCards({ rides = [], invoices = [] }) {
  const completed = rides.filter((r) => String(r?.rideStatus).toUpperCase() === "COMPLETED").length;
  const pending = rides.filter((r) => !["COMPLETED","ADMIN_CANCELLED"].includes(String(r?.rideStatus).toUpperCase())).length;
  const earnings = invoices.reduce((s, i) => s + Number(i?.amount || 0), 0);
  return (
    <View style={styles.grid}>
      <Stat title="Completed" value={completed} />
      <Stat title="Pending" value={pending} />
      <Stat title="Invoiced" value={`₹${earnings.toFixed(0)}`} />
      <Stat title="Rides" value={rides.length} />
    </View>
  );
}
function Stat({title,value}){return <View style={styles.card}><Text style={styles.value}>{value}</Text><Text style={styles.title}>{title}</Text></View>}
const styles=StyleSheet.create({grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",marginTop:15},card:{width:"48%",backgroundColor:"#fff",borderRadius:18,padding:20,alignItems:"center",marginBottom:10},value:{fontSize:22,fontWeight:"900",color:"#111"},title:{color:"#777",marginTop:5}});
