import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RoleOnPage() {
    const navigation = useNavigation();
    
    const handleContinue = () => {
        // Navigate to Home/Dashboard
        navigation.navigate('Home');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Role Selection Page</Text>
            <Button title="Continue to Home" onPress={handleContinue} />
        </View>
    );
}
