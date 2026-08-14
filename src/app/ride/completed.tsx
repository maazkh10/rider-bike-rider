import { Redirect, useLocalSearchParams } from "expo-router";
export default function CompletedAlias() { const { id } = useLocalSearchParams(); return <Redirect href={{ pathname: "/deliveries/completed", params: { id: String(id || "") } }} />; }
