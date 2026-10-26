
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../theme/colors";

export default function PaymentButton({ amount, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.button}
      onPress={onPress}
    >
      {/* Left */}

      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Ionicons name="card" size={24} color="#111" />
        </View>

        <View style={styles.info}>
          <Text style={styles.payText}>Payment setup pending</Text>

          <Text style={styles.gateway}>Server verification required</Text>
        </View>
      </View>

      {/* Right */}

      <View style={styles.amountContainer}>
        <Text style={styles.amount}>₹{amount}</Text>

        <Ionicons name="arrow-forward" size={22} color="#111" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 25,

    marginBottom: 40,

    backgroundColor: Colors.primary,

    borderRadius: 22,

    padding: 20,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 6,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 56,
    height: 56,

    borderRadius: 18,

    backgroundColor: "#FFFFFF70",

    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    marginLeft: 15,
  },

  payText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  gateway: {
    marginTop: 5,
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },

  amountContainer: {
    alignItems: "flex-end",
  },

  amount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginBottom: 5,
  },
});
