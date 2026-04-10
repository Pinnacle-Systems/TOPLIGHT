import React, { useState } from 'react';
import { View, Button, Platform, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimeInput = () => {
    const [time, setTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (event, selectedTime) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes()
        .toString()
        .padStart(2, '0')}`;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Selected Time: {formattedTime}</Text>
            <Button title="Pick a Time" onPress={() => setShowPicker(true)} />
            {showPicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true} // Change to false for 12-hour format
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    label: {
        fontSize: 18,
        marginBottom: 6,
    },
});

export default TimeInput;
