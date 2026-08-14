import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Colors from "../../theme/colors";

export default function BackHeader({
  title,
  subtitle,
  rightIcon,
  onRightPress,
}) {
  return (
    <View style={styles.container}>
      {/* Left */}

      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color="#111"
        />
      </TouchableOpacity>

      {/* Center */}

      <View style={styles.center}>
        <Text style={styles.title}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right */}

      {rightIcon ? (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={onRightPress}
        >
          <Ionicons
            name={rightIcon}
            size={22}
            color="#111"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.empty} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginTop:15,
    marginBottom:20,
  },

  backButton:{
    width:48,
    height:48,
    borderRadius:24,
    backgroundColor:"#fff",

    justifyContent:"center",
    alignItems:"center",

    shadowColor:"#000",
    shadowOpacity:0.06,
    shadowRadius:8,

    elevation:3,
  },

  center:{
    flex:1,
    alignItems:"center",
    paddingHorizontal:15,
  },

  title:{
    fontSize:24,
    fontWeight:"800",
    color:"#111",
  },

  subtitle:{
    marginTop:4,
    fontSize:13,
    color:"#888",
  },

  rightButton:{
    width:48,
    height:48,
    borderRadius:24,
    backgroundColor:"#fff",

    justifyContent:"center",
    alignItems:"center",

    shadowColor:"#000",
    shadowOpacity:0.06,
    shadowRadius:8,

    elevation:3,
  },

  empty:{
    width:48,
  }

});