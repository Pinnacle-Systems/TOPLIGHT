import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';

const OpenGoogleMaps = ({ latitude, longitude,children }) => {
  const openMaps = () => {
    const url = Platform.select({
      ios: `comgooglemaps://?center=${latitude},${longitude}&q=${latitude},${longitude}&zoom=14`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        // Fallback to web version if app isn't installed
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        return Linking.openURL(browserUrl);
      }
    }).catch(err => {
      console.error('Error opening maps:', err);
    });
  };

  return (
    <TouchableOpacity onPress={openMaps} style={styles.button}>
      <Text style={styles.buttonText}>{children || "Open in Google Maps"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default OpenGoogleMaps;