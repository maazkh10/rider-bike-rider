import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function HomeHeader({ onMenuPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/300?img=12",
          }}
          style={styles.avatar}
        />

        <View style={{ marginLeft: 14 }}>
          <Text style={styles.greeting}>Good Morning 👋</Text>

          <Text style={styles.name}>Maaz Khan</Text>

          <View style={styles.statusRow}>
            <View style={styles.dot} />

            <Text style={styles.status}>Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={styles.circle}>
          <Ionicons name="notifications-outline" size={24} color="#111" />
        </TouchableOpacity>
        
        <TouchableOpacity
  style={styles.circle}
  onPress={() => {
    console.log("MENU CLICKED");
    onMenuPress && onMenuPress();
  }}
>

          <Ionicons name="menu" size={28} color="#111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 15,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  greeting: {
    color: "#777",
    fontSize: 14,
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00C853",
  },

  status: {
    marginLeft: 7,
    color: "#666",
    fontWeight: "600",
  },

  right: {
    flexDirection: "row",
  },

  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 5,
  },
});
