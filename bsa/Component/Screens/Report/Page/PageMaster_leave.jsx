import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import CustomText from '../../../Text/CustomText';
import MaterialCommunityIcons  from 'react-native-vector-icons/MaterialCommunityIcons';
import { AllowedTabs_Filter } from '../../../Utils/AllowedPagesFiltering';
import { Common_Context } from '../../../../Context/Common_Context';


const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

const PageMaster_leave = ({ navigation }) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const {page,admin}= useContext(Common_Context)
    const countUnder20DueDays = useSelector(state => state.dueDays.countUnder20DueDays);
    
    const cardLabels = [
        {
            label: 'Leave Report',
            action: 'leave_report',
            icon: 'calendar-text-outline',
            notify:0,
            color: '#4CAF50'
        },
        {
            label: 'Permission Report',
            action: 'per_report',
            icon: 'clock-check-outline',
            notify: 0,
            color: '#2196F3'
        },
        {
            label: 'Advance Report',
            action: 'advance_report',
            icon: 'hand-coin',
            notify: 0,
            color: '#FF9800'
        },
         {
            label: 'Onduty Report',
            action: 'onduty_report',
            icon: 'clipboard-list-outline',
            notify: 0,
            color: '#9C27B0'
        },
        {
            label: 'Approval Logs',
            action: 'approval_logs',
            icon: 'clipboard-list-outline',
            notify: 0,
            color: '#9C27B0'
        },
        ,
        {
            label: 'Fuel Logs',
            action: 'fuel',
            icon: 'fuel',
            notify: 0,
            color: '#299e4c'
        },
        
    ];

    const handleClick = (label, action) => {
        setSelectedCard(label);
        navigation.navigate(action);
    };


    const filterCards=admin==1 ? cardLabels :  AllowedTabs_Filter({tabs:cardLabels,allowedTabs:page,tabsPath_key:"action",allowedTabspath_key:"link",condtion:"isdefault"}) 

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reports Dashboard</Text>
            <View style={styles.grid}>
                {filterCards.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.cardTouchable}
                        onPress={() => handleClick(item.label, item.action)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.card, { borderLeftColor: item.color }]}>
                            <MaterialCommunityIcons 
                                name={item.icon} 
                                size={36} 
                                color={item.color}
                                style={styles.cardIcon}
                            />
                            <CustomText style={styles.cardText}>{item.label}</CustomText>
                            {item.notify > 0 && (
                                <View style={[styles.badge, { backgroundColor: item.color }]}>
                                    <Text style={styles.badgeText}>{item.notify}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginVertical: 16,
        marginBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 1,
    },
    cardTouchable: {
        width: CARD_WIDTH,
        marginBottom: 20,
    },
    card: {
        padding: 20,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderLeftWidth: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardIcon: {
        marginBottom: 12,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#444',
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default PageMaster_leave;