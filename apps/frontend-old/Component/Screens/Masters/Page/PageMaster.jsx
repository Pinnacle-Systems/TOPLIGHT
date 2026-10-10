import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMisDashboardOrdersInHandQuery } from '../redux/service/misDashboardService';
import { setTableData } from '../redux/Slices/insuranceDataSlice';
import { setCountUnder20DueDays } from '../redux/Slices/dueDaysSlice';
import CustomText from '../../../Text/CustomText';


const { width, height } = Dimensions.get('window');

const PageMaster = ({  closeModel, navigation }) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedAction, setSelectedAction] = useState('');
    const countUnder20DueDays = useSelector(state => state.dueDays.countUnder20DueDays);
    const dispatch = useDispatch();

    const cardLabels = [
        {
            label: 'Permissions & Reasons',
            action:'m_permission',
            image: require('../../../img/permissions_master.png'),
            notify: 0,
        },
           {
            label: 'Page Master',
            action:'page_master',
            image: require('../../../img/page_master.png'),
            notify: 0,
        },
        ,
           {
            label: 'Onduty Master',
            action:'onduty_master',
            image: require('../../../img/page_master.png'),
            notify: 0,
        },
        // {
        //     label: 'My Home Master',
        //     action:'home_locate_master',
        //     image: require('../../../img/home_locate.png'),
        //     notify: 0,
        // }
       
    ];

    const handleClick = (label, action) => {
        setSelectedCard(label);
        setSelectedAction(action);
        navigation.navigate(action);
    };



    return (
       <>
       <Text style={{fontSize:20,fontWeight:20,padding:10}}>Masters Creations</Text>

                <View style={styles.grid}>
                    
                    {cardLabels.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => handleClick(item.label, item.action)}
                        >
                            <View style={styles.imageWrapper}>
                                <Image style={styles.icon} source={item.image} />
                                {item.notify > 0 && (
                                    <Text style={styles.badge}>{item.notify}</Text>
                                )}
                            </View>
                            <CustomText style={styles.cardText}>{item.label}</CustomText>
                        </TouchableOpacity>
                    ))}
                </View>
                </>
        
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        width: width * 0.9,
        elevation: 10,
    },
    closeArea: {
        alignSelf: 'flex-end',
        padding: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: "space-between",
        gap: 5,
        alignItems:"center",
        flex:1,
        backgroundColor:"#FFFF",
        padding:10
    },
    card: {
        width: width * 0.29,
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginVertical: 20,
    },
    cardText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    icon: {
        width: 40,
        height: 40,
    },
    imageWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'red',
        color: 'white',
        borderRadius: 12,
        paddingHorizontal: 6,
        fontSize: 12,
        fontWeight: 'bold',
        overflow: 'hidden',
        minWidth: 24,
        textAlign: 'center',
    },
});

export default PageMaster;
