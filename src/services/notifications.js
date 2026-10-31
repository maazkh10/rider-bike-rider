import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import * as Device from "expo-device";
import Constants from "expo-constants";
import SockJS from "sockjs-client";
import { getAuthToken } from "../utils/authToken";
import { registerPushDevice } from "./pushRegistration";

let stompClient = null;
let currentRideCallback = null;

const saveRideEvent = async (event) => {
  try {
    const raw = await AsyncStorage.getItem("rideEvents");
    const previous = raw ? JSON.parse(raw) : [];
    const next = [
      {
        ...event,
        localId: `${Date.now()}-${previous.length}`,
        receivedAt: new Date().toISOString(),
      },
      ...previous,
    ].slice(0, 50);
    await AsyncStorage.setItem("rideEvents", JSON.stringify(next));
  } catch {}
};

// Expo Go (storeClient) does not support Android remote push notifications
// on current Expo SDKs. Do not statically import expo-notifications here,
// otherwise Expo Go can throw during module evaluation before the app starts.
const isExpoGo = Constants.executionEnvironment === "storeClient";
let Notifications = null;
let notificationLoadPromise = null;

const getNotifications = async () => {
  if (isExpoGo) return null;
  if (Notifications) return Notifications;
  if (!notificationLoadPromise) {
    notificationLoadPromise = import("expo-notifications")
      .then((module) => {
        Notifications = module;
        return module;
      })
      .catch((error) => {
        if (__DEV__) console.log("Notifications unavailable:", error?.message);
        return null;
      });
  }
  return notificationLoadPromise;
};

const configureNotificationHandler = async () => {
  const module = await getNotifications();
  if (!module?.setNotificationHandler) return;

  module.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const configureNotificationChannels = async () => {
  const module = await getNotifications();
  if (!module || !Device.isDevice) return;

  if (typeof module.setNotificationChannelAsync === "function") {
    await module.setNotificationChannelAsync("ride-requests", {
      name: "Ride requests",
      importance: module.AndroidImportance?.MAX ?? 5,
      vibrationPattern: [0, 250, 150, 250],
      sound: "default",
    });
    await module.setNotificationChannelAsync("ride-status", {
      name: "Ride status",
      importance: module.AndroidImportance?.HIGH ?? 4,
      sound: "default",
    });
  }
};

export const showRideNotification = async (title, body, data = {}) => {
  try {
    const module = await getNotifications();
    if (!module?.scheduleNotificationAsync) return null;

    await module.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  } catch (error) {
    if (__DEV__) console.log("Notification error", error?.message);
  }
};

export const addNotificationListeners = async (onReceived, onResponse) => {
  const module = await getNotifications();
  if (!module) return () => {};

  const received = onReceived
    ? module.addNotificationReceivedListener(onReceived)
    : null;
  const response = onResponse
    ? module.addNotificationResponseReceivedListener(onResponse)
    : null;

  return () => {
    received?.remove?.();
    response?.remove?.();
  };
};

// Configure only when a development/standalone build supports the module.
void configureNotificationHandler();


// ======================================================
// PUSH NOTIFICATIONS
// ======================================================

export const registerForNotifications = async () => {
  try {
    // Expo Go on current SDKs cannot provide Android remote push notifications.
    // Return quietly so notifications never block the rider app startup.
    const module = await getNotifications();
    if (!module) return null;

    await configureNotificationChannels();

    // Push notifications require a physical device.
    if (!Device.isDevice) {
      console.log(
        "⚠️ Push notifications skipped: physical device required."
      );

      return null;
    }

    const { status: existingStatus } =
      await module.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await module.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log(
        "⚠️ Push notification permission was not granted."
      );

      return null;
    }

    const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    const tokenResponse =
      await module.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

    const pushToken = tokenResponse?.data;

    if (!pushToken) {
      console.log(
        "⚠️ Expo push token was not generated."
      );

      return null;
    }

    // Never log the token. A server registration API is required for remote push delivery.
    // Register with the authenticated backend. A generated token alone cannot
    // receive remote pushes until the server associates it with this Rider.
    await registerPushDevice(pushToken);

    return pushToken;

  } catch (error) {
    console.error(
      "❌ Push notification registration failed:",
      error?.message || error
    );

    return null;
  }
};


// ======================================================
// CONNECT RIDER WEBSOCKET
// ======================================================

export const connectRideSocket = async (
  onRideReceived
) => {
  try {

    // --------------------------------------------------
    // Get JWT
    // --------------------------------------------------

    const token =
      await getAuthToken();

    // --------------------------------------------------
    // Get Rider ID
    // --------------------------------------------------

    const riderId =
      await AsyncStorage.getItem("riderId");


    console.log(
      "=========================================="
    );

    console.log(
      "🔌 RIDER WEBSOCKET INITIALIZATION"
    );

    console.log(
      "JWT:",
      token ? "FOUND" : "MISSING"
    );

    console.log(
      "RIDER ID:",
      riderId
    );

    console.log(
      "=========================================="
    );


    if (!token) {
      console.log(
        "❌ WebSocket stopped: JWT not found."
      );

      return;
    }


    if (!riderId) {
      console.log(
        "❌ WebSocket stopped: riderId not found."
      );

      return;
    }


    // --------------------------------------------------
    // Save callback
    // --------------------------------------------------

    currentRideCallback =
      onRideReceived;


    // --------------------------------------------------
    // Prevent duplicate connection
    // --------------------------------------------------

    if (
      stompClient &&
      (
        stompClient.active ||
        stompClient.connected
      )
    ) {
      console.log(
        "⚡ WebSocket already active."
      );

      return;
    }


    // --------------------------------------------------
    // IMPORTANT
    //
    // Backend documentation:
    //
    // SockJS endpoint:
    // /ws
    //
    // NOT:
    // /ws/websocket
    // --------------------------------------------------

    const socketUrl = `${process.env.EXPO_PUBLIC_API_URL || "https://rider-booking-app.onrender.com"}/ws`;


    console.log(
      "=========================================="
    );

    console.log(
      "🚀 CONNECTING RIDER SOCKET"
    );

    console.log(
      "SOCKJS URL:",
      socketUrl
    );

    console.log(
      "RIDER ID:",
      riderId
    );

    console.log(
      "=========================================="
    );


    // --------------------------------------------------
    // STOMP CLIENT
    // --------------------------------------------------

    stompClient =
      new Client({

        // SockJS transport
        webSocketFactory: () => {

          console.log(
            "🔌 Creating SockJS connection..."
          );

          return new SockJS(
            socketUrl
          );
        },


        // JWT goes into STOMP CONNECT frame
        connectHeaders: {

          Authorization:
            `Bearer ${token}`,

        },


        reconnectDelay: 5000,


        heartbeatIncoming: 10000,


        heartbeatOutgoing: 10000,


        debug: (message) => {

          if (__DEV__) {

            console.log(
              "STOMP:",
              message
            );

          }

        },


        // =================================================
        // STOMP CONNECTED
        // =================================================

        onConnect: (frame) => {

          console.log(
            "=========================================="
          );

          console.log(
            "✅ STOMP CONNECTED SUCCESSFULLY"
          );

          console.log(
            "RIDER ID:",
            riderId
          );

          console.log(
            "=========================================="
          );


          // -----------------------------------------------
          // Rider topic
          // -----------------------------------------------

          const destination =
            `/topic/rider/${riderId}`;


          console.log(
            "📡 SUBSCRIBING TO:",
            destination
          );


          stompClient.subscribe(
            destination,
            async (message) => {

              console.log(
                "=========================================="
              );

              console.log(
                "📨 WEBSOCKET MESSAGE RECEIVED"
              );

              console.log(
                "DESTINATION:",
                message?.headers?.destination
              );

              console.log(
                "BODY:",
                message?.body
              );

              console.log(
                "=========================================="
              );


              try {

                if (!message?.body) {

                  console.log(
                    "⚠️ WebSocket message has no body."
                  );

                  return;
                }


                const rideData =
                  JSON.parse(
                    message.body
                  );

                await saveRideEvent(rideData);

                const eventType = String(
                  rideData?.type ||
                  rideData?.eventType ||
                  rideData?.event ||
                  ""
                ).toUpperCase();

                console.log(
                  "=========================================="
                );

                console.log(
                  "📨 RIDE SOCKET EVENT:",
                  eventType || "UNKNOWN"
                );

                console.log(
                  JSON.stringify(
                    rideData,
                    null,
                    2
                  )
                );

                console.log(
                  "=========================================="
                );

                // The same rider topic can also receive
                // cancellation events. Only RIDE_REQUEST
                // should open the accept/decline modal.
                const rideId = rideData?.rideId ?? rideData?.id ?? rideData?.deliveryId;

                // Keep the modal callback for RIDE_REQUEST only. A local
                // notification is useful while the app is in foreground; for
                // background/killed delivery the backend must send an Expo push.
                if (eventType === "RIDE_REQUEST") {
                  await showRideNotification(
                    "New ride request",
                    `Ride #${rideId ?? "—"} is waiting for your response.`,
                    { type: eventType, rideId }
                  );
                } else if (
                  eventType === "RIDE_CANCELLED" ||
                  eventType === "RIDE_CANCELLED_BY_USER"
                ) {
                  await showRideNotification(
                    "Ride request cancelled",
                    `Ride #${rideId ?? "—"} is no longer available.`,
                    { type: eventType, rideId }
                  );
                  return;
                } else {
                  // Status events must not open an offer/accept modal.
                  return;
                }

                if (
                  typeof currentRideCallback ===
                  "function"
                ) {

                  console.log(
                    "🚀 SENDING RIDE TO HOME SCREEN"
                  );


                  currentRideCallback(
                    rideData
                  );

                } else {

                  console.log(
                    "⚠️ Ride callback is not available."
                  );

                }

              } catch (error) {

                console.error(
                  "❌ Failed to parse ride message:",
                  error
                );

              }

            }
          );


          console.log(
            "✅ RIDER TOPIC SUBSCRIPTION CREATED"
          );

        },


        // =================================================
        // STOMP ERROR
        // =================================================

        onStompError: (frame) => {

          console.error(
            "=========================================="
          );

          console.error(
            "❌ STOMP SERVER ERROR"
          );

          console.error(
            "MESSAGE:",
            frame?.headers?.message
          );

          console.error(
            "BODY:",
            frame?.body
          );

          console.error(
            "=========================================="
          );

        },


        // =================================================
        // WEBSOCKET ERROR
        // =================================================

        onWebSocketError: (error) => {

          console.error(
            "=========================================="
          );

          console.error(
            "❌ SOCKJS / WEBSOCKET ERROR"
          );

          console.error(
            error
          );

          console.error(
            "=========================================="
          );

        },


        // =================================================
        // SOCKET CLOSED
        // =================================================

        onWebSocketClose: (event) => {

          console.log(
            "=========================================="
          );

          console.log(
            "🔴 WEBSOCKET CLOSED"
          );

          console.log(
            "CODE:",
            event?.code
          );

          console.log(
            "REASON:",
            event?.reason
          );

          console.log(
            "=========================================="
          );

        },


        // =================================================
        // DISCONNECT
        // =================================================

        onDisconnect: () => {

          console.log(
            "🔌 STOMP DISCONNECTED"
          );

        },

      });


    // --------------------------------------------------
    // Activate
    // --------------------------------------------------

    console.log(
      "🚀 ACTIVATING STOMP CLIENT..."
    );


    stompClient.activate();


  } catch (error) {

    console.error(
      "❌ WEBSOCKET INITIALIZATION ERROR:",
      error?.message || error
    );

  }
};


// ======================================================
// DISCONNECT
// ======================================================

export const disconnectRideSocket = async () => {

  try {

    currentRideCallback = null;


    if (stompClient) {

      console.log(
        "🛑 DISCONNECTING RIDER WEBSOCKET..."
      );


      await stompClient.deactivate();


      stompClient = null;


      console.log(
        "✅ RIDER WEBSOCKET DISCONNECTED"
      );

    }

  } catch (error) {

    console.error(
      "❌ WEBSOCKET DISCONNECT ERROR:",
      error
    );

    stompClient = null;

  }
};