import { StyleSheet, Text, View } from "react-native";

export default function EarningOverview({ invoices = [] }) {
  const total = invoices.reduce((s, i) => s + Number(i?.amount || 0), 0);
  return <View style={styles.card}><Text style={styles.title}>Invoice summary</Text><Text style={styles.amount}>₹{total.toFixed(2)}</Text><Text style={styles.sub}>{invoices.length} invoice(s)</Text></View>
}
const styles=StyleSheet.create({card:{backgroundColor:"#fff",borderRadius:18,padding:18,marginBottom:15},title:{fontWeight:"800",color:"#111"},amount:{fontSize:25,fontWeight:"900",marginTop:7},sub:{color:"#777",marginTop:3}});
