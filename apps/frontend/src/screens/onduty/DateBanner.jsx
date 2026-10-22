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
                    <MaterialCommunityIcons name="lock-outline" size={12} color={theme.colors.textMuted} />
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
        paddingVertical: theme.spacing.md + 2,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginBottom: theme.spacing.md + 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.3 : 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: theme.spacing.md,
    },
    bigNum: {
        fontSize: 34,
        fontWeight: '800',
        color: theme.colors.brand,
        lineHeight: 38,
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
        marginTop: 1,
    },
    divider: {
        width: 1,
        height: 36,
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
        marginTop: 3,
        gap: theme.spacing.xxs + 1,
    },
    lockText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
});
