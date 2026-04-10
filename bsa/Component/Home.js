import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomCard from './CustomCard';
import { useCustomFonts } from './CustomHooks/useFonts';
import  LinearGradient  from 'react-native-linear-gradient';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function Home({ navigation }) {
    const [username, setUsername] = useState(null);
    const ConstomFont = useCustomFonts();

    const [vehicleOpen, setVehicleOpen] = useState(true);
    const [payrollOpen, setPayrollOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = await AsyncStorage.getItem('userName');
            let userName = JSON.parse(storedUser);
            setUsername(userName?.userName);
        };
        fetchUser();
    }, []);

    const toggleModal = (cardType) => {
        if (cardType === 'vehicle') setVehicleOpen(!vehicleOpen);
        if (cardType === 'payroll') setPayrollOpen(!payrollOpen);
        if (cardType === 'report') setReportOpen(!reportOpen);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            
            {/* Header with Gradient */}
          

            {/* Card List */}
            <ScrollView contentContainerStyle={styles.cardList} showsVerticalScrollIndicator={false}>
                <CustomCard
                    title="Vehicle"
                    onPress={() => toggleModal('vehicle')}
                    openModel={vehicleOpen}
                    closeModel={() => setVehicleOpen(false)}
                    navigation={navigation}
                />
                
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    headerContent: {
        alignItems: 'flex-start',
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'Nunito-Regular',
    },
    username: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Nunito-Bold',
        marginTop: 4,
    },
    cardList: {
        paddingBottom: 5,
        gap: 16, // requires React Native >= 0.71
    },
});
