import AsyncStorage from "@react-native-async-storage/async-storage";

export const handleLogout = async (navigation) => {
    await AsyncStorage.removeItem('userName'); // Remove username from storage
    navigation('LOGIN'); // Navigate to login screen
};