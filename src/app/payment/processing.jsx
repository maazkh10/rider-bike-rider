import { useEffect } from "react";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useRouter } from "expo-router";

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";

import Colors from "../../theme/colors";

export default function Processing() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Later Razorpay will open here

      router.replace("/payment/success");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenWrapper>
      <BackHeader title="Processing Payment" subtitle="Please wait..." />

      <View style={styles.container}>
        {/* Card */}

        <View style={styles.card}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₹</Text>
          </View>

          <Text style={styles.title}>Processing Payment</Text>

          <Text style={styles.subtitle}>
            Connecting securely with
            {"\n"}
            Razorpay...
          </Text>

          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loader}
          />

          <Text style={styles.info}>Please don't close the app</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#F7F8FA",

    padding: 20,
  },

  card: {
    width: "100%",

    backgroundColor: "#fff",

    borderRadius: 28,

    padding: 35,

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 12,

    elevation: 5,
  },

  logo: {
    width: 100,

    height: 100,

    borderRadius: 50,

    backgroundColor: Colors.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  logoText: {
    fontSize: 48,

    fontWeight: "900",

    color: "#111",
  },

  title: {
    marginTop: 30,

    fontSize: 26,

    fontWeight: "800",

    color: "#111",
  },

  subtitle: {
    marginTop: 12,

    textAlign: "center",

    color: "#666",

    fontSize: 15,

    lineHeight: 24,
  },

  loader: {
    marginTop: 35,
  },

  info: {
    marginTop: 30,

    color: "#888",

    fontSize: 15,

    fontWeight: "600",
  },
});
