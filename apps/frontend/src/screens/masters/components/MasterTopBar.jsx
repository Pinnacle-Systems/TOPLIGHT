import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MasterTopBar({ 
    title = 'Masters Hub', 
    subtitle = 'Configuration & Masters',
    onBack,
    onAdd,
    accentColor = '#2563EB',
    addLabel = 'New Entry',
}) {
    return (
        <View style={styles.container}>
            <View style={styles.leftRow}>
                {onBack ? (
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={onBack}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={22} color="#1E293B" />
                    </TouchableOpacity>
                ) : null}
                <View style={styles.textWrap}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
                </View>
            </View>

            {onAdd ? (
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: accentColor }]}
                    onPress={onAdd}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>{addLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 9,
        gap: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
});
