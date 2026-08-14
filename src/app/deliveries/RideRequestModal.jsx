import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

export default function RideRequestModal({
  visible,
  rideData,
  onAccept,
  onDecline,
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!rideData) {
    return null;
  }

  // ==========================================
  // GET LOCATION VALUES
  // Supports multiple possible backend names
  // ==========================================

  const pickup =
    rideData?.pickupLocation ||
    rideData?.pickupAddress ||
    rideData?.fromLocation ||
    rideData?.from ||
    rideData?.pickup ||
    "Pickup location";

  const drop =
    rideData?.dropLocation ||
    rideData?.dropAddress ||
    rideData?.toLocation ||
    rideData?.to ||
    rideData?.drop ||
    "Drop location";

  // ==========================================
  // VEHICLE
  // ==========================================

  const vehicleName =
    rideData?.vehicleName ||
    rideData?.vehicle?.name ||
    rideData?.vehicle ||
    rideData?.vehicleType ||
    "Vehicle";

  // ==========================================
  // PRICE / FARE
  // ==========================================

  const fare =
    rideData?.fare ??
    rideData?.price ??
    rideData?.amount ??
    rideData?.earnings ??
    rideData?.driverFare ??
    0;

  // ==========================================
  // RIDE ID
  // ==========================================

  const rideId =
    rideData?.id ||
    rideData?.rideId ||
    rideData?.deliveryId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* =====================================
              HEADER
          ====================================== */}

          <View style={styles.header}>
            <View>
              <Text style={styles.smallTitle}>
                NEW DELIVERY
              </Text>

              <Text style={styles.title}>
                New Ride Request 🚚
              </Text>
            </View>

            <View style={styles.rideIdBadge}>
              <Text style={styles.rideIdText}>
                #{rideId || "—"}
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >

            {/* =====================================
                ROUTE
            ====================================== */}

            <View style={styles.routeCard}>

              {/* PICKUP */}

              <View style={styles.locationRow}>

                <View style={styles.iconColumn}>
                  <View style={styles.pickupDot} />

                  <View style={styles.verticalLine} />
                </View>

                <View style={styles.locationContent}>
                  <Text style={styles.locationLabel}>
                    PICKUP FROM
                  </Text>

                  <Text style={styles.locationText}>
                    {pickup}
                  </Text>
                </View>

              </View>

              {/* DROP */}

              <View style={styles.locationRow}>

                <View style={styles.iconColumn}>
                  <View style={styles.dropDot} />
                </View>

                <View style={styles.locationContent}>
                  <Text style={styles.locationLabel}>
                    DELIVER TO
                  </Text>

                  <Text style={styles.locationText}>
                    {drop}
                  </Text>
                </View>

              </View>

            </View>

            {/* =====================================
                VEHICLE + FARE
            ====================================== */}

            <View style={styles.infoRow}>

              {/* VEHICLE */}

              <View style={styles.infoCard}>

                <Text style={styles.infoIcon}>
                  🚗
                </Text>

                <Text style={styles.infoLabel}>
                  VEHICLE
                </Text>

                <Text
                  style={styles.infoValue}
                  numberOfLines={2}
                >
                  {vehicleName}
                </Text>

              </View>

              {/* FARE */}

              <View style={styles.infoCard}>

                <Text style={styles.infoIcon}>
                  💰
                </Text>

                <Text style={styles.infoLabel}>
                  EARNINGS
                </Text>

                <Text style={styles.fareValue}>
                  ₹{fare}
                </Text>

              </View>

            </View>

            {/* =====================================
                OPTIONAL DISTANCE
            ====================================== */}

            {(rideData?.distance ||
              rideData?.distanceKm ||
              rideData?.estimatedDistance) && (
              <View style={styles.extraInfo}>

                <Text style={styles.extraLabel}>
                  Distance
                </Text>

                <Text style={styles.extraValue}>
                  {rideData?.distance ||
                    rideData?.distanceKm ||
                    rideData?.estimatedDistance}
                  {rideData?.distanceKm ||
                  rideData?.estimatedDistance
                    ? " km"
                    : ""}
                </Text>

              </View>
            )}

            {/* =====================================
                OPTIONAL ESTIMATED TIME
            ====================================== */}

            {(rideData?.estimatedTime ||
              rideData?.duration ||
              rideData?.estimatedDuration) && (
              <View style={styles.extraInfo}>

                <Text style={styles.extraLabel}>
                  Estimated Time
                </Text>

                <Text style={styles.extraValue}>
                  {rideData?.estimatedTime ||
                    rideData?.duration ||
                    rideData?.estimatedDuration}
                </Text>

              </View>
            )}

          </ScrollView>

          {/* =====================================
              ACTION BUTTONS
          ====================================== */}

          <View style={styles.buttonRow}>

            <TouchableOpacity
              style={[
                styles.button,
                styles.declineButton,
              ]}
              onPress={() => {
                if (submitting) return;
                onDecline?.();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.declineText}>
                Decline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.acceptButton,
              ]}
              onPress={async () => {
                if (submitting) return;
                try {
                  setSubmitting(true);
                  await onAccept?.();
                } finally {
                  setSubmitting(false);
                }
              }}
              activeOpacity={0.8}
              disabled={submitting}
            >
              <Text style={styles.acceptText}>
                {submitting ? "Accepting..." : "Accept Ride"}
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },

  card: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  smallTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6FAF00",
    letterSpacing: 1,
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
  },

  rideIdBadge: {
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  rideIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555555",
  },

  content: {
    paddingBottom: 10,
  },

  // ==========================================
  // ROUTE
  // ==========================================

  routeCard: {
    backgroundColor: "#F7F8F6",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  locationRow: {
    flexDirection: "row",
    minHeight: 65,
  },

  iconColumn: {
    width: 28,
    alignItems: "center",
  },

  pickupDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#6FAF00",
    marginTop: 3,
  },

  dropDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#111111",
    marginTop: 3,
  },

  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#D5D5D5",
    marginVertical: 4,
  },

  locationContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 12,
  },

  locationLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#888888",
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  locationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
    lineHeight: 21,
  },

  // ==========================================
  // INFO CARDS
  // ==========================================

  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 15,
  },

  infoIcon: {
    fontSize: 20,
    marginBottom: 8,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#888888",
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  fareValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#5C9200",
  },

  // ==========================================
  // EXTRA INFO
  // ==========================================

  extraInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },

  extraLabel: {
    fontSize: 13,
    color: "#777777",
  },

  extraValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222222",
  },

  // ==========================================
  // BUTTONS
  // ==========================================

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },

  button: {
    flex: 1,
    height: 54,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  declineButton: {
    backgroundColor: "#F1F1F1",
  },

  acceptButton: {
    backgroundColor: "#6FAF00",
  },

  declineText: {
    color: "#444444",
    fontSize: 15,
    fontWeight: "800",
  },

  acceptText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});