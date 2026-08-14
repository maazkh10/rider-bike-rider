import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function HomeMap() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let mounted = true;
    let subscription;

    (async () => {
      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") return;

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (mounted) {
          setLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000,
            distanceInterval: 30,
          },
          ({ coords }) => {
            if (mounted) {
              setLocation({
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
            }
          }
        );
      } catch (error) {
        if (__DEV__) console.log("Home map location:", error?.message);
      }
    })();

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  if (!location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#6FAF00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...location,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker coordinate={location} title="Your current location" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 470,
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 20,
  },
  loading: {
    height: 300,
    borderRadius: 30,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  map: { flex: 1 },
});
