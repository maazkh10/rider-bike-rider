import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";

export default function Header({ title, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },

  title: {
    fontSize: 38,

    fontWeight: "800",

    color: Colors.black,
  },

  subtitle: {
    marginTop: 6,

    fontSize: 16,

    color: "#777",
  },
});
