import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../theme";

export default function Button({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,

    paddingVertical: 18,

    borderRadius: 20,

    alignItems: "center",

    justifyContent: "center",
  },

  text: {
    fontSize: 18,

    color: Colors.black,

    fontWeight: "700",
  },
});
