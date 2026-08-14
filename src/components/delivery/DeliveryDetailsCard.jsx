import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../theme/colors";

export default function DeliveryDetailsCard({
  delivery,
  onAccept,
  onReject,
}) {
  return (
    <>
      {/* Bike */}

      <View style={styles.card}>
        <View style={styles.bikeHeader}>
          <View>
            <Text style={styles.bike}>
              {delivery.bike}
            </Text>

            <Text style={styles.status}>
              {delivery.status}
            </Text>
          </View>

          <View style={styles.bikeIcon}>
            <Ionicons
              name="bicycle"
              size={34}
              color={Colors.primary}
            />
          </View>
        </View>
      </View>

      {/* Pickup */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Pickup Location
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="location"
            size={22}
            color="#22C55E"
          />

          <View style={styles.info}>
            <Text style={styles.title}>
              {delivery.pickup}
            </Text>

            <Text style={styles.subtitle}>
              {delivery.pickupAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Destination */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Destination
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="flag"
            size={22}
            color="#EF4444"
          />

          <View style={styles.info}>
            <Text style={styles.title}>
              {delivery.destination}
            </Text>

            <Text style={styles.subtitle}>
              {delivery.destinationAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{delivery.amount}
          </Text>

          <Text style={styles.statLabel}>
            Payout
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {delivery.distance}
          </Text>

          <Text style={styles.statLabel}>
            Distance
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {delivery.eta}
          </Text>

          <Text style={styles.statLabel}>
            ETA
          </Text>
        </View>
      </View>

      {/* Bike Details */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Bike Details
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.left}>
            Chassis
          </Text>

          <Text style={styles.right}>
            {delivery.chassis}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.left}>
            Color
          </Text>

          <Text style={styles.right}>
            {delivery.color}
          </Text>
        </View>
      </View>

      {/* Admin */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Assigned By
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="person-circle"
            size={45}
            color="#777"
          />

          <View style={styles.info}>
            <Text style={styles.title}>
              Rahul Sharma
            </Text>

            <Text style={styles.subtitle}>
              +91 9876543210
            </Text>
          </View>

          <TouchableOpacity>
            <Ionicons
              name="call"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Buttons */}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.reject}
          onPress={onReject}
        >
          <Text style={styles.rejectText}>
            Reject
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accept}
          onPress={onAccept}
        >
          <Text style={styles.acceptText}>
            Accept Delivery
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
  },

  bikeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bike: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },

  status: {
    marginTop: 6,
    color: Colors.primary,
    fontWeight: "700",
  },

  bikeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F8E8",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 15,
    color: "#111",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  info: {
    flex: 1,
    marginLeft: 15,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 3,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
  },

  statLabel: {
    marginTop: 8,
    color: "#777",
    fontWeight: "600",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  left: {
    color: "#777",
    fontSize: 15,
  },

  right: {
    fontWeight: "700",
    color: "#111",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  reject: {
    width: "30%",
    height: 55,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
  },

  rejectText: {
    fontWeight: "700",
    color: "#555",
  },

  accept: {
    width: "66%",
    height: 55,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  acceptText: {
    fontWeight: "800",
    color: "#111",
    fontSize: 16,
  },
});