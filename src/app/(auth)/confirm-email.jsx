import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import {
  confirmEmailToken,
  createRider,
  getMyProfile,
  sendJWT
} from "../../services/auth.service";

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = params?.email || "";
  const username = params?.username || "";
  const firstName = params?.firstName || "";
  const lastName = params?.lastName || "";
  const mobileNumber = params?.mobileNumber || "";

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const code = String(token || "").trim();

    if (!/^\d{4,8}$/.test(code)) {
      Alert.alert("Invalid OTP", "Enter the confirmation token sent to your email.");
      return;
    }

    try {
      setLoading(true);

      const verifyResponse = await confirmEmailToken(email, code);
      const authToken = verifyResponse?.token || (await sendJWT(username)).token;
      const userId = verifyResponse?.userId;

      if (!authToken) throw new Error("Backend did not return a JWT.");
      await AsyncStorage.setItem("token", authToken);
      if (userId != null) await AsyncStorage.setItem("userId", String(userId));
      if (username) await AsyncStorage.setItem("username", String(username));
      if (mobileNumber) await AsyncStorage.setItem("mobileNumber", String(mobileNumber));

      const fullName = `${firstName} ${lastName}`.trim() || String(username);

      // POST /rider is ownership-by-JWT. The docs explicitly say the body
      // must NOT contain userId.
      let profile = null;
      try {
        profile = await getMyProfile(authToken);
      } catch (profileError) {
        if (profileError?.response?.status !== 401) {
          throw profileError;
        }
      }

      let riderId =
        profile?.rider?.riderId ??
        profile?.rider?.id ??
        null;

      if (!riderId) {
        const created = await createRider(
          {
            name: fullName,
            mobileNumber,
            status: "AVAILABLE",
          },
          authToken
        );

        riderId =
          created?.id ??
          created?.riderId ??
          created?.rider?.riderId ??
          null;
      }

      if (!riderId) {
        throw new Error("The backend did not return the created rider ID.");
      }

      await AsyncStorage.setItem("riderId", String(riderId));

      Alert.alert(
        "Account verified",
        "Your rider profile is ready. Complete verification so the admin can approve matching.",
        [{ text: "Continue", onPress: () => router.replace("/docs-Verification") }]
      );
    } catch (error) {
      Alert.alert(
        "Verification failed",
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Unable to verify the account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={
          styles.scrollContainer
        }
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >

            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />

          </TouchableOpacity>

          <Text style={styles.title}>
            Verify Email
          </Text>

          <Text style={styles.subtitle}>
            Enter the confirmation OTP sent
            to your email address.
          </Text>

        </View>

        {/* FORM */}

        <View style={styles.form}>

          {/* EMAIL */}

          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="mail-outline"
              size={20}
              color="#9CA3AF"
            />

            <TextInput
              style={styles.input}
              placeholder="Registered Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              editable={false}
            />

          </View>

          {/* OTP */}

          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="key-outline"
              size={20}
              color="#9CA3AF"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#9CA3AF"
              value={token}
              onChangeText={setToken}
              keyboardType="numeric"
              maxLength={6}
            />

          </View>

          {/* BUTTON */}

          <TouchableOpacity
            style={styles.button}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >

            {loading ? (

              <ActivityIndicator
                color="#FFFFFF"
              />

            ) : (

              <Text
                style={
                  styles.buttonText
                }
              >
                Verify Account
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
    marginBottom: 28,
  },

  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 5,
  },

  form: {
    gap: 16,
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
    height: 52,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

});