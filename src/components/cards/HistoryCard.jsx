import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import { getLocationName } from "../../services/location.service";
import Colors from "../../theme/colors";

export default function HistoryCard({ item, onPress }) {

  const [pickupLocation, setPickupLocation] = useState("Loading location...");
  const [dropLocation, setDropLocation] = useState("Loading location...");

  useEffect(() => {
    const loadLocations = async () => {

      const pickup = await getLocationName(
        item.pickUpLatitude,
        item.pickUpLongitude
      );

      const drop = await getLocationName(
        item.dropLatitude,
        item.dropLongitude
      );

      setPickupLocation(pickup);
      setDropLocation(drop);
    };

    loadLocations();
  }, [
    item.pickUpLatitude,
    item.pickUpLongitude,
    item.dropLatitude,
    item.dropLongitude,
  ]);

  return (
    <View style={styles.card}>

      {/* Status */}

      <View style={styles.statusBadge}>
        <Ionicons
          name="checkmark"
          size={14}
          color="#16C47F"
        />
      </View>

      {/* Route */}

      <View style={styles.routeContainer}>

        {/* Pickup */}

        <View style={styles.routeRow}>

          <View style={[styles.dot, styles.pickupDot]} />

          <View style={styles.locationContent}>

            <Text style={styles.label}>
              Pickup
            </Text>

            <Text style={styles.location}>
              {pickupLocation}
            </Text>

          </View>

        </View>

        <View style={styles.routeLine} />

        {/* Destination */}

        <View style={styles.routeRow}>

          <View style={[styles.dot, styles.dropDot]} />

          <View style={styles.locationContent}>

            <Text style={styles.label}>
              Destination
            </Text>

            <Text style={styles.location}>
              {dropLocation}
            </Text>

          </View>

        </View>

      </View>

      {/* Vehicle */}

      <View style={styles.infoRow}>

        <View>
          <Text style={styles.smallLabel}>
            Vehicle
          </Text>

          <Text style={styles.infoValue}>
            {item.vehicleName}
          </Text>
        </View>

        <View>
          <Text style={styles.smallLabel}>
            Chassis
          </Text>

          <Text style={styles.infoValue}>
            {item.chassisNo}
          </Text>
        </View>

      </View>

      {/* Ride */}

      <View style={styles.bottomRow}>

        <View>
          <Text style={styles.smallLabel}>
            Ride ID
          </Text>

          <Text style={styles.rideId}>
            #{item.rideId}
          </Text>
        </View>

        <Text style={styles.amount}>
          ₹{item.fare}
        </Text>

      </View>

      {/* Details */}

      <TouchableOpacity
        style={styles.detailsButton}
        activeOpacity={0.8}
        onPress={onPress}
      >

        <Text style={styles.detailsText}>
          View Details
        </Text>

        <Ionicons
          name="arrow-forward"
          size={20}
          color="#111"
        />

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
    elevation: 3,
  },

  statusBadge: {
    position: "absolute",
    right: 24,
    top: 24,
    width: 80,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#E8FFF3",
    justifyContent: "center",
    alignItems: "center",
  },

  routeContainer: {
    marginTop: 25,
    marginBottom: 20,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 4,
  },

  pickupDot: {
    backgroundColor: "#16C47F",
  },

  dropDot: {
    backgroundColor: "#FF4D4F",
  },

  locationContent: {
    marginLeft: 18,
    flex: 1,
  },

  label: {
    fontSize: 14,
    color: "#999",
    marginBottom: 5,
  },

  location: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  routeLine: {
    width: 2,
    height: 25,
    backgroundColor: "#DDD",
    marginLeft: 8,
    marginVertical: 6,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 18,
  },

  smallLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },

  rideId: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  amount: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.primary,
  },

  detailsButton: {
    marginTop: 20,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  detailsText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginRight: 8,
  },

});