import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../../components/common/Button";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import Colors from "../../theme/colors";

export default function OTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);

  const input1 = useRef(null);
  const input2 = useRef(null);
  const input3 = useRef(null);
  const input4 = useRef(null);
  const input5 = useRef(null);
  const input6 = useRef(null);

  const inputs = [input1, input2, input3, input4, input5, input6];

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    const arr = [...otp];
    arr[index] = text;
    setOtp(arr);

    if (text && index < 5) {
      inputs[index + 1].current.focus();
    }
  };

  const verifyOTP = () => {
    router.replace("/(tabs)/home");
  };

  const resendOTP = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    input1.current.focus();
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>OTP Verification</Text>

          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your mobile number.
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputs[index]}
                style={styles.box}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
              />
            ))}
          </View>

          <Text style={styles.timer}>
            {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive the OTP?"}
          </Text>

          {timer === 0 && (
            <TouchableOpacity onPress={resendOTP}>
              <Text style={styles.resend}>Resend OTP</Text>
            </TouchableOpacity>
          )}

          <Button
            title="Verify OTP"
            onPress={verifyOTP}
            style={{ marginTop: 40 }}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.black,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    lineHeight: 24,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 45,
  },

  box: {
    width: 52,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
  },

  timer: {
    marginTop: 30,
    textAlign: "center",
    color: "#888",
    fontSize: 15,
  },

  resend: {
    textAlign: "center",
    marginTop: 10,
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});
