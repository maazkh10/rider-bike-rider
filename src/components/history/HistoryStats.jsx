import { StyleSheet, Text, View } from "react-native";

export default function HistoryStats({ rides = [] }) {
  const completed = rides.filter((r) => String(r?.rideStatus).toUpperCase() === "COMPLETED").length;
  const revenue = rides.reduce((s, r) => s + Number(r?.fare || 0), 0);
  return <View style={styles.card}><Stat label="Rides" value={rides.length}/><Stat label="Completed" value={completed}/><Stat label="Fare" value={`₹${revenue.toFixed(0)}`}/></View>
}
function Stat({label,value}){return <View style={styles.stat}><Text style={styles.value}>{value}</Text><Text style={styles.label}>{label}</Text></View>}
const styles=StyleSheet.create({card:{flexDirection:"row",backgroundColor:"#fff",borderRadius:18,paddingVertical:16,marginBottom:15},stat:{flex:1,alignItems:"center"},value:{fontWeight:"900",fontSize:18,color:"#111"},label:{fontSize:10,color:"#777",marginTop:4}});
