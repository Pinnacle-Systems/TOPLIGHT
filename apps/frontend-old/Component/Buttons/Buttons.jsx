import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
const FloatingButton = ({ save,edit,editable,New,Update,type}) => {
    const [showOptions, setShowOptions] = useState(false);

    // Actions menu for the floating button
    const actions = [
        {
            text: "New",
            name: "bt_add",  // You can use an icon or a unique name for the "New" action
            onPress: New,  // This can be a handler for the "New" action
        },
       
        
    ];

    // Toggle the options list visibility
    const handleButtonPress = () => {
        setShowOptions(!showOptions);
    };

    return (
        <View style={styles.container}>
            
            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fabBtn} onPress={handleButtonPress}>
                <Entypo  style={styles.fabText} name="add-to-list" size={24} color="white" />
               
            </TouchableOpacity>

            {/* Options List */}
            {showOptions && (
                <View style={styles.socialList}>
                    {[...actions,editable ?  {
            text: "Update",
            name: "Update",
            onPress:  Update,  // Add your Edit functionality here
        }:
        {
            text: "Save",
            name: "bt_save",
            onPress: save,  // Trigger the save function passed as a prop
        }].map((action) => (
            action &&
                        <TouchableOpacity
                            key={action.name}
                            style={styles.socialItem}
                            onPress={action.onPress}  // Trigger the corresponding action
                            onPressOut={()=>setShowOptions(false)}
                        >
                            <Text>{action.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',  // Position the FAB at the bottom right
        bottom: 20,
        right: 20,
        zIndex: 1000,  // To ensure it appears above other UI elements
    },
    fabBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5d7f94',
        borderRadius: 25,
        height: 50,
        width: 50,
    },
    fabText: {
        color: 'white',
        fontSize: 24,
    },
    socialList: {
        position: 'absolute',
        bottom: 60,
        left: -100,
        borderRadius: 10,
        width: 200,
        padding: 10,
        zIndex:30,
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor:"#e8eaeb"
    },
    socialItem: {
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
});

export default FloatingButton;
