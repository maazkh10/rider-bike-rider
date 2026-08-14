import { useRouter } from 'expo-router';
import { Alert, Modal, StyleSheet, TouchableOpacity } from "react-native";
import MenuItem from "./MenuItem";
import { logout } from "../../services/auth.service";
import ProfileCard from "./ProfileCard";

export default function MenuDrawer({ visible, onClose }) {
  const router = useRouter()
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.drawer}>
          <ProfileCard />

          {/* <MenuItem icon="home-outline" title="Home" /> */}

          <MenuItem icon="cube-outline" 
          onPress={()=>{
            onClose();
            router.push("/deliveries")
          }}
          title="Deliveries" />

          <MenuItem icon="time-outline" 
           onPress={()=>{
            onClose();
            router.push("/history")
           }}
          title="History" />

          <MenuItem icon="wallet-outline" title="Earnings"
          onPress={()=>{
            onClose();
            router.push("/earning")
           }}
           
          />

          <MenuItem icon="person-outline" title="Profile"
          
          onPress={()=>{
            onClose();
            router.push("/profile")
           }}
           
           />

          <MenuItem icon="document-text-outline" title="Documents"
            onPress={()=>{
            onClose();
            router.push("/documents")
           }} />

          <MenuItem icon="settings-outline" title="Settings" />

          <MenuItem icon="help-circle-outline" title="Support" />

          <MenuItem
            icon="log-out-outline"
            title="Logout"
            color="red"
            onPress={() => {
              Alert.alert("Log out?", "Your current rider session will be cleared.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log out",
                  style: "destructive",
                  onPress: async () => {
                    await logout();
                    onClose();
                    router.replace("/(auth)/login");
                  },
                },
              ]);
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000070",
    justifyContent: "flex-end",
  },

  drawer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    minHeight: "75%",
  },
});
