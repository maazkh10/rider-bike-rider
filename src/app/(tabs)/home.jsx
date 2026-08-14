import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ScreenWrapper from "../../components/common/ScreenWrapper";
import HomeHeader from "../../components/home/HomeHeader";
import HomeMap from "../../components/home/HomeMap";
import MenuDrawer from "../../components/menu/MenuDrawer";
import RideRequestModal from "../deliveries/RideRequestModal";

// ======================================================
// ACTIVE RIDE LOCATION TRACKING
// ======================================================

import {
  setActiveRideState,
  startLiveLocationTracking,
} from "../../services/liveLocation.service";

// ======================================================
// LOCATION TRACKING BEFORE RIDE
// ======================================================

import {
  startRiderLocationTracking,
  stopRiderLocationTracking,
} from "../../services/riderLocationTracking";

// ======================================================
// LOCATION NAME
// ======================================================

import { getLocationName } from "../../services/location.service";

// ======================================================
// SOCKET / NOTIFICATIONS
// ======================================================

import {
  connectRideSocket,
  disconnectRideSocket,
} from "../../services/notifications";

// ======================================================
// PROFILE API
// ======================================================

import {
  getActiveRideProfile,
  getProfile,
  getRides,
  updateRiderStatus,
} from "../../services/profile";

// ======================================================
// RIDE API
// ======================================================

import { acceptRide } from "../../services/ride";

// ======================================================
// HELPERS
// ======================================================

const rideIdOf = (ride) =>
  ride?.rideId ??
  ride?.id ??
  ride?.deliveryId ??
  null;

const statusOf = (ride) =>
  String(
    ride?.rideStatus ??
      ride?.status ??
      ""
  ).toUpperCase();

// ======================================================
// HOME
// ======================================================

export default function Home() {
  const router = useRouter();

  const mounted = useRef(true);

  // ====================================================
  // UI STATE
  // ====================================================

  const [drawerVisible, setDrawerVisible] =
    useState(false);

  const [profile, setProfile] =
    useState(null);

  const [rides, setRides] =
    useState([]);

  const [activeRide, setActiveRide] =
    useState(null);

  const [request, setRequest] =
    useState(null);

  const [requestVisible, setRequestVisible] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [busy, setBusy] =
    useState(false);

  const [statusBusy, setStatusBusy] =
    useState(false);

  // ====================================================
  // LOAD PROFILE + RIDES + ACTIVE RIDE
  // ====================================================

  const loadData = async () => {
    try {
      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "📦 LOADING RIDER HOME DATA"
      );
      console.log(
        "=========================================="
      );

      const [
        profileData,
        ridesData,
        activeData,
      ] = await Promise.all([
        getProfile(),
        getRides(),
        getActiveRideProfile(),
      ]);

      if (!mounted.current) {
        return;
      }

      console.log(
        "👤 PROFILE:",
        JSON.stringify(
          profileData,
          null,
          2
        )
      );

      console.log(
        "🚗 RIDES:",
        JSON.stringify(
          ridesData,
          null,
          2
        )
      );

      console.log(
        "🔥 ACTIVE RIDE:",
        JSON.stringify(
          activeData,
          null,
          2
        )
      );

      // -----------------------------------------------
      // SET UI STATE
      // -----------------------------------------------

      setProfile(profileData);

      setRides(
        Array.isArray(ridesData)
          ? ridesData
          : []
      );

      setActiveRide(
        activeData?.activeRide ||
          null
      );

      // -----------------------------------------------
      // SAVE USER ID
      // -----------------------------------------------

      if (
        profileData?.userId !==
        null &&
        profileData?.userId !==
        undefined
      ) {
        await AsyncStorage.setItem(
          "userId",
          String(profileData.userId)
        );
      }

      // -----------------------------------------------
      // SAVE RIDER ID
      // -----------------------------------------------

      const riderId =
        profileData?.rider?.riderId ??
        profileData?.rider?.id;

      if (
        riderId !== null &&
        riderId !== undefined
      ) {
        await AsyncStorage.setItem(
          "riderId",
          String(riderId)
        );

        console.log(
          "✅ RIDER ID SAVED:",
          riderId
        );
      }

      // =================================================
      // ACTIVE RIDE
      // =================================================

      if (activeData?.activeRide) {
        console.log("");
        console.log(
          "=========================================="
        );
        console.log(
          "🚗 ACTIVE RIDE FOUND"
        );
        console.log(
          "=========================================="
        );

        await setActiveRideState(
          activeData.activeRide
        );

        // ---------------------------------------------
        // ACTIVE RIDE LIVE LOCATION
        // ---------------------------------------------

        try {
          console.log(
            "📍 STARTING ACTIVE RIDE LOCATION TRACKING"
          );

          await startLiveLocationTracking();

          console.log(
            "✅ ACTIVE RIDE LOCATION TRACKING STARTED"
          );
        } catch (error) {
          console.log(
            "❌ ACTIVE RIDE LOCATION START FAILED:",
            error?.message
          );
        }
      }

      return {
        activeRide:
          activeData?.activeRide ||
          null,

        profile:
          profileData,
      };

    } catch (error) {
      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "❌ LOAD RIDER HOME DATA FAILED"
      );
      console.log(
        "=========================================="
      );

      console.log(
        "STATUS:",
        error?.response?.status
      );

      console.log(
        "DATA:",
        JSON.stringify(
          error?.response?.data,
          null,
          2
        )
      );

      console.log(
        "MESSAGE:",
        error?.message
      );

      console.log(
        "=========================================="
      );

      throw error;
    }
  };

  // ====================================================
  // INITIALIZE HOME
  // ====================================================

  useEffect(() => {
    mounted.current = true;

    const initialize = async () => {
      try {
        setLoading(true);

        console.log("");
        console.log(
          "=========================================="
        );
        console.log(
          "🚀 RIDER HOME INITIALIZATION"
        );
        console.log(
          "=========================================="
        );

        // ---------------------------------------------
        // LOAD DATA
        // ---------------------------------------------

        const loaded =
          await loadData();

        if (!mounted.current) {
          return;
        }

        // ---------------------------------------------
        // RIDER ID
        // ---------------------------------------------

        const riderId =
          await AsyncStorage.getItem(
            "riderId"
          );

        console.log(
          "👤 RIDER ID:",
          riderId
        );

        if (!riderId) {
          throw new Error(
            "Rider profile is not created yet. Complete rider registration first."
          );
        }

        // =================================================
        // CONNECT RIDE SOCKET
        // =================================================

        console.log(
          "📡 CONNECTING RIDE SOCKET..."
        );

        await connectRideSocket(
          async (event) => {
            if (!mounted.current) {
              return;
            }

            console.log("");
            console.log(
              "=========================================="
            );
            console.log(
              "📨 RIDE SOCKET EVENT"
            );
            console.log(
              "=========================================="
            );

            console.log(
              JSON.stringify(
                event,
                null,
                2
              )
            );

            // -------------------------------------------
            // EVENT TYPE
            // -------------------------------------------

            const type =
              String(
                event?.type ??
                  event?.eventType ??
                  event?.event ??
                  ""
              ).toUpperCase();

            // -------------------------------------------
            // RIDE CANCELLED
            // -------------------------------------------

            if (
              type ===
                "RIDE_CANCELLED" ||
              type ===
                "RIDE_CANCELLED_BY_USER"
            ) {
              console.log(
                "❌ RIDE CANCELLED"
              );

              setRequest(null);

              setRequestVisible(
                false
              );

              return;
            }

            // -------------------------------------------
            // ONLY RIDE REQUEST
            // -------------------------------------------

            if (
              type &&
              type !==
                "RIDE_REQUEST"
            ) {
              return;
            }

            // -------------------------------------------
            // RIDE ID
            // -------------------------------------------

            const rideId =
              rideIdOf(event);

            if (!rideId) {
              console.log(
                "⚠️ SOCKET EVENT DOES NOT HAVE RIDE ID"
              );

              return;
            }

            // -------------------------------------------
            // PICKUP
            // -------------------------------------------

            const pickupLatitude =
              event?.pickupLatitude ??
              event?.pickUpLatitude;

            const pickupLongitude =
              event?.pickupLongitude ??
              event?.pickUpLongitude;

            // -------------------------------------------
            // DROP
            // -------------------------------------------

            const dropLatitude =
              event?.dropLatitude;

            const dropLongitude =
              event?.dropLongitude;

            // -------------------------------------------
            // DEFAULT LOCATION NAMES
            // -------------------------------------------

            let pickupLocation =
              "Pickup location";

            let dropLocation =
              "Destination";

            // -------------------------------------------
            // REVERSE GEOCODE
            // -------------------------------------------

            try {
              if (
                pickupLatitude != null &&
                pickupLongitude != null
              ) {
                pickupLocation =
                  await getLocationName(
                    pickupLatitude,
                    pickupLongitude
                  );
              }

              if (
                dropLatitude != null &&
                dropLongitude != null
              ) {
                dropLocation =
                  await getLocationName(
                    dropLatitude,
                    dropLongitude
                  );
              }
            } catch (error) {
              console.log(
                "⚠️ LOCATION NAME ERROR:",
                error?.message
              );
            }

            // -------------------------------------------
            // SET REQUEST
            // -------------------------------------------

            const rideRequest = {
              ...event,

              rideId:
                Number(rideId),

              pickupLatitude,

              pickupLongitude,

              dropLatitude,

              dropLongitude,

              pickupLocation,

              dropLocation,
            };

            console.log(
              "🚗 NEW RIDE REQUEST:",
              JSON.stringify(
                rideRequest,
                null,
                2
              )
            );

            setRequest(
              rideRequest
            );

            setRequestVisible(
              true
            );
          }
        );

        console.log(
          "✅ RIDE SOCKET CONNECTED"
        );

        // =================================================
        // START PRE-RIDE GPS TRACKING
        // =================================================

        const riderStatus =
          String(
            loaded?.profile?.rider
              ?.status || ""
          ).toUpperCase();

        const hasActiveRide =
          !!loaded?.activeRide;

        console.log("");
        console.log(
          "=========================================="
        );
        console.log(
          "📍 RIDER LOCATION TRACKING DECISION"
        );
        console.log(
          "=========================================="
        );

        console.log(
          "RIDER STATUS:",
          riderStatus
        );

        console.log(
          "ACTIVE RIDE:",
          hasActiveRide
        );

        // -----------------------------------------------
        // NO ACTIVE RIDE + AVAILABLE
        // -----------------------------------------------

        if (
          !hasActiveRide &&
          riderStatus ===
            "AVAILABLE"
        ) {
          console.log(
            "🟢 RIDER AVAILABLE"
          );

          console.log(
            "🚀 STARTING PRE-RIDE GPS TRACKING"
          );

          try {
            await startRiderLocationTracking();

            console.log(
              "✅ PRE-RIDE GPS TRACKING STARTED"
            );
          } catch (error) {
            console.log(
              "❌ PRE-RIDE GPS START FAILED:",
              error?.message
            );
          }
        }

        // -----------------------------------------------
        // OFFLINE
        // -----------------------------------------------

        if (
          riderStatus ===
          "OFFLINE"
        ) {
          console.log(
            "🔴 RIDER IS OFFLINE"
          );

          stopRiderLocationTracking();
        }

        // -----------------------------------------------
        // ON TRIP
        // -----------------------------------------------

        if (
          riderStatus ===
            "ON_TRIP" ||
          hasActiveRide
        ) {
          console.log(
            "🚗 RIDER HAS ACTIVE RIDE"
          );

          console.log(
            "📍 PRE-RIDE GPS TRACKING NOT REQUIRED"
          );
        }

      } catch (error) {
        console.log("");
        console.log(
          "=========================================="
        );
        console.log(
          "❌ RIDER HOME INITIALIZATION FAILED"
        );
        console.log(
          "=========================================="
        );

        console.log(
          "STATUS:",
          error?.response?.status
        );

        console.log(
          "DATA:",
          JSON.stringify(
            error?.response?.data,
            null,
            2
          )
        );

        console.log(
          "MESSAGE:",
          error?.message
        );

        console.log(
          "=========================================="
        );

        Alert.alert(
          "Unable to load rider",
          error?.response?.data
            ?.message ||
            error?.message ||
            "Please try again."
        );

      } finally {
        if (
          mounted.current
        ) {
          setLoading(false);
        }
      }
    };

    initialize();

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      console.log(
        "🧹 CLEANING RIDER HOME"
      );

      mounted.current = false;

      // Stop pre-ride GPS
      stopRiderLocationTracking();

      // Disconnect socket
      disconnectRideSocket();
    };
  }, []);

  // ====================================================
  // REFRESH
  // ====================================================

  const refresh = async () => {
    try {
      setRefreshing(true);

      const loaded =
        await loadData();

      const riderStatus =
        String(
          loaded?.profile?.rider
            ?.status || ""
        ).toUpperCase();

      // -----------------------------------------------
      // Restart GPS if rider is available
      // -----------------------------------------------

      if (
        !loaded?.activeRide &&
        riderStatus ===
          "AVAILABLE"
      ) {
        try {
          await startRiderLocationTracking();
        } catch (error) {
          console.log(
            "Refresh GPS start:",
            error?.message
          );
        }
      }

      // -----------------------------------------------
      // Stop GPS if offline
      // -----------------------------------------------

      if (
        riderStatus ===
        "OFFLINE"
      ) {
        stopRiderLocationTracking();
      }

    } catch (error) {
      Alert.alert(
        "Refresh failed",
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to refresh."
      );

    } finally {
      setRefreshing(false);
    }
  };

  // ====================================================
  // ACCEPT RIDE
  // ====================================================

  const handleAccept = async () => {
    if (!request || busy) {
      return;
    }

    try {
      setBusy(true);

      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "🚗 ACCEPTING RIDE"
      );
      console.log(
        "=========================================="
      );

      // -----------------------------------------------
      // RIDER ID
      // -----------------------------------------------

      const riderId =
        await AsyncStorage.getItem(
          "riderId"
        );

      // -----------------------------------------------
      // RIDE ID
      // -----------------------------------------------

      const rideId =
        rideIdOf(request);

      console.log(
        "RIDER ID:",
        riderId
      );

      console.log(
        "RIDE ID:",
        rideId
      );

      if (
        !riderId ||
        !rideId
      ) {
        throw new Error(
          "Rider ID or ride ID is missing."
        );
      }

      // -----------------------------------------------
      // ACCEPT BACKEND RIDE
      // -----------------------------------------------

      await acceptRide(
        Number(rideId),
        Number(riderId)
      );

      console.log(
        "✅ RIDE ACCEPTED"
      );

      // -----------------------------------------------
      // CREATE ACTIVE RIDE STATE
      // -----------------------------------------------

      const accepted = {
        ...request,

        rideId:
          Number(rideId),

        riderId:
          Number(riderId),

        rideStatus:
          "ACCEPTED",

        status:
          "ACCEPTED",
      };

      // -----------------------------------------------
      // SAVE ACTIVE RIDE
      // -----------------------------------------------

      await setActiveRideState(
        accepted
      );

      // -----------------------------------------------
      // STOP PRE-RIDE TRACKING
      // -----------------------------------------------

      console.log(
        "🛑 STOPPING PRE-RIDE GPS"
      );

      stopRiderLocationTracking();

      // -----------------------------------------------
      // CLEAR REQUEST
      // -----------------------------------------------

      setRequest(null);

      setRequestVisible(
        false
      );

      // -----------------------------------------------
      // START LIVE RIDE LOCATION
      // -----------------------------------------------

      try {
        console.log(
          "📍 STARTING LIVE RIDE LOCATION"
        );

        await startLiveLocationTracking();

        console.log(
          "✅ LIVE RIDE LOCATION STARTED"
        );

      } catch (trackingError) {
        console.log(
          "❌ LIVE LOCATION START FAILED:",
          trackingError?.message
        );

        Alert.alert(
          "Location permission required",
          trackingError?.message ||
            "Enable background location before continuing the ride."
        );
      }

      // -----------------------------------------------
      // OPEN PICKUP MAP
      // -----------------------------------------------

      router.push({
        pathname:
          "/deliveries/pickup-map",

        params: {
          id: String(rideId),
        },
      });

    } catch (error) {
      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "❌ ACCEPT RIDE FAILED"
      );
      console.log(
        "=========================================="
      );

      console.log(
        "STATUS:",
        error?.response?.status
      );

      console.log(
        "DATA:",
        JSON.stringify(
          error?.response?.data,
          null,
          2
        )
      );

      console.log(
        "MESSAGE:",
        error?.message
      );

      console.log(
        "=========================================="
      );

      Alert.alert(
        "Unable to accept ride",
        error?.response?.data
          ?.message ||
          error?.response?.data ||
          error?.message ||
          "The ride may already have been accepted by another rider."
      );

    } finally {
      setBusy(false);
    }
  };

  // ====================================================
  // RIDER AVAILABLE / OFFLINE
  // ====================================================

  const handleStatusToggle = async () => {
    const current =
      String(
        profile?.rider?.status ||
          "AVAILABLE"
      ).toUpperCase();

    // Don't allow manual toggle during trip.
    if (
      current ===
      "ON_TRIP"
    ) {
      return;
    }

    try {
      setStatusBusy(true);

      const next =
        current ===
        "AVAILABLE"
          ? "OFFLINE"
          : "AVAILABLE";

      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "🔄 RIDER STATUS CHANGE"
      );
      console.log(
        "FROM:",
        current
      );
      console.log(
        "TO:",
        next
      );
      console.log(
        "=========================================="
      );

      // -----------------------------------------------
      // UPDATE BACKEND
      // -----------------------------------------------

      await updateRiderStatus(
        next
      );

      // -----------------------------------------------
      // OFFLINE
      // -----------------------------------------------

      if (
        next ===
        "OFFLINE"
      ) {
        console.log(
          "🔴 RIDER OFFLINE"
        );

        stopRiderLocationTracking();
      }

      // -----------------------------------------------
      // REFRESH PROFILE
      // -----------------------------------------------

      const loaded =
        await loadData();

      // -----------------------------------------------
      // AVAILABLE
      // -----------------------------------------------

      if (
        next ===
          "AVAILABLE" &&
        !loaded?.activeRide
      ) {
        console.log(
          "🟢 RIDER AVAILABLE"
        );

        console.log(
          "🚀 STARTING GPS TRACKING"
        );

        try {
          await startRiderLocationTracking();

          console.log(
            "✅ GPS TRACKING STARTED"
          );
        } catch (error) {
          console.log(
            "❌ GPS TRACKING START FAILED:",
            error?.message
          );

          Alert.alert(
            "Location permission required",
            error?.message ||
              "Please allow location access."
          );
        }
      }

    } catch (error) {
      console.log(
        "❌ STATUS CHANGE FAILED:",
        error?.response?.data ||
          error?.message
      );

      Alert.alert(
        "Unable to change status",
        error?.response?.data
          ?.message ||
          error?.response?.data ||
          error?.message ||
          "Please try again."
      );

    } finally {
      setStatusBusy(false);
    }
  };

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator
            color="#6FAF00"
            size="large"
          />

          <Text
            style={
              styles.muted
            }
          >
            Loading rider data...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // ====================================================
  // RIDER DATA
  // ====================================================

  const rider =
    profile?.rider;

  const fullName =
    `${profile?.firstName || ""} ${
      profile?.lastName || ""
    }`.trim() ||
    rider?.name ||
    profile?.userName ||
    "Rider";

  // ====================================================
  // UI
  // ====================================================

  return (
    <ScreenWrapper>
      <View style={styles.root}>

        {/* ==========================================
            HEADER
        ========================================== */}

        <HomeHeader
          onMenuPress={() =>
            setDrawerVisible(true)
          }
        />

        {/* ==========================================
            CONTENT
        ========================================== */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }

          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                refresh
              }
            />
          }

          contentContainerStyle={
            styles.content
          }
        >

          {/* ========================================
              PROFILE / STATUS
          ======================================== */}

          <View
            style={
              styles.headerCard
            }
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.small
                }
              >
                Hello
              </Text>

              <Text
                style={
                  styles.name
                }
              >
                {fullName}
              </Text>

              <Text
                style={
                  styles.username
                }
              >
                @
                {profile?.userName ||
                  "rider"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.statusBadge,

                rider?.status ===
                  "OFFLINE" &&
                  styles.offlineBadge,
              ]}
              disabled={
                statusBusy ||
                rider?.status ===
                  "ON_TRIP"
              }
              onPress={
                handleStatusToggle
              }
            >
              <View
                style={[
                  styles.dot,

                  rider?.status ===
                    "OFFLINE" &&
                    styles.offlineDot,
                ]}
              />

              <Text
                style={
                  styles.statusText
                }
              >
                {statusBusy
                  ? "..."
                  : rider?.status ||
                    "AVAILABLE"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ========================================
              ACTIVE RIDE
          ======================================== */}

          {activeRide ? (
            <TouchableOpacity
              style={
                styles.activeCard
              }
              onPress={() =>
                router.push({
                  pathname:
                    statusOf(
                      activeRide
                    ) ===
                    "STARTED"
                      ? "/deliveries/delivery-map"
                      : "/deliveries/pickup-map",

                  params: {
                    id: String(
                      rideIdOf(
                        activeRide
                      )
                    ),
                  },
                })
              }
            >
              <Text
                style={
                  styles.activeLabel
                }
              >
                ACTIVE RIDE
              </Text>

              <Text
                style={
                  styles.activeTitle
                }
              >
                {activeRide.vehicleName ||
                  "Bike delivery"}
              </Text>

              <Text
                style={
                  styles.activeSub
                }
              >
                #
                {
                  activeRide.rideId
                }{" "}
                •{" "}
                {statusOf(
                  activeRide
                )}
              </Text>

              <Text
                style={
                  styles.activeFare
                }
              >
                ₹
                {Number(
                  activeRide.fare ||
                    0
                ).toFixed(2)}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* ========================================
              STATS
          ======================================== */}

          <View
            style={
              styles.statsRow
            }
          >
            <Stat
              label="Total rides"
              value={
                rides.length
              }
            />

            <Stat
              label="Completed"
              value={
                rides.filter(
                  (item) =>
                    statusOf(
                      item
                    ) ===
                    "COMPLETED"
                ).length
              }
            />

            <Stat
              label="Earnings"
              value={`₹${rides
                .filter(
                  (item) =>
                    statusOf(
                      item
                    ) ===
                    "COMPLETED"
                )
                .reduce(
                  (
                    sum,
                    item
                  ) =>
                    sum +
                    Number(
                      item.fare ||
                        0
                    ),
                  0
                )
                .toFixed(0)}`}
            />
          </View>

          {/* ========================================
              MAP
          ======================================== */}

          <HomeMap />

          {/* ========================================
              RECENT RIDES
          ======================================== */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Recent rides
          </Text>

          {rides
            .slice(0, 5)
            .map((ride) => (
              <TouchableOpacity
                key={String(
                  ride.rideId
                )}
                style={
                  styles.rideCard
                }
                onPress={() =>
                  router.push({
                    pathname:
                      "/history/details",

                    params: {
                      id: String(
                        ride.rideId
                      ),
                    },
                  })
                }
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.rideTitle
                    }
                  >
                    {ride.vehicleName ||
                      "Bike delivery"}
                  </Text>

                  <Text
                    style={
                      styles.rideSub
                    }
                  >
                    Ride #
                    {
                      ride.rideId
                    }{" "}
                    •{" "}
                    {statusOf(
                      ride
                    )}
                  </Text>
                </View>

                <Text
                  style={
                    styles.rideFare
                  }
                >
                  ₹
                  {Number(
                    ride.fare ||
                      0
                  ).toFixed(0)}
                </Text>
              </TouchableOpacity>
            ))}

          {/* ========================================
              EMPTY RIDES
          ======================================== */}

          {!rides.length ? (
            <View
              style={
                styles.empty
              }
            >
              <Text
                style={
                  styles.emptyTitle
                }
              >
                No rides yet
              </Text>

              <Text
                style={
                  styles.muted
                }
              >
                New assignments will
                appear here when the
                admin dispatches one.
              </Text>
            </View>
          ) : null}

        </ScrollView>

        {/* ==========================================
            RIDE REQUEST MODAL
        ========================================== */}

        <RideRequestModal
          visible={
            requestVisible
          }

          rideData={
            request
          }

          onAccept={
            handleAccept
          }

          onDecline={() => {
            setRequest(null);

            setRequestVisible(
              false
            );
          }}

          accepting={
            busy
          }
        />

        {/* ==========================================
            MENU
        ========================================== */}

        <MenuDrawer
          visible={
            drawerVisible
          }

          onClose={() =>
            setDrawerVisible(
              false
            )
          }
        />

      </View>
    </ScreenWrapper>
  );
}

// ======================================================
// STAT COMPONENT
// ======================================================

function Stat({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.stat
      }
    >
      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor:
        "#F7F7F7",
    },

    content: {
      padding: 16,
      paddingBottom: 40,
    },

    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    muted: {
      marginTop: 6,
      color: "#777",
      textAlign:
        "center",
    },

    headerCard: {
      backgroundColor:
        "#fff",
      borderRadius: 22,
      padding: 18,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    small: {
      color: "#888",
      fontSize: 12,
    },

    name: {
      fontSize: 23,
      fontWeight: "900",
      color: "#111",
      marginTop: 3,
    },

    username: {
      color: "#777",
      marginTop: 3,
    },

    statusBadge: {
      backgroundColor:
        "#EAFAD5",
      borderRadius: 20,
      paddingHorizontal: 11,
      paddingVertical: 8,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    offlineBadge: {
      backgroundColor:
        "#F1F1F1",
    },

    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#6FAF00",
      marginRight: 6,
    },

    offlineDot: {
      backgroundColor:
        "#999",
    },

    statusText: {
      fontSize: 11,
      fontWeight: "900",
    },

    activeCard: {
      backgroundColor:
        "#111",
      borderRadius: 22,
      padding: 18,
      marginTop: 14,
    },

    activeLabel: {
      color: "#A8D85B",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1,
    },

    activeTitle: {
      color: "#fff",
      fontSize: 21,
      fontWeight: "900",
      marginTop: 6,
    },

    activeSub: {
      color: "#bbb",
      marginTop: 4,
    },

    activeFare: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "900",
      marginTop: 12,
    },

    statsRow: {
      flexDirection:
        "row",
      backgroundColor:
        "#fff",
      borderRadius: 20,
      marginTop: 14,
      paddingVertical: 18,
    },

    stat: {
      flex: 1,
      alignItems:
        "center",
    },

    statValue: {
      fontSize: 20,
      fontWeight: "900",
      color: "#111",
    },

    statLabel: {
      fontSize: 11,
      color: "#777",
      marginTop: 4,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: "#111",
      marginTop: 22,
      marginBottom: 10,
    },

    rideCard: {
      backgroundColor:
        "#fff",
      borderRadius: 17,
      padding: 16,
      marginBottom: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    rideTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: "#111",
    },

    rideSub: {
      color: "#777",
      marginTop: 4,
      fontSize: 12,
    },

    rideFare: {
      fontSize: 16,
      fontWeight: "900",
      color: "#5C9200",
    },

    empty: {
      backgroundColor:
        "#fff",
      borderRadius: 20,
      padding: 25,
      alignItems:
        "center",
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111",
    },
  });