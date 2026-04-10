import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function ListView({data,id="id",renderItem}) {
  // Sample data for the list
 

  // Render function for each item
 

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item[id]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems:"flex-start",
    paddingTop: 50,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    width: '80%',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    color: '#333',
  },
});
