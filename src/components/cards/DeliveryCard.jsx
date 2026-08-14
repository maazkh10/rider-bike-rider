import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Colors from "../../theme/colors";
import StatusBadge from "../common/StatusBadge";

export default function DeliveryCard({
  delivery,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}
    >
      {/* Header */}

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bike}>
            {delivery.bike}
          </Text>

          <Text style={styles.chassis}>
            {delivery.chassis}
          </Text>
        </View>

        <StatusBadge status={delivery.status} />
      </View>

      {/* Divider */}

      <View style={styles.divider} />

      {/* Pickup */}

      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="cube"
            size={18}
            color="#00C853"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>
            Pickup
          </Text>

          <Text style={styles.value}>
            {delivery.pickup}
          </Text>
        </View>
      </View>

      {/* Line */}

      <View style={styles.line} />

      {/* Destination */}

      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="location"
            size={18}
            color="#ff5252"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>
            Destination
          </Text>

          <Text style={styles.value}>
            {delivery.destination}
          </Text>
        </View>
      </View>

      {/* Bottom */}

      <View style={styles.bottom}>
        <View style={styles.info}>
          <Ionicons
            name="time-outline"
            size={18}
            color="#777"
          />

          <Text style={styles.infoText}>
            {delivery.eta}
          </Text>
        </View>

        <View style={styles.info}>
          <Ionicons
            name="navigate-outline"
            size={18}
            color="#777"
          />

          <Text style={styles.infoText}>
            {delivery.distance}
          </Text>
        </View>

        <Text style={styles.amount}>
          ₹{delivery.amount}
        </Text>
      </View>

      {/* Button */}

      <TouchableOpacity
  style={styles.button}
  onPress={onPress}
>
  <Ionicons
    name="eye-outline"
    size={18}
    color="#111"
  />

  <Text style={styles.buttonText}>
    View Details
  </Text>
</TouchableOpacity>

      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  card:{
    backgroundColor:"#fff",
    borderRadius:26,
    padding:20,
    marginBottom:18,

    shadowColor:"#000",
    shadowOpacity:0.08,
    shadowRadius:10,

    elevation:5,
  },

  header:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },

  bike:{
    fontSize:20,
    fontWeight:"800",
    color:"#111"
  },

  chassis:{
    marginTop:5,
    color:"#777",
    fontSize:13
  },

  divider:{
    height:1,
    backgroundColor:"#efefef",
    marginVertical:18
  },

  row:{
    flexDirection:"row",
    alignItems:"center"
  },

  iconCircle:{
    width:42,
    height:42,
    borderRadius:21,
    backgroundColor:"#F5F5F5",

    justifyContent:"center",
    alignItems:"center",

    marginRight:15
  },

  label:{
    color:"#888",
    fontSize:13
  },

  value:{
    fontWeight:"700",
    fontSize:16,
    color:"#111",
    marginTop:2
  },

  line:{
    width:2,
    height:24,
    backgroundColor:"#ddd",
    marginLeft:20,
    marginVertical:5
  },

  bottom:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginTop:22
  },

  info:{
    flexDirection:"row",
    alignItems:"center"
  },

  infoText:{
    marginLeft:5,
    color:"#666",
    fontWeight:"600"
  },

  amount:{
    fontSize:22,
    fontWeight:"800",
    color:Colors.primary
  },

  button:{
    marginTop:20,

    backgroundColor:Colors.primary,

    height:52,

    borderRadius:16,

    justifyContent:"center",
    alignItems:"center",

    flexDirection:"row"
  },

  buttonText:{
    marginLeft:8,
    fontWeight:"800",
    fontSize:16,
    color:"#111"
  }

});