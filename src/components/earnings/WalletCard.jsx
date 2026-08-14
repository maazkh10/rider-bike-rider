import { StyleSheet, Text, View } from "react-native";

export default function WalletCard({ invoices = [] }) {
  const total = invoices.reduce((s, i) => s + Number(i?.amount || 0), 0);
  return <View style={styles.card}><Text style={styles.label}>Total invoiced</Text><Text style={styles.amount}>₹{total.toFixed(2)}</Text></View>
}
const styles=StyleSheet.create({card:{backgroundColor:"#BBFF5B",borderRadius:22,padding:22,marginBottom:15},label:{color:"#444",fontWeight:"700"},amount:{fontSize:34,fontWeight:"900",marginTop:8,color:"#111"}});
