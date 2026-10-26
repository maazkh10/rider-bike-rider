import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import ScreenWrapper from "../../components/common/ScreenWrapper";
import BackHeader from "../../components/common/BackHeader";

import PaymentCard from "../../components/payment/PaymentCard";
import PriceRow from "../../components/payment/PriceRow";
import PaymentButton from "../../components/payment/PaymentButton";

import Colors from "../../theme/colors";
import { useLocalSearchParams } from "expo-router";

export default function PaymentSummary() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Values are display data supplied by the booking flow. The backend remains
  // authoritative for the payable amount and must validate it before payment.
  const delivery = {
    bike: String(params.vehicleName || params.bike || "Bike delivery"),
    pickup: String(params.pickup || "Pickup location not provided"),
    destination: String(params.destination || params.drop || "Destination not provided"),
    distance: params.distance ? String(params.distance) : "—",
    eta: params.eta ? String(params.eta) : "—",
    deliveryCharge: Number(params.deliveryCharge ?? params.fare ?? NaN),
    platformFee: Number(params.platformFee ?? 0),
    gst: Number(params.gst ?? 0),
  };

  const hasValidAmount =
    Number.isFinite(delivery.deliveryCharge) &&
    delivery.deliveryCharge > 0 &&
    Number.isFinite(delivery.platformFee) &&
    delivery.platformFee >= 0 &&
    Number.isFinite(delivery.gst) &&
    delivery.gst >= 0;

  const total = hasValidAmount
    ? delivery.deliveryCharge + delivery.platformFee + delivery.gst
    : null;

  return (
    <ScreenWrapper>
      <BackHeader
        title="Payment Summary"
        subtitle="Review before proceeding"
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Card */}

        <PaymentCard delivery={delivery} />

        {/* Fare Breakdown */}

        <View style={styles.priceCard}>
          <Text style={styles.heading}>
            Fare Breakdown
          </Text>

          <PriceRow
            title="Delivery Charge"
            value={Number.isFinite(delivery.deliveryCharge) ? `₹${delivery.deliveryCharge}` : "Not available"}
          />

          <PriceRow
            title="Platform Fee"
            value={Number.isFinite(delivery.platformFee) ? `₹${delivery.platformFee}` : "Not available"}
          />

          <PriceRow
            title="GST"
            value={Number.isFinite(delivery.gst) ? `₹${delivery.gst}` : "Not available"}
          />

          <View style={styles.divider} />

          <PriceRow
            title="Total Amount"
            value={total == null ? "Not available" : `₹${total}`}
            total
          />
        </View>

        {/* Information */}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Payment Information
          </Text>

          <Text style={styles.infoText}>
            • Secure checkout is not enabled yet. Do not submit payment until server-side verification is available.
          </Text>

          <Text style={styles.infoText}>
            • Payment is intended to be collected only after the ride is completed.
          </Text>

          <Text style={styles.infoText}>
            • Payment status must be confirmed by the backend before the app can show success.
          </Text>
        </View>

        {/* Pay Button */}

        {!hasValidAmount ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Price unavailable</Text>
            <Text style={styles.warningText}>
              Payment cannot start until the booking flow provides a valid fare.
              This screen will not invent a price or mark an unverified payment as successful.
            </Text>
          </View>
        ) : (
          <PaymentButton
            amount={total}
            onPress={() =>
              router.push({
                pathname: "/payment/processing",
                params: { amount: String(total) },
              })
            }
          />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  priceCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    marginTop: 20,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,

    elevation: 4,
  },

  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 18,
  },

  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 16,
  },

  infoCard: {
    backgroundColor: "#EAF8D8",
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
  },

  infoText: {
    color: "#555",
    lineHeight: 24,
    marginBottom: 8,
    fontSize: 14,
  },
  warningCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 22,
    marginBottom: 35,
  },
  warningTitle: {
    color: "#9A3412",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  warningText: {
    color: "#7C2D12",
    fontSize: 13,
    lineHeight: 20,
  },
});