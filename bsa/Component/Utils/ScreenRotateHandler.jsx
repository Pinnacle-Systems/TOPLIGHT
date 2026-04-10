import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

const ScreenRotationWrapper = ({ children }) => {
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = ({ window }) => {
      setScreenDimensions(window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { 
      width: screenDimensions.width, 
      height: screenDimensions.height 
    }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"#FFF"
  },
});

export default ScreenRotationWrapper;