import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MasterSearchBar({ 
    searchQuery, 
    onSearchChange, 
    placeholder = 'Search by name or category...',
    filterPtype = 'all',
    onPtypeChange,
    hasPtype = false,
    activeFilter = 'all',
    onActiveFilterChange,
}) {
    return (
        <View style={styles.container}>
            {/* Search Input Box */}
            <View style={styles.searchBox}>
                <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery ? (
                    <TouchableOpacity 
                        onPress={() => onSearchChange('')} 
                        style={styles.clearBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Ptype Filter Chips (If master has ptype like Permission / Advance / Leave) */}
            {hasPtype && onPtypeChange ? (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChipsRow}
                >
                    {[
                        { label: 'All Types', value: 'all' },
                        { label: 'Permission', value: 'permission' },
                        { label: 'Advance', value: 'advance' },
                        { label: 'Leave', value: 'leave' },
                    ].map((chip) => {
                        const isSelected = filterPtype === chip.value;
                        return (
                            <TouchableOpacity
                                key={chip.value}
                                style={[
                                    styles.chip,
                                    isSelected && styles.chipSelected,
                                ]}
                                onPress={() => onPtypeChange(chip.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.chipText,
                                    isSelected && styles.chipTextSelected,
                                ]}>
                                    {chip.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            ) : null}

            {/* Active / Inactive Status Filter Chips */}
            {onActiveFilterChange ? (
                <View style={styles.statusChipsRow}>
                    {[
                        { label: 'All', value: 'all' },
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                    ].map((chip) => {
                        const isSelected = activeFilter === chip.value;
                        return (
                            <TouchableOpacity
                                key={chip.value}
                                style={[
                                    styles.statusChip,
                                    isSelected && styles.statusChipSelected,
                                ]}
                                onPress={() => onActiveFilterChange(chip.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.statusChipText,
                                    isSelected && styles.statusChipTextSelected,
                                ]}>
                                    {chip.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        paddingVertical: 0,
    },
    clearBtn: {
        padding: 4,
    },
    filterChipsRow: {
        flexDirection: 'row',
        paddingTop: 8,
        gap: 6,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#007AFF',
    },
    chipText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    statusChipsRow: {
        flexDirection: 'row',
        paddingTop: 6,
        gap: 6,
    },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statusChipSelected: {
        backgroundColor: '#1E293B',
        borderColor: '#1E293B',
    },
    statusChipText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
    },
    statusChipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
