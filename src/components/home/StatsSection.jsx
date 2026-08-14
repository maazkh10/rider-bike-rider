
import { StyleSheet, Text, View } from "react-native";

import Colors from "../../theme/colors";

const stats = [
  {
    value: "12",
    label: "Completed",
  },
  {
    value: "3",
    label: "Pending",
  },
  {
    value: "₹1450",
    label: "Today's Earnings",
  },
];

export default function StatsSection() {
  return (
    <View style={styles.container}>
      {stats.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.value}>{item.value}</Text>

          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 22,
    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.06,

    shadowRadius: 12,

    elevation: 5,
  },

  value: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.black,
  },

  label: {
    textAlign: "center",
    marginTop: 10,
    color: "#777",
    fontSize: 13,
    lineHeight: 18,
  },
});
