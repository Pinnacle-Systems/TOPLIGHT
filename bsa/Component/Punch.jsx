import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMisDashboardOrdersInHandQuery } from '../redux/service/misDashboardService';
import { setTableData } from '../redux/Slices/insuranceDataSlice';
import { setCountUnder20DueDays } from '../redux/Slices/dueDaysSlice';
import CustomText from './Text/CustomText';
import { AllowedTabs_Filter } from './Utils/AllowedPagesFiltering';
import { Common_Context } from '../Context/Common_Context';
import { screenWidth } from './Utils/Screens';
import tailwind from 'twrnc';


const { width, height } = Dimensions.get('window');

const HomeCards = ({ openModel, closeModel, navigation }) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const {page,admin}=useContext(Common_Context)
    const [selectedAction, setSelectedAction] = useState('');
    // const { data: insurancedata } = useGetMisDashboardOrdersInHandQuery({ params: {} });
    const countUnder20DueDays = useSelector(state => state.dueDays.countUnder20DueDays);

    const dispatch = useDispatch();
    function openPage(selectedAction) {
        navigation.navigate(`${selectedAction}`)
    }
    

    // useEffect(() => {
    //     if (insurancedata?.data) {
    //         const formattedData = insurancedata.data.map(item => ({
    //             sno: item.sno,
    //             discoFinAsset: item.discoFinAsset,
    //             policyNo: item.policyNo,
    //             vehNo: item.vehNo,
    //             vehName: item.vehName,
    //             totalPremium: item.totalPremium,
    //             validFrom: item.validFrom,
    //             validTo: item.validTo,
    //             insuredby: item.insuredby,
    //             dueDays: item.dueDays,
    //             ...item
    //         }));
    //         dispatch(setTableData(formattedData));
    //         const count = formattedData.filter(item => item.dueDays < 30).length;
    //         dispatch(setCountUnder20DueDays(count));
    //     }
    // }, [insurancedata]);


    {/*  { label: 'Absence Register', action: 'ABSENCEREGISTER', image: require('./img/attendance.png') },
         { label: 'Available Leave', action: 'punch', image: require('./img/convenience.png') },
         { label: 'Leave register', action: 'punch', image: require('./img/schedule.png') },
         { label: 'On Duty', action: 'punch', image: require('./img/duty.png') },
         { label: 'Duty Register', action: 'punch', image: require('./img/attendance (1).png') },
         { label: 'Advance register', action: 'punch', image: require('./img/payment.png') },
         { label: 'Pay Slip', action: 'punch', image: require('./img/salary-voucher.png') },
         { label: 'Transaction', action: 'transaction', image:{uri: "https://cdn-icons-png.flaticon.com/512/2761/2761118.png"} },
         { label: 'Location', action: 'pentry', image: require('./img/schedule.png') },*/}
    const cardLabels = [
        { label: 'Onduty', action: 'onduty', icon: 'clock-outline', bg: '#3b82f6' },
        { label: 'Insurance Report', action: 'INSURANCEREPORT', icon: 'shield-check-outline', bg: '#10b981' },
        { label: 'Attendance Report', action: 'ATTENDANCEREPORT', icon: 'file-chart-outline', bg: '#f59e0b' },
        { label: 'Leave Entry', action: 'lentry', icon: 'calendar-minus', bg: '#ef4444' },
        { label: 'Permission Entry', action: 'pentry', icon: 'account-clock-outline', bg: '#8b5cf6' },
        { label: 'Advance Entry', action: 'aentry', icon: 'cash-plus', bg: '#ec4899' },
        { label: 'Attendance', action: 'Att', icon: 'fingerprint', bg: '#10b981' },
        { label: 'Available Leave', action: 'l_available', icon: 'calendar-check', bg: '#14b8a6' },
        { label: 'Map View', action: 'map', icon: 'map-marker-radius', bg: '#6366f1' },
        { label: 'Masters', action: 'masters', icon: 'database-settings', bg: '#64748b' },
        { label: 'Higher Officer', action: 'admin_higher', icon: 'shield-account', bg: '#1e3a8a' },
    ];

    const handleClick = (label, action) => {
        setSelectedCard(label);
        setSelectedAction(action);
        openPage(action)
    };

   

 const filterCards=admin==1 ? cardLabels :  AllowedTabs_Filter({tabs:cardLabels,allowedTabs:page,tabsPath_key:"action",allowedTabspath_key:"link",condtion:"isdefault",condtion_op:{op:"==",val:1}}) 

    return (
        <View style={styles.modal}>
            {openModel && (
                <View style={styles.modalContent}>
                    <View style={styles.container}>
                        {filterCards?.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.card} 
                                onPress={() => { handleClick(item.label, item.action) }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: item.bg + '15' }]}>
                                    <MaterialCommunityIcons 
                                        name={item.icon} 
                                        size={28} 
                                        color={item.bg} 
                                    />
                                </View>
                                <View style={styles.cardTextContainer}>
                                    <CustomText style={styles.cardText}>{item.label}</CustomText>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    modal: {
        width: width,
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 1000,
    },
    modalContent: {
        width: '100%',
    },
    container: {
        flexDirection: 'column',
        gap: 12,
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTextContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'Nunito-SemiBold',
    },
});

export default HomeCards;
