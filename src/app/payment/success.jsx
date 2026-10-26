import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import Colors from "../../theme/colors";

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // This route is informational only until a backend-verified Razorpay
  // payment result is passed here. Never invent payment/order IDs on-device.
  const verified = params?.verified === "true" && Boolean(params?.paymentId);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={[styles.iconCircle, !verified && styles.pendingCircle]}>
          <Ionicons name={verified ? "checkmark" : "alert-circle-outline"} size={64} color="#fff" />
        </View>
        <Text style={styles.title}>{verified ? "Payment Verified" : "Payment not confirmed"}</Text>
        <Text style={styles.subtitle}>
          {verified
            ? "The server has confirmed this payment."
            : "A payment will only be shown as successful after Razorpay checkout and server-side signature verification. No verified payment details were provided."}
        </Text>

        {verified ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Payment ID</Text>
              <Text style={styles.smallValue}>{String(params.paymentId)}</Text>
            </View>
            {params.orderId ? (
              <View style={styles.row}>
                <Text style={styles.label}>Order ID</Text>
                <Text style={styles.smallValue}>{String(params.orderId)}</Text>
              </View>
            ) : null}
            {params.amount ? (
              <View style={styles.row}>
                <Text style={styles.label}>Amount paid</Text>
                <Text style={styles.value}>₹{String(params.amount)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={() => router.replace("/payment/summary")}>
          <Text style={styles.buttonText}>{verified ? "Done" : "Back to payment summary"}</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F8FA", padding: 25 },
  iconCircle: { width: 112, height: 112, borderRadius: 56, backgroundColor: "#22C55E", justifyContent: "center", alignItems: "center" },
  pendingCircle: { backgroundColor: "#D97706" },
  title: { marginTop: 25, fontSize: 28, fontWeight: "900", color: "#111", textAlign: "center" },
  subtitle: { marginTop: 10, fontSize: 15, lineHeight: 23, color: "#777", textAlign: "center" },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 20, padding: 18, marginTop: 24, elevation: 3 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  label: { fontSize: 13, color: "#777" },
  value: { fontSize: 18, fontWeight: "900", color: "#111" },
  smallValue: { fontSize: 12, fontWeight: "700", color: "#111", maxWidth: "60%" },
  button: { marginTop: 24, width: "100%", minHeight: 54, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", paddingHorizontal: 12 },
  buttonText: { fontSize: 15, fontWeight: "800", color: "#111", textAlign: "center" },
});
