import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StatusBadge({ status }) {
  const getStatusStyle = () => {
    switch (status) {
      case "Assigned":
        return {
          backgroundColor: "#E8FFF0",
          color: "#00C853",
        };

      case "Pending":
        return {
          backgroundColor: "#FFF8E1",
          color: "#F9A825",
        };

      case "In Transit":
        return {
          backgroundColor: "#E3F2FD",
          color: "#1976D2",
        };

      case "Completed":
        return {
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
        };

      case "Cancelled":
        return {
          backgroundColor: "#FDECEC",
          color: "#D32F2F",
        };

      default:
        return {
          backgroundColor: "#EEEEEE",
          color: "#666",
        };
    }
  };

  const stylesData = getStatusStyle();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: stylesData.backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: stylesData.color,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});