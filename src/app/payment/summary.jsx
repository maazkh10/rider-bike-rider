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

export default function PaymentSummary() {
  const router = useRouter();

  // Dummy Data (Later this will come from the previous screen)
  const delivery = {
    bike: "Royal Enfield Classic 350",

    pickup: "Central Godown, Mumbai",

    destination: "Honda Showroom, Andheri",

    distance: "12.4 KM",

    eta: "18 mins",

    deliveryCharge: 180,

    platformFee: 20,

    gst: 4,
  };

  const total =
    delivery.deliveryCharge +
    delivery.platformFee +
    delivery.gst;

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
            value={`₹${delivery.deliveryCharge}`}
          />

          <PriceRow
            title="Platform Fee"
            value={`₹${delivery.platformFee}`}
          />

          <PriceRow
            title="GST"
            value={`₹${delivery.gst}`}
          />

          <View style={styles.divider} />

          <PriceRow
            title="Total Amount"
            value={`₹${total}`}
            total
          />
        </View>

        {/* Information */}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Payment Information
          </Text>

          <Text style={styles.infoText}>
            • Your payment will be securely
            processed through Razorpay.
          </Text>

          <Text style={styles.infoText}>
            • Payment will only be released
            after the delivery is successfully
            completed.
          </Text>

          <Text style={styles.infoText}>
            • Rider earnings are credited after
            successful delivery confirmation.
          </Text>
        </View>

        {/* Pay Button */}

        <PaymentButton
          amount={total}
          onPress={() =>
            router.push("/payment/processing")
          }
        />
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
});