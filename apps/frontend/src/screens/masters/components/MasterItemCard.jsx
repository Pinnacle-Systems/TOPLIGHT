import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

export default function MasterItemCard({
    item,
    onEdit,
    onDelete,
    accentColor,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const accent = accentColor || theme.colors.brand;
    const isActive = item?.active === 'Yes' || item?.active === 'y' || item?.active === true || item?.active === 'Y';
    const initial = (item?.name?.trim()?.charAt(0) || 'M').toUpperCase();

    // Determine Ptype badge color
    const getPtypeStyle = (ptype) => {
        switch (ptype?.toLowerCase()) {
            case 'permission':
                return { bg: theme.colors.accentSoft, color: theme.colors.accent, label: 'Permission' };
            case 'advance':
                return { bg: theme.colors.brandSoft, color: theme.colors.brand, label: 'Advance' };
            case 'leave':
                return { bg: theme.colors.warningSoft, color: theme.colors.warning, label: 'Leave' };
            default:
                return null;
        }
    };

    const ptypeStyle = item?.ptype ? getPtypeStyle(item.ptype) : null;

    return (
        <View style={styles.card}>
            <View style={styles.contentRow}>
                {/* Avatar Icon / Letter */}
                <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceSelected }]}>
                    <Text style={[styles.avatarText, { color: accent }]}>{initial}</Text>
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
                            { backgroundColor: isActive ? theme.colors.successSoft : theme.colors.surfaceSunken }
                        ]}>
                            <View style={[
                                styles.statusDot, 
                                { backgroundColor: isActive ? theme.colors.success : theme.colors.textDisabled }
                            ]} />
                            <Text style={[
                                styles.statusText, 
                                { color: isActive ? theme.colors.success : theme.colors.textMuted }
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
                        <MaterialCommunityIcons name="pencil-outline" size={17} color={theme.colors.brand} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionBtnDelete}
                        onPress={() => onDelete(item)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={17} color={theme.colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md + 2,
        marginHorizontal: theme.layout.screenGutter,
        marginBottom: theme.spacing.md - 2,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        elevation: 1,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: theme.isDark ? 0.3 : 0.04,
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
        marginRight: theme.spacing.md,
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
        color: theme.colors.text,
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
        backgroundColor: theme.colors.surfaceSunken,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    idText: {
        fontSize: 10,
        color: theme.colors.textDisabled,
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
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnDelete: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: theme.colors.dangerSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
