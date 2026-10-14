import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

export default function MasterStatsRow({ 
    total = 0, 
    active = 0, 
    inactive = 0,
    accentColor,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const accent = accentColor || theme.colors.brand;

    return (
        <View style={styles.container}>
            {/* Total Card */}
            <View style={styles.statCard}>
                <View style={styles.topRow}>
                    <Text style={styles.statLabel}>TOTAL</Text>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceSelected }]}>
                        <MaterialCommunityIcons name="format-list-bulleted" size={14} color={accent} />
                    </View>
                </View>
                <Text style={styles.statValue}>{total}</Text>
            </View>

            {/* Active Card */}
            <View style={styles.statCard}>
                <View style={styles.topRow}>
                    <Text style={styles.statLabel}>ACTIVE</Text>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.successSoft }]}>
                        <MaterialCommunityIcons name="check-circle-outline" size={14} color={theme.colors.success} />
                    </View>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>{active}</Text>
            </View>

            {/* Inactive Card */}
            <View style={styles.statCard}>
                <View style={styles.topRow}>
                    <Text style={styles.statLabel}>INACTIVE</Text>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceSunken }]}>
                        <MaterialCommunityIcons name="close-circle-outline" size={14} color={theme.colors.textMuted} />
                    </View>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.textMuted }]}>{inactive}</Text>
            </View>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: theme.layout.screenGutter,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xs,
        gap: theme.spacing.sm + 2,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        elevation: 1,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: theme.isDark ? 0.3 : 0.05,
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
        color: theme.colors.textMuted,
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
        color: theme.colors.text,
    },
});
