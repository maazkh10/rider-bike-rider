import { setAuthToken } from "../../utils/authToken";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getMyProfile, loginWithCurrentBackend } from "../../services/auth.service";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      Alert.alert("Missing fields", "Enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginWithCurrentBackend(
        cleanUsername,
        password
      );

      const token = result?.token;
      if (!token) throw new Error("Authentication token was not returned.");

      await setAuthToken(token);

      const profile = await getMyProfile(token);

      if (profile?.role !== "RIDER") {
        throw new Error("This account does not have rider access.");
      }

      if (profile?.userId != null) {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        await AsyncStorage.setItem("userId", String(profile.userId));
      }

      const riderId = profile?.rider?.riderId ?? profile?.rider?.id;
      if (riderId != null) {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        await AsyncStorage.setItem("riderId", String(riderId));
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert(
        "Login failed",
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>USERNAME</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              placeholderTextColor="#8E8E93"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/Register")}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  innerContainer: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingVertical: 20,
  },

  headerContainer: {
    marginTop: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },

  formContainer: {
    marginVertical: 20,
  },

  inputGroup: {
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 28,
  },

  forgotText: {
    color: "#000",
    fontWeight: "500",
  },

  loginButton: {
    height: 52,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  footerText: {
    color: "#666",
    fontSize: 14,
  },

  signUpText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
});