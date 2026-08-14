import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../theme/colors";

export default function PaymentCard({ delivery }) {
  return (
    <View style={styles.card}>

      {/* Bike */}

      <View style={styles.header}>

        <View style={styles.iconBox}>
          <Ionicons
            name="bicycle"
            size={28}
            color="#111"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.bike}>
            {delivery.bike}
          </Text>

          <Text style={styles.distance}>
            {delivery.distance} • {delivery.eta}
          </Text>
        </View>

      </View>

      <View style={styles.divider} />

      {/* Pickup */}

      <View style={styles.locationRow}>

        <View style={styles.locationIcon}>
          <Ionicons
            name="radio-button-on"
            size={18}
            color="#22C55E"
          />
        </View>

        <View style={styles.locationInfo}>
          <Text style={styles.label}>
            Pickup Location
          </Text>

          <Text style={styles.value}>
            {delivery.pickup}
          </Text>
        </View>

      </View>

      {/* Route Line */}

      <View style={styles.routeContainer}>
        <View style={styles.routeLine} />
      </View>

      {/* Destination */}

      <View style={styles.locationRow}>

        <View style={styles.locationIcon}>
          <Ionicons
            name="location"
            size={18}
            color="#EF4444"
          />
        </View>

        <View style={styles.locationInfo}>
          <Text style={styles.label}>
            Destination
          </Text>

          <Text style={styles.value}>
            {delivery.destination}
          </Text>
        </View>

      </View>

      <View style={styles.divider} />

      {/* Bottom Stats */}

      <View style={styles.bottom}>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {delivery.distance}
          </Text>

          <Text style={styles.statLabel}>
            Distance
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {delivery.eta}
          </Text>

          <Text style={styles.statLabel}>
            ETA
          </Text>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  card:{
    backgroundColor:"#fff",

    borderRadius:26,

    padding:22,

    shadowColor:"#000",
    shadowOpacity:0.08,
    shadowRadius:10,

    elevation:5,
  },

  header:{
    flexDirection:"row",
    alignItems:"center",
  },

  iconBox:{
    width:60,
    height:60,

    borderRadius:18,

    backgroundColor:Colors.primary,

    justifyContent:"center",
    alignItems:"center",

    marginRight:15,
  },

  bike:{
    fontSize:22,

    fontWeight:"800",

    color:"#111",
  },

  distance:{
    marginTop:5,

    color:"#777",

    fontSize:14,
  },

  divider:{
    height:1,

    backgroundColor:"#ECECEC",

    marginVertical:20,
  },

  locationRow:{
    flexDirection:"row",
    alignItems:"flex-start",
  },

  locationIcon:{
    width:28,
    alignItems:"center",
    marginTop:2,
  },

  locationInfo:{
    flex:1,
    marginLeft:12,
  },

  label:{
    color:"#888",
    fontSize:13,
  },

  value:{
    marginTop:5,
    color:"#111",
    fontSize:16,
    fontWeight:"700",
    lineHeight:24,
  },

  routeContainer:{
    marginLeft:13,
    marginVertical:6,
  },

  routeLine:{
    width:2,
    height:30,
    backgroundColor:"#DADADA",
  },

  bottom:{
    flexDirection:"row",
    justifyContent:"space-between",
  },

  statBox:{
    width:"48%",
    backgroundColor:"#F7F8FA",
    borderRadius:18,
    padding:18,
    alignItems:"center",
  },

  statValue:{
    fontSize:20,
    fontWeight:"800",
    color:Colors.primary,
  },

  statLabel:{
    marginTop:6,
    color:"#777",
    fontSize:13,
    fontWeight:"600",
  },

});