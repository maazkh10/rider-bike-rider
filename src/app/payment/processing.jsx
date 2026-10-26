import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import Colors from "../../theme/colors";

export default function Processing() {
  const router = useRouter();

  // This route deliberately does not simulate checkout. The secure payment
  // flow must first create a server-side Razorpay order, open the checkout SDK,
  // then verify the returned signature on the backend before showing success.
  return (
    <ScreenWrapper>
      <BackHeader title="Payment setup required" subtitle="Checkout has not been started" />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logo}>₹</Text>
          <Text style={styles.title}>Payment is not yet confirmed</Text>
          <Text style={styles.subtitle}>
            This app does not yet have a verified Razorpay order flow connected.
            No payment has been taken and this screen will not report a false success.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace("/payment/summary")}>
            <Text style={styles.buttonText}>Back to payment summary</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F8FA", padding: 20 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 28, padding: 28, alignItems: "center", elevation: 3 },
  logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, textAlign: "center", textAlignVertical: "center", fontSize: 44, fontWeight: "900", color: "#111", overflow: "hidden" },
  title: { marginTop: 24, fontSize: 23, fontWeight: "900", color: "#111", textAlign: "center" },
  subtitle: { marginTop: 12, fontSize: 15, lineHeight: 23, color: "#666", textAlign: "center" },
  button: { marginTop: 28, minHeight: 52, borderRadius: 16, backgroundColor: Colors.primary, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", width: "100%" },
  buttonText: { fontSize: 15, fontWeight: "800", color: "#111", textAlign: "center" },
});
