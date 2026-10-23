import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../theme';

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
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

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
                    <MaterialCommunityIcons name="lock-outline" size={theme.fontSizes.xs} color={theme.colors.textMuted} />
                    <Text style={styles.lockText}>Auto-locked to today</Text>
                </View>
            </View>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md + theme.layout.dividerWidth * 2,
        borderWidth: theme.layout.dividerWidth,
        borderColor: theme.colors.borderSubtle,
        marginBottom: theme.spacing.md + theme.layout.dividerWidth * 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: theme.spacing.none, height: theme.spacing.xxs },
        shadowOpacity: theme.isDark ? 0.3 : 0.04,
        shadowRadius: theme.spacing.sm - theme.spacing.xxs,
        elevation: theme.elevation.sm,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: theme.spacing.md,
    },
    bigNum: {
        fontSize: theme.fontSizes.display - theme.spacing.xxs,
        fontWeight: theme.fontWeights.extraBold,
        color: theme.colors.brand,
        lineHeight: theme.lineHeights.xxxl,
    },
    dateCol: {
        justifyContent: 'center',
    },
    monthYear: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
    },
    dayName: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.medium,
        marginTop: theme.layout.dividerWidth,
    },
    divider: {
        width: theme.layout.dividerWidth,
        height: theme.controlSizes.dateBannerDividerHeight,
        backgroundColor: theme.colors.divider,
        marginHorizontal: theme.spacing.md,
    },
    right: {
        alignItems: 'flex-end',
    },
    time: {
        ...theme.typography.title,
        color: theme.colors.text,
    },
    lockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xxs + theme.layout.dividerWidth,
        gap: theme.spacing.xs + theme.layout.dividerWidth,
    },
    lockText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
});
