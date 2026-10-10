import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { ProgressBar, useTheme } from 'react-native-paper';
import anim from "./assets/Sync.json"
import loader from "./assets/Loader.json"
const ProgressPopup = ({ progress = 0.4, message = "Collecting Your Data..." ,style,sync,textcolor,box=true}) => {
  const theme = useTheme();

  
   

  return (
    <View style={styles.overlay}>
      <View style={[box && styles.container,box && { backgroundColor: theme.colors.surface },style]}>
        
        <LottieView
          source={sync ? anim : loader}
          autoPlay
          loop
          style={styles.lottie}
        />

        <Text style={[styles.message, { color:textcolor ||  theme.colors.scrim }]}>{message}</Text>

       

        
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height:"100%",
    backgroundColor:"#0000"
  },
  container: {
    width: width * 0.85,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignSelf:"center",
  },
  lottie: {
    width: 150,
    height: 140,
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  percentText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProgressPopup;
