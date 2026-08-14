import { StyleSheet, Text, View } from "react-native";

export default function PersonalInformation({ profile }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Personal Information</Text>
      <Row label="Name" value={`${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || profile?.userName} />
      <Row label="Username" value={profile?.userName} />
      <Row label="Email" value={profile?.email} />
      <Row label="Mobile" value={profile?.mobileNumber || profile?.rider?.mobileNumber} />
    </View>
  );
}
function Row({label,value}){return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{String(value ?? "—")}</Text></View>}
const styles=StyleSheet.create({card:{backgroundColor:"#fff",borderRadius:20,padding:18,marginTop:15},heading:{fontSize:18,fontWeight:"900",color:"#111",marginBottom:5},row:{paddingVertical:10,borderBottomWidth:1,borderBottomColor:"#F1F1F1"},label:{color:"#777",fontSize:11},value:{fontWeight:"800",color:"#111",marginTop:3}});
