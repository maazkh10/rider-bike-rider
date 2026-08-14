import { Redirect, useLocalSearchParams } from "expo-router";
export default function Assigned() { const { id } = useLocalSearchParams(); return <Redirect href={{ pathname: "/deliveries/pickup-map", params: { id: String(id || "") } }} />; }
