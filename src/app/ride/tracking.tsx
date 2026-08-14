import { Redirect, useLocalSearchParams } from "expo-router";
export default function Tracking() { const { id } = useLocalSearchParams(); return <Redirect href={{ pathname: "/deliveries/delivery-map", params: { id: String(id || "") } }} />; }
