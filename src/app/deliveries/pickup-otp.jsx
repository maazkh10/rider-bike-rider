import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import Colors from "../../theme/colors";
import { getActiveRide, verifyRideOtp } from "../../services/ride";
import { startLiveLocationTracking } from "../../services/liveLocation.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PickupOTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rideId = String(params?.id || "");

  const [otp, setOtp] = useState("");
  const [ride, setRide] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const response = await getActiveRide();
        setRide(response?.data?.activeRide || null);
      } catch (error) {
        console.log(
          "❌ START OTP RIDE LOAD:",
          error?.response?.data || error?.message
        );
      }
    };

    loadRide();
  }, [rideId]);

  const handleVerify = async () => {
    if (!/^\d{4}$/.test(otp)) {
      Alert.alert("Invalid OTP", "Enter the 4-digit OTP from the admin.");
      return;
    }

    try {
      setSubmitting(true);

      const riderId =
        await AsyncStorage.getItem("riderId");

      if (!riderId) {
        throw new Error("Rider ID is missing.");
      }

      const response = await verifyRideOtp(
        Number(rideId),
        Number(riderId),
        otp
      );

      console.log("✅ START OTP VERIFIED:", response?.data);
      const refreshed = await getActiveRide();
      const serverRide = refreshed?.data?.activeRide;
      if (!serverRide || Number(serverRide.rideId) !== Number(rideId)) {
        throw new Error("The ride changed. Refresh your active ride before continuing.");
      }

      await AsyncStorage.mergeItem(
        "activeRide",
        JSON.stringify({
          rideId: Number(rideId),
          riderId: Number(riderId),
          rideStatus: serverRide.rideStatus,
          status: serverRide.rideStatus,
        })
      );

      // Keep the background tracker running.
      try {
        await startLiveLocationTracking();
      } catch (trackingError) {
        console.log(
          "⚠️ LIVE TRACKING:",
          trackingError?.message
        );
      }

      router.replace({
        pathname: "/deliveries/delivery-map",
        params: { id: rideId },
      });
    } catch (error) {
      console.log(
        "❌ START OTP ERROR:",
        error?.response?.data || error?.message
      );

      Alert.alert(
        "OTP verification failed",
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "The OTP is incorrect."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <BackHeader
        title="Start Ride"
        subtitle="Verify the admin's OTP"
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.icon}>
          <Text style={styles.iconText}>🔐</Text>
        </View>

        <Text style={styles.title}>
          Enter start OTP
        </Text>

        <Text style={styles.subtitle}>
          Ask the admin for the 4-digit ride OTP.
          {"\n"}
          After verification, the admin pays securely before the ride starts.
        </Text>

        <TextInput
          value={otp}
          onChangeText={(value) =>
            setOtp(value.replace(/\D/g, "").slice(0, 4))
          }
          keyboardType="number-pad"
          maxLength={4}
          placeholder="0000"
          placeholderTextColor="#999"
          style={styles.input}
          autoFocus
        />

        <TouchableOpacity
          style={[
            styles.button,
            submitting && styles.disabled,
          ]}
          disabled={submitting}
          onPress={handleVerify}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.rideText}>
          Ride #{ride?.rideId || rideId}
        </Text>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F7F8FA",
  },
  icon: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: "#EAFAD5",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 44,
  },
  title: {
    marginTop: 25,
    fontSize: 27,
    fontWeight: "900",
    color: "#111",
  },
  subtitle: {
    marginTop: 12,
    textAlign: "center",
    color: "#666",
    lineHeight: 23,
  },
  input: {
    width: "100%",
    height: 66,
    marginTop: 30,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    textAlign: "center",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 12,
  },
  button: {
    width: "100%",
    height: 58,
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },
  rideText: {
    marginTop: 20,
    color: "#888",
    fontWeight: "700",
  },
});
