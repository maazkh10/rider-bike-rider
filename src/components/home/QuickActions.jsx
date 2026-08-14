import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../theme/colors";

const actions = [
  { icon: "navigate", title: "Navigate" },
  { icon: "call", title: "Call" },
  { icon: "chatbox", title: "Support" },
  { icon: "wallet", title: "Wallet" },
];

export default function QuickActions() {
  return (
    <View style={styles.container}>
      {actions.map((item) => (
        <TouchableOpacity key={item.title} style={styles.card}>
          <Ionicons
            name={item.icon}
            size={28}
            color={Colors.black}
          />

          <Text style={styles.text}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  card: {
    backgroundColor: "#fff",
    width: "23%",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 22,
  },

  text: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
  },
});