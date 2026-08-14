import { StyleSheet, View } from "react-native";
import RiderStatCard from "../cards/RiderStatCard";

export default function TodayStatus({ data }) {
  return (
    <View style={StyleSheet.container}>
      <RiderStatCard value={data.completed} title="Completed" />

      <RiderStatCard value={data.pending} title="Pending" />

      <RiderStatCard value={data.earning} title="Today Earning" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 20,
  },
});
