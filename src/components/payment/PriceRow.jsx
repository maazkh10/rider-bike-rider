import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PriceRow({
  title,
  value,
  total = false,
}) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.title,
          total && styles.totalText,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.value,
          total && styles.totalValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginVertical: 10,
  },

  title: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },

  value: {
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
  },

  totalText: {
    fontSize: 18,
    color: "#111",
    fontWeight: "800",
  },

  totalValue: {
    fontSize: 22,
    color: "#22C55E",
    fontWeight: "900",
  },

});