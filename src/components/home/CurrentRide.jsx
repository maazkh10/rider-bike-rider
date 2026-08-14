import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Colors from "../../theme/colors";

export default function CurrentRideCard() {
  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View>
          <Text style={styles.small}>Current Delivery</Text>

          <Text style={styles.title}>Royal Enfield Classic 350</Text>
        </View>

        <View style={styles.status}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>Assigned</Text>
        </View>
      </View>

      {/* Pickup */}

      <View style={styles.locationRow}>
        <Ionicons name="location" size={22} color="#00C853" />

        <View style={styles.locationInfo}>
          <Text style={styles.label}>Pickup</Text>

          <Text style={styles.location}>Central Warehouse</Text>
        </View>
      </View>

      <View style={styles.line} />

      {/* Drop */}

      <View style={styles.locationRow}>
        <Ionicons name="flag" size={22} color="#FF5722" />

        <View style={styles.locationInfo}>
          <Text style={styles.label}>Destination</Text>

          <Text style={styles.location}>Honda Showroom</Text>
        </View>
      </View>

      {/* Bottom */}

      <View style={styles.bottom}>
        <View>
          <Text style={styles.timeLabel}>ETA</Text>

          <Text style={styles.time}>18 mins</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Ionicons name="navigate" size={18} color="#111" />

          <Text style={styles.buttonText}>Start Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -70,
    borderRadius: 28,
    padding: 22,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  small: {
    color: "#777",
    fontSize: 13,
  },

  title: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: "800",
    color: "#111",
  },

  status: {
    backgroundColor: "#E8FFF0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: "#00C853",
    marginRight: 6,
  },

  statusText: {
    color: "#00C853",
    fontWeight: "700",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationInfo: {
    marginLeft: 15,
  },

  label: {
    color: "#888",
    fontSize: 13,
  },

  location: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 3,
  },

  line: {
    width: 2,
    height: 30,
    backgroundColor: "#ddd",
    marginLeft: 10,
    marginVertical: 8,
  },

  bottom: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timeLabel: {
    color: "#888",
  },

  time: {
    marginTop: 5,
    fontSize: 22,
    fontWeight: "800",
  },

  button: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 18,
  },

  buttonText: {
    marginLeft: 8,
    fontWeight: "800",
    color: "#111",
  },
});
