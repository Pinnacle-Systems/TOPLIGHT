import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const FilterAnimation = () => {
  const [isFiltered, setIsFiltered] = useState(false);

  // Shared value to animate the blur effect
  const blur = useSharedValue(0);

  // Function to toggle blur filter
  const toggleFilter = () => {
    // Animate blur effect
    blur.value = withTiming(isFiltered ? 0 : 10, { duration: 500, easing: Easing.ease });
    setIsFiltered(!isFiltered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animated Image Filter</Text>
      <AnimatedImage
        source={{ uri: 'https://cdn.dribbble.com/userupload/22273130/file/original-b60664b066bca5c94894cf105d1190f8.gif' }}
        style={[styles.image, { filter: `blur(${blur.value}px)` }]}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 10,
    borderRadius: 15,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default FilterAnimation;
