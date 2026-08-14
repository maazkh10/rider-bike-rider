import { Redirect, useLocalSearchParams } from "expo-router";
export default function RideOtp() { const { id } = useLocalSearchParams(); return <Redirect href={{ pathname: "/deliveries/pickup-otp", params: { id: String(id || "") } }} />; }
