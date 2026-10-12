import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MasterStatsRow({ 
    total = 0, 
    active = 0, 
    inactive = 0,
    accentColor = '#2563EB',
}) {
    return (
        <View style={styles.container}>
            {/* Total Card */}
            <View style={styles.statCard}>
                <View style={styles.topRow}>
                    <Text style={styles.statLabel}>TOTAL</Text>
                    <View style={[styles.iconCircle, { backgroundColor: accentColor + '15' }]}>
                        <MaterialCommunityIcons name="format-list-bulleted" size={14} color={accentColor} />
                    </View>
                </View>
                <Text style={styles.statValue}>{total}</Text>
            </View>

            {/* Active Card */}
            <View style={styles.statCard}>
                <View style={styles.topRow}>
                    <Text style={styles.statLabel}>ACTIVE</Text>
                    <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                        <MaterialCommunityIcons name="check-circle-outline" size={14} color="#16A34A" />
                    </View>
                </View>
                <Text style={[styles.statValue, { color: '#16A34A' }]}>{active}</Text>
            </View>

            {/* Inactive Card */}
            <View style={styles.statCard}>
                <View style={styles.topRow}>
                    <Text style={styles.statLabel}>INACTIVE</Text>
                    <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
                        <MaterialCommunityIcons name="close-circle-outline" size={14} color="#64748B" />
                    </View>
                </View>
                <Text style={[styles.statValue, { color: '#64748B' }]}>{inactive}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    iconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },
});
