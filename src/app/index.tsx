import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { getAuthToken, clearAuthToken } from "../utils/authToken";
import { getMyProfile } from "../services/auth.service";

export default function Index() {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await getAuthToken();

      if (!token) {
        if (mounted) setRoute("/(auth)/login");
        return;
      }

      try {
        const profile = await getMyProfile(token);
        if (!mounted) return;
        setRoute(profile?.role === "RIDER" ? "/(tabs)/home" : "/(auth)/login");
      } catch {
        await clearAuthToken();
        if (mounted) setRoute("/(auth)/login");
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (!route) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#6FAF00" />
      </View>
    );
  }

  return <Redirect href={route} />;
}
