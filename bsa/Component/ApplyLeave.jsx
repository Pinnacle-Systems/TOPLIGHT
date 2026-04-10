import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert, } from 'react-native';
import CloseButtons from './Buttons/Buttons';

const { width } = Dimensions.get('window');

export default function LeaveEntry({ closeModel }) {
    const [leaveType, setLeaveType] = useState('');
    const [reason, setReason] = useState('');
    const [balanceLeave, setBalanceLeave] = useState('');
    const [cardNo, setCardNo] = useState('');
    const [compCode, setCompCode] = useState('');

    const handleSubmit = () => {
        if (!leaveType || !reason || !balanceLeave || !cardNo || !compCode) {
            Alert.alert('Error', 'Please fill all the fields');
            return;
        }

        // Handle leave entry submission here
        console.log('Leave Entry Submitted:', {
            leaveType,
            reason,
            balanceLeave,
            cardNo,
            compCode,
        });

        Alert.alert('Success', 'Leave entry submitted successfully!');
        closeModel(); // Close the modal after submission
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Leave Entry</Text>

            <View style={styles.row}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Leave Type</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={leaveType}
                            onValueChange={(itemValue) => setLeaveType(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Leave Type" value="" />
                            <Picker.Item label="Casual Leave" value="casual" />
                            <Picker.Item label="Sick Leave" value="sick" />
                            <Picker.Item label="Earned Leave" value="earned" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Balance Leave</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter balance leave"
                        value={balanceLeave}
                        onChangeText={setBalanceLeave}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Card No</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter employee ID"
                        value={cardNo}
                        onChangeText={setCardNo}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Company Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter company code"
                        value={compCode}
                        onChangeText={setCompCode}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputContainer, styles.fullWidth]}>
                    <Text style={styles.label}>Reason</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter reason for leave"
                        value={reason}
                        onChangeText={setReason}
                        multiline
                    />
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={closeModel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            <CloseButtons closeModel={closeModel} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        flexWrap: 'wrap',
    },
    inputContainer: {
        width: '48%', // Adjust width for side-by-side layout
    },
    fullWidth: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    picker: {
        height: 40,
        width: '100%',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        height: 40,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#d9534f',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
