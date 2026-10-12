import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MasterItemCard({
    item,
    onEdit,
    onDelete,
    accentColor = '#2563EB',
}) {
    const isActive = item?.active === 'Yes' || item?.active === 'y' || item?.active === true || item?.active === 'Y';
    const initial = (item?.name?.trim()?.charAt(0) || 'M').toUpperCase();

    // Determine Ptype badge color
    const getPtypeStyle = (ptype) => {
        switch (ptype?.toLowerCase()) {
            case 'permission':
                return { bg: '#F5F3FF', color: '#7C3AED', label: 'Permission' };
            case 'advance':
                return { bg: '#FDF2F8', color: '#DB2777', label: 'Advance' };
            case 'leave':
                return { bg: '#FFF7ED', color: '#EA580C', label: 'Leave' };
            default:
                return null;
        }
    };

    const ptypeStyle = item?.ptype ? getPtypeStyle(item.ptype) : null;

    return (
        <View style={styles.card}>
            <View style={styles.contentRow}>
                {/* Avatar Icon / Letter */}
                <View style={[styles.avatar, { backgroundColor: accentColor + '12' }]}>
                    <Text style={[styles.avatarText, { color: accentColor }]}>{initial}</Text>
                </View>

                {/* Details Section */}
                <View style={styles.detailsWrap}>
                    <View style={styles.titleRow}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {item?.name || 'Unnamed Item'}
                        </Text>
                    </View>

                    {/* Badges Row */}
                    <View style={styles.badgesRow}>
                        {/* Active Status Badge */}
                        <View style={[
                            styles.statusBadge, 
                            { backgroundColor: isActive ? '#DCFCE7' : '#F1F5F9' }
                        ]}>
                            <View style={[
                                styles.statusDot, 
                                { backgroundColor: isActive ? '#16A34A' : '#94A3B8' }
                            ]} />
                            <Text style={[
                                styles.statusText, 
                                { color: isActive ? '#15803D' : '#64748B' }
                            ]}>
                                {isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </View>

                        {/* Ptype Badge (if present) */}
                        {ptypeStyle ? (
                            <View style={[styles.ptypeBadge, { backgroundColor: ptypeStyle.bg }]}>
                                <Text style={[styles.ptypeText, { color: ptypeStyle.color }]}>
                                    {ptypeStyle.label}
                                </Text>
                            </View>
                        ) : null}

                        {/* ID Badge */}
                        {item?.id ? (
                            <View style={styles.idBadge}>
                                <Text style={styles.idText}>#{item.id}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Actions: Edit & Delete */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity 
                        style={styles.actionBtnEdit}
                        onPress={() => onEdit(item)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <MaterialCommunityIcons name="pencil-outline" size={17} color="#007AFF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionBtnDelete}
                        onPress={() => onDelete(item)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={17} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    detailsWrap: {
        flex: 1,
        marginRight: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
        flex: 1,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    ptypeBadge: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
    },
    ptypeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    idBadge: {
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    idText: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtnEdit: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnDelete: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
