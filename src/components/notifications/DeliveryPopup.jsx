
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Colors from "../../theme/colors";

export default function DeliveryPopup({
  visible,
  delivery,
  onClose,
}) {
  const router = useRouter();

  if (!delivery) return null;

  const handleView = () => {
    onClose();

    router.push({
      pathname: "/deliveries/details",
      params: {
        id: delivery.id,
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>

        <View style={styles.card}>

          {/* Header */}

          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons
                name="notifications"
                size={28}
                color="#111"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                New Delivery
              </Text>

              <Text style={styles.subtitle}>
                A new bike delivery has been assigned.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Bike */}

          <Text style={styles.bike}>
            {delivery.bike}
          </Text>

          {/* Pickup */}

          <View style={styles.row}>
            <Ionicons
              name="cube"
              size={20}
              color="#22C55E"
            />

            <View style={styles.info}>
              <Text style={styles.label}>
                Pickup
              </Text>

              <Text style={styles.value}>
                {delivery.pickup}
              </Text>
            </View>
          </View>

          {/* Destination */}

          <View style={styles.row}>
            <Ionicons
              name="location"
              size={20}
              color="#EF4444"
            />

            <View style={styles.info}>
              <Text style={styles.label}>
                Destination
              </Text>

              <Text style={styles.value}>
                {delivery.destination}
              </Text>
            </View>
          </View>

          {/* Earnings */}

          <View style={styles.earningBox}>
            <Text style={styles.earningLabel}>
              Estimated Earnings
            </Text>

            <Text style={styles.earning}>
              ₹{delivery.amount}
            </Text>
          </View>

          {/* Buttons */}

          <View style={styles.buttons}>

            <TouchableOpacity
              style={styles.cancel}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                Dismiss
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accept}
              onPress={handleView}
            >
              <Text style={styles.acceptText}>
                View Delivery
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "#00000070",
    justifyContent: "flex-end",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    marginTop: 4,
    color: "#666",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 20,
  },

  bike: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    marginBottom: 18,
    alignItems: "center",
  },

  info: {
    marginLeft: 12,
  },

  label: {
    color: "#888",
    fontSize: 13,
  },

  value: {
    marginTop: 4,
    fontWeight: "700",
    color: "#111",
    fontSize: 16,
  },

  earningBox: {
    backgroundColor: "#F8F8F8",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 25,
  },

  earningLabel: {
    color: "#777",
  },

  earning: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: "900",
    color: Colors.primary,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancel: {
    width: "47%",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    fontWeight: "700",
    color: "#555",
  },

  accept: {
    width: "47%",
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  acceptText: {
    fontWeight: "800",
    color: "#111",
    fontSize: 15,
  },

});