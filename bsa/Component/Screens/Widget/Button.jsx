import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const LongPressButton = ({onClick,children,...props}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
         {...props}
        style={[styles.button, pressed && styles.buttonPressed]}
        onPress={onClick}
       
      >
        <Text style={styles.buttonText}>
          {children}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 70,
    borderRadius: 28, // rounded corners
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation:20, 
    position:"absolute",
    right:-50,
  },
  buttonPressed: {
    backgroundColor: '#50e3c2',
    borderRadius: 50, // more rounded on long press
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LongPressButton;
