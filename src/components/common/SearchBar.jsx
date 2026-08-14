import { StyleSheet, TextInput, View } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Colors } from "../../theme";

export default function SearchBar({ placeholder  , value , onChange}) {
  return (
    <View style={styles.container}>
      <Feather name="search" size={22} color="#999" />

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    height: 60,

    borderRadius: 22,

    borderWidth: 1,

    borderColor: Colors.border,
  },

  input: {
    flex: 1,

    marginLeft: 12,

    fontSize: 17,
  },
});
