import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../theme/colors";

export default function RideCard({ ride }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.bike}>{ride.bike}</Text>

        <View style={styles.status}>
          <Text style={styles.statusText}>{ride.status}</Text>
        </View>
      </View>

      <View style={styles.line} />

      <Text style={styles.label}>Pickup</Text>
      <Text style={styles.value}>{ride.pickup}</Text>

      <Text style={styles.arrow}>↓</Text>

      <Text style={styles.label}>Drop</Text>
      <Text style={styles.value}>{ride.drop}</Text>

      <View style={styles.bottom}>
        <Text style={styles.time}>⏱ {ride.time}</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.btnText}>Start Ride</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
    marginTop: 18,
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bike: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    flex: 1,
  },

  status: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontWeight: "700",
  },

  line: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 18,
  },

  label: {
    color: "#888",
    marginTop: 10,
  },

  value: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 4,
  },

  arrow: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 12,
  },

  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    alignItems: "center",
  },

  time: {
    fontWeight: "600",
  },

  button: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
