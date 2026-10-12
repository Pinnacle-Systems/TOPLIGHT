import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function getTodayDisplay() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
        day: days[now.getDay()],
        date: now.getDate(),
        month: months[now.getMonth()],
        year: now.getFullYear(),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
}

export default function DateBanner() {
    const d = getTodayDisplay();

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <Text style={styles.bigNum}>{d.date}</Text>
                <View style={styles.dateCol}>
                    <Text style={styles.monthYear}>{d.month} {d.year}</Text>
                    <Text style={styles.dayName}>{d.day}</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.right}>
                <Text style={styles.time}>{d.time}</Text>
                <View style={styles.lockRow}>
                    <MaterialCommunityIcons name="lock-outline" size={12} color="#64748B" />
                    <Text style={styles.lockText}>Auto-locked to today</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    bigNum: {
        fontSize: 34,
        fontWeight: '800',
        color: '#007AFF',
        lineHeight: 38,
    },
    dateCol: {
        justifyContent: 'center',
    },
    monthYear: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    dayName: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        marginTop: 1,
    },
    divider: {
        width: 1,
        height: 36,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 12,
    },
    right: {
        alignItems: 'flex-end',
    },
    time: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    lockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        gap: 3,
    },
    lockText: {
        fontSize: 11,
        color: '#64748B',
    },
});
