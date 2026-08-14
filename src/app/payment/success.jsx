
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ScreenWrapper from "../../components/common/ScreenWrapper";
import Colors from "../../theme/colors";

export default function PaymentSuccess() {
  const router = useRouter();

  // Dummy payment response
  const payment = {
    paymentId: "pay_Q3A9X1KLM12345",
    orderId: "order_Q3A8B7C6D5",
    amount: 204,
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     router.replace("/admin/searching-rider");
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Success Icon */}

        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={70} color="#fff" />
        </View>

        {/* Title */}

        <Text style={styles.title}>Payment Successful</Text>

        <Text style={styles.subtitle}>Your booking has been confirmed.</Text>

        {/* Payment Card */}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid</Text>

            <Text style={styles.value}>₹{payment.amount}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Payment ID</Text>

            <Text style={styles.smallValue}>{payment.paymentId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>

            <Text style={styles.smallValue}>{payment.orderId}</Text>
          </View>
        </View>

        {/* Status */}

        <View style={styles.statusBox}>
          <Ionicons name="search" size={24} color={Colors.primary} />

          <Text style={styles.statusText}>Searching nearby riders...</Text>
        </View>

        {/* Button */}

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/admin/searching-rider")}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#F7F8FA",

    padding: 25,
  },

  iconCircle: {
    width: 120,

    height: 120,

    borderRadius: 60,

    backgroundColor: "#22C55E",

    justifyContent: "center",

    alignItems: "center",
  },

  title: {
    marginTop: 30,

    fontSize: 30,

    fontWeight: "900",

    color: "#111",
  },

  subtitle: {
    marginTop: 10,

    fontSize: 15,

    color: "#777",

    textAlign: "center",
  },

  card: {
    width: "100%",

    backgroundColor: "#fff",

    borderRadius: 24,

    padding: 22,

    marginTop: 35,

    elevation: 5,
  },

  row: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginVertical: 12,
  },

  label: {
    fontSize: 15,

    color: "#777",
  },

  value: {
    fontSize: 22,

    fontWeight: "900",

    color: "#111",
  },

  smallValue: {
    fontSize: 13,

    fontWeight: "700",

    color: "#111",

    maxWidth: "60%",
  },

  divider: {
    height: 1,

    backgroundColor: "#EEE",

    marginVertical: 10,
  },

  statusBox: {
    marginTop: 30,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#EAFAD5",

    paddingHorizontal: 18,

    paddingVertical: 14,

    borderRadius: 18,
  },

  statusText: {
    marginLeft: 10,

    fontSize: 15,

    fontWeight: "700",

    color: "#111",
  },

  button: {
    marginTop: 30,

    width: "100%",

    height: 58,

    borderRadius: 18,

    backgroundColor: Colors.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    fontSize: 17,

    fontWeight: "800",

    color: "#111",
  },
});
