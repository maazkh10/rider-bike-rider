import { View, Text, StyleSheet } from "react-native";
import Colors from "../../theme/colors";

export default function RiderStackCard({
    value , title
}) {

    return(
        <View style={styles.card}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    card: {
    backgroundColor: "#fff",
    flex: 1,
    margin: 5,
    padding: 18,
    borderRadius: 22,
  },

  value: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
  },

  title: {
    marginTop: 8,
    color: "#666",
  },
})