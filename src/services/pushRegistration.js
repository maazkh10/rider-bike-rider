import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import api from "./api";

const INSTALLATION_KEY = "rider.push.installation-id";
const TOKEN_KEY = "pushToken";
const APP = "rider";

const createInstallationId = () => Crypto.randomUUID().replace(/-/g, "");

export const getInstallationId = async () => {
  let id = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (!id) {
    id = createInstallationId();
    await AsyncStorage.setItem(INSTALLATION_KEY, id);
  }
  return id;
};

export const registerPushDevice = async (expoPushToken) => {
  if (!expoPushToken) return false;

  const installationId = await getInstallationId();
  await api.put("/api/notifications/devices", {
    app: APP,
    installationId,
    token: expoPushToken,
    platform: Platform.OS === "ios" ? "ios" : "android",
  });

  await AsyncStorage.setItem(TOKEN_KEY, expoPushToken);
  return true;
};

export const unregisterPushDevice = async () => {
  const installationId = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (!installationId) return false;

  await api.delete(
    `/api/notifications/devices/${APP}/${encodeURIComponent(installationId)}`
  );

  return true;
};
