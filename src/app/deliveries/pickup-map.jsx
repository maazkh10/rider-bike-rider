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
import { getActiveRide, cancelRideByRider } from "../../services/ride";
import { getLocationName } from "../../services/location.service";
import { stopLiveLocationTracking, clearActiveRideState } from "../../services/liveLocation.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PickupMap() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [ride, setRide] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("Pickup location");
  const [loading, setLoading] = useState(true);

  const rideId = String(params?.id || "");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getActiveRide();
        const activeRide = response?.data?.activeRide;

        if (!activeRide && mounted) {
          Alert.alert(
            "Ride unavailable",
            "This ride is no longer active."
          );
          router.replace("/(tabs)/home");
          return;
        }

        if (!mounted) return;

        setRide(activeRide);

        if (
          activeRide?.pickupLatitude != null &&
          activeRide?.pickupLongitude != null
        ) {
          const address = await getLocationName(
            activeRide.pickupLatitude,
            activeRide.pickupLongitude
          );

          if (mounted) setPickupAddress(address);
        }

        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status === "granted") {
          const position =
            await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });

          if (mounted) {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        }
      } catch (error) {
        console.log(
          "❌ PICKUP MAP LOAD:",
          error?.response?.data || error?.message
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [rideId]);

  const pickup = useMemo(() => {
    if (
      ride?.pickupLatitude == null ||
      ride?.pickupLongitude == null
    ) {
      return null;
    }

    return {
      latitude: Number(ride.pickupLatitude),
      longitude: Number(ride.pickupLongitude),
    };
  }, [ride]);

  const region = pickup || currentLocation;

  const openGoogleMaps = async () => {
    if (!pickup) return;

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${pickup.latitude},${pickup.longitude}` +
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

  const handleCancel = () => {
    Alert.alert(
      "Cancel ride?",
      "The backend will mark this rider assignment as cancelled and attempt a rematch.",
      [
        { text: "Keep ride", style: "cancel" },
        {
          text: "Cancel ride",
          style: "destructive",
          onPress: async () => {
            try {
              const riderId = await AsyncStorage.getItem("riderId");
              await cancelRideByRider(Number(rideId), Number(riderId));
              await stopLiveLocationTracking().catch(() => {});
              await clearActiveRideState();
              router.replace("/(tabs)/home");
            } catch (error) {
              Alert.alert(
                "Unable to cancel",
                error?.response?.data?.message ||
                  error?.response?.data ||
                  error?.message ||
                  "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleArrived = () => {
    router.push({
      pathname: "/deliveries/pickup-otp",
      params: { id: rideId },
    });
  };

  if (loading || !region) {
    return (
      <ScreenWrapper>
        <BackHeader
          title="Navigate to Pickup"
          subtitle="Go to the admin pickup location"
        />
        <View style={styles.center}>
          <Text style={styles.loading}>
            Loading pickup location...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <BackHeader
        title="Navigate to Pickup"
        subtitle="Go to the admin pickup location"
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
              description="Your current location"
            />
          )}

          {pickup && (
            <Marker
              coordinate={pickup}
              title="Pickup"
              description={pickupAddress}
              pinColor="#6FAF00"
            />
          )}

          {currentLocation && pickup && (
            <Polyline
              coordinates={[currentLocation, pickup]}
              strokeWidth={5}
              strokeColor="#6FAF00"
            />
          )}
        </MapView>

        <View style={styles.sheet}>
          <Text style={styles.label}>PICKUP</Text>
          <Text style={styles.address}>{pickupAddress}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>
                ₹{ride?.fare ?? 0}
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
            style={styles.arrivedButton}
            onPress={handleArrived}
          >
            <Text style={styles.arrivedText}>
              I've Arrived
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancel Ride</Text>
          </TouchableOpacity>
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
  label: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#888",
  },
  address: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
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
    marginTop: 16,
    height: 55,
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
  arrivedButton: {
    marginTop: 12,
    height: 58,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: { marginTop: 10, height: 50, borderRadius: 15, backgroundColor: "#FEECEC", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#C62828", fontWeight: "800" },
  arrivedText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111",
  },
});
