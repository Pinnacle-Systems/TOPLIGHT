import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import HomeCards from './Punch';


const CustomCard = ({ title, onPress, openModel, closeModel, navigation }) => (
    <View style={styles.cardSection}>
       

        {/* Conditionally render HomeCards based on openModel */}
        {openModel && (
            <View style={styles.container}>
                <View style={styles.cardContainer}>
                    <HomeCards openModel={openModel} closeModel={closeModel} navigation={navigation} />
                </View>
            </View>
        )}
    </View>
);

const styles = StyleSheet.create({
    cardSection: {
        marginBottom: 1, // Adjust bottom margin for each card
    },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 7,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        marginBottom: 10, // Add space between the card content
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 500,
        color: '#333',
        marginLeft:5
    },

    cardContainer: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardImage: {
        width: 10,
        height: 10,

    }
});
export default CustomCard;
