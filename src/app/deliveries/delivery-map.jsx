import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import BackHeader from "../../components/common/BackHeader";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import Colors from "../../theme/colors";
import { getActiveRide, endRide } from "../../services/ride";
import { getLocationName } from "../../services/location.service";
import {
  stopLiveLocationTracking,
} from "../../services/liveLocation.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DeliveryMap() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rideId = String(params?.id || "");

  const [ride, setRide] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationAddress, setDestinationAddress] =
    useState("Destination");
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(async () => {
      try {
        const response = await getActiveRide();
        const active = response?.data?.activeRide;
        if (!mounted) return;
        if (!active || String(active.rideId) !== rideId) { router.replace("/(tabs)/home"); return; }
        setRide(active);
      } catch { /* Keep the last known state; the server validates completion. */ }
    }, 5000);
    return () => { mounted = false; clearInterval(timer); };
  }, [rideId]);

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    const load = async () => {
      try {
        const response = await getActiveRide();
        const activeRide = response?.data?.activeRide;

        if (!activeRide) {
          router.replace("/(tabs)/home");
          return;
        }

        if (mounted) setRide(activeRide);

        if (
          activeRide?.dropLatitude != null &&
          activeRide?.dropLongitude != null
        ) {
          const address = await getLocationName(
            activeRide.dropLatitude,
            activeRide.dropLongitude
          );

          if (mounted) setDestinationAddress(address);
        }

        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          ({ coords }) => {
            if (!mounted) return;

            setCurrentLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }
        );
      } catch (error) {
        console.log(
          "❌ DELIVERY MAP LOAD:",
          error?.response?.data || error?.message
        );
      }
    };

    load();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [rideId]);

  const destination = useMemo(() => {
    if (
      ride?.dropLatitude == null ||
      ride?.dropLongitude == null
    ) {
      return null;
    }

    return {
      latitude: Number(ride.dropLatitude),
      longitude: Number(ride.dropLongitude),
    };
  }, [ride]);

  const region = currentLocation || destination;

  const openGoogleMaps = async () => {
    if (!destination) return;

    const origin = currentLocation
      ? `&origin=${currentLocation.latitude},${currentLocation.longitude}`
      : "";

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      origin +
      `&destination=${destination.latitude},${destination.longitude}` +
      `&travelmode=driving`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Navigation error",
        "Google Maps could not be opened."
      );
    }
  };

  const handleEndRide = async () => {
    try {
      setEnding(true);

      const riderId =
        await AsyncStorage.getItem("riderId");

      if (!riderId) {
        throw new Error("Rider ID is missing.");
      }

      await endRide(
        Number(rideId),
        Number(riderId)
      );

      await stopLiveLocationTracking();
      await AsyncStorage.removeItem("activeRide");

      router.replace({
        pathname: "/deliveries/completed",
        params: { id: rideId },
      });
    } catch (error) {
      console.log(
        "❌ END RIDE:",
        error?.response?.data || error?.message
      );

      Alert.alert(
        "Unable to end ride",
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Please try again."
      );
    } finally {
      setEnding(false);
    }
  };

  if (!region) {
    return (
      <ScreenWrapper>
        <BackHeader
          title="Ride in Progress"
          subtitle="Loading destination..."
        />
        <View style={styles.center}>
          <Text style={styles.loading}>
            Loading navigation...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <BackHeader
        title={ride?.rideStatus === "AWAITING_PAYMENT" ? "Waiting for payment" : "Ride in Progress"}
        subtitle={ride?.rideStatus === "AWAITING_PAYMENT" ? "Ask the admin to complete payment in their app" : "Navigate to the showroom"}
      />

      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: 0.035,
            longitudeDelta: 0.035,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="You"
            />
          )}

          {destination && (
            <Marker
              coordinate={destination}
              title="Destination"
              description={destinationAddress}
              pinColor="#EF4444"
            />
          )}

          {currentLocation && destination && (
            <Polyline
              coordinates={[currentLocation, destination]}
              strokeWidth={5}
              strokeColor="#6FAF00"
            />
          )}
        </MapView>

        <View style={styles.sheet}>
          <View style={styles.statusRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              LIVE TRIP • LOCATION SHARED
            </Text>
          </View>

          <Text style={styles.title}>
            {ride?.vehicleName || "Bike delivery"}
          </Text>

          <Text style={styles.address}>
            {destinationAddress}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>
                {ride?.riderPaise != null ? `₹${(ride.riderPaise / 100).toFixed(2)}` : "Pending quote"}
              </Text>
              <Text style={styles.metaLabel}>Payout</Text>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>
                #{ride?.rideId || rideId}
              </Text>
              <Text style={styles.metaLabel}>Ride</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.navigateButton}
            onPress={openGoogleMaps}
          >
            <Ionicons name="navigate" size={21} color="#111" />
            <Text style={styles.navigateText}>
              Open Google Maps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.endButton,
              ending && styles.disabled,
            ]}
            disabled={ending || ride?.rideStatus !== "STARTED"}
            onPress={handleEndRide}
          >
            <Text style={styles.endText}>
              {ending ? "Ending Ride..." : ride?.rideStatus === "AWAITING_PAYMENT" ? "Waiting for admin payment" : "End Ride"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.backendNote}>
            {ride?.rideStatus === "AWAITING_PAYMENT" ? "Payment confirmation will update this screen automatically." : "End the ride after reaching the destination."}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    color: "#777",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    elevation: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 7,
  },
  liveText: {
    color: "#22C55E",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: "900",
    color: "#111",
  },
  address: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  metaCard: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  metaValue: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primary,
  },
  metaLabel: {
    marginTop: 4,
    color: "#777",
    fontSize: 12,
  },
  navigateButton: {
    marginTop: 15,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#EAFAD5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  navigateText: {
    fontWeight: "800",
    color: "#111",
  },
  endButton: {
    marginTop: 12,
    height: 58,
    borderRadius: 17,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  endText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.55,
  },
  backendNote: {
    marginTop: 10,
    textAlign: "center",
    color: "#999",
    fontSize: 11,
  },
});
