import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Use router for Expo Router navigation
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { register } from "../../services/auth.service";

export default function RegisterScreen() {

  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RIDER");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


//   useEffect(() => {
//   AsyncStorage.removeItem("token");
// }, []);

  const handlePhone = (text) => {
    const clean = text.replace(/[^0-9]/g, "");
    setPhoneNumber(clean);
  };
  const handleRegister = async () => {
    // Basic Client-side Validation
    if (
      !firstName ||
      !lastName ||
      !userName ||
      !phoneNumber ||
      !email ||
      !password
    ) {
      Alert.alert("Missing Fields", "Please fill in all the required fields.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userName: userName.trim(),
      mobileNumber: phoneNumber.trim(),
      mobileOtp: "",
      email: email.trim().toLowerCase(),
      password: password,
      role: role.toUpperCase(),
    };

    try {
      setLoading(true);

      console.log("========== REGISTER PAYLOAD ==========");
console.log(JSON.stringify(payload, null, 2));
console.log("======================================");
      const result = await register(payload);


console.log("REGISTER RESPONSE");
console.log(JSON.stringify(result, null, 2));


      // Fixed Alert syntax: Buttons must be passed inside an Array []
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => {
           router.push({
  pathname: "/(auth)/confirm-email",
  params: {
    email: email.trim().toLowerCase(),
    username: userName.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    mobileNumber: phoneNumber.trim(),
  },
});
          },
          
        },
      ]);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        {/* Role Selector (User / Admin) */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
  style={[styles.roleTab, role === "RIDER" && styles.activeRoleTab]}
  onPress={() => setRole("RIDER")}
>
            <Ionicons
              name="person"
              size={18}
              color={role === "user" ? "#4F46E5" : "#6B7280"}
            />
            <Text style={styles.buttonText}>
  Register as Rider
</Text>

          </TouchableOpacity>
        </View>
        {/* Form Container */}
        <View style={styles.form}>
          {/* Name Row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Ionicons name="at-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
            />
          </View>

          {/* phone number  */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={handlePhone}
              textContentType="telephoneNumber"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Register as {role === "admin" ? "Admin" : "User"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeRoleTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeRoleText: {
    color: "#4F46E5",
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  button: {
    backgroundColor: "#4F46E5",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
