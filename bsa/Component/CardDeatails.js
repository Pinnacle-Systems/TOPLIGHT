import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CardDetails({ route }) {
    const { fetchedData } = route.params;
    const Allocation = useMemo(() => fetchedData?.data ? fetchedData?.data : [], [fetchedData])
    console.log(Allocation, 'fetchedData');
    if (!fetchedData || fetchedData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>No Data Found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Card Details</Text>

            <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Field</Text>
                    <Text style={styles.tableHeaderText}>Value</Text>
                </View>

                {/* Iterate through fetchedData and map rows */}
                {fetchedData.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableText}>{item.field}</Text>
                        <Text style={styles.tableText}>{item.value}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f4f4f4',
        padding: 10,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableCell: {
        flex: 1,
        fontSize: 16,
        textAlign: 'center',
    },
});
