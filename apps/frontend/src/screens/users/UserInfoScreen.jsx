import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useGetMoreDetailsQuery } from '../../store/api/dashboardApi';
import { useAppTheme } from '../../theme';

const USER_DETAILS = [
    { key: 'GENDER', label: 'Gender', icon: 'account-outline' },
    { key: 'LANGUAGE', label: 'Language', icon: 'translate' },
    { key: 'CONTACTNO', label: 'Mobile', icon: 'cellphone' },
    { key: 'HOSTEL', label: 'Hostel', icon: 'bed-outline', prefix: 'Hostel - ' },
    { key: 'ESI', label: 'ESI', icon: 'card-account-details-outline', prefix: 'ESI - ' },
    { key: 'PF', label: 'PF', icon: 'card-account-details-outline', prefix: 'PF - ' },
    { key: 'DOJ', label: 'Date of joining', icon: 'calendar-month-outline' },
    { key: 'SALBY', label: 'Salary by', icon: 'bank-outline', prefix: 'Salary by - ' },
];

export default function UserInfoScreen() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const user = useSelector(state => state.UserDetails);
    const employeeId = String(user?.UserId || user?.IDCARD || user?.Idcard || '').trim();
    const { data, isLoading, isError, refetch } = useGetMoreDetailsQuery(
        { params: { Idcard: employeeId } },
        { skip: !employeeId },
    );
    const details = Array.isArray(data?.data) ? data.data[0] : null;

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
                <Text style={styles.statusText}>Loading user information...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centered}>
                <MaterialCommunityIcons name="alert-circle-outline" size={36} color={theme.colors.danger} />
                <Text style={styles.statusTitle}>Could not load user information</Text>
                <Text style={styles.statusText}>Check your connection and try again.</Text>
                <Text accessibilityRole="button" onPress={refetch} style={styles.retry}>Try again</Text>
            </View>
        );
    }

    if (!employeeId || !details) {
        return (
            <View style={styles.centered}>
                <MaterialCommunityIcons name="account-search-outline" size={36} color={theme.colors.textMuted} />
                <Text style={styles.statusTitle}>No user information found</Text>
            </View>
        );
    }

    const name = details.FNAME || details.AADHAARNAME || user?.userName || 'User Information';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons
                            name={details.GENDER === 'FEMALE' ? 'face-woman' : 'account'}
                            size={30}
                            color={theme.colors.brandContrast}
                        />
                    </View>
                    <View style={styles.profileText}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.employeeId}>Employee ID: {details.IDCARD || employeeId}</Text>
                    </View>
                </View>

                {details.DISABILITY ? (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="human-wheelchair" size={20} color={theme.colors.brand} />
                        <Text style={styles.detailLabel}>Disability</Text>
                        <Text style={styles.detailValue}>{details.DISABILITY}</Text>
                    </View>
                ) : null}

                {USER_DETAILS.map(({ key, label, icon, prefix }) => {
                    const value = details[key];
                    if (value === null || value === undefined || value === '') return null;

                    return (
                        <View key={key} style={styles.detailRow}>
                            <MaterialCommunityIcons name={icon} size={20} color={theme.colors.brand} />
                            <Text style={styles.detailLabel}>{label}</Text>
                            <Text style={styles.detailValue}>{`${prefix || ''}${value}`}</Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: theme.layout.screenGutter,
        backgroundColor: theme.colors.backgroundSubtle,
    },
    card: {
        ...theme.styles.card,
        padding: theme.spacing.lg,
        ...theme.styles.shadow,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    avatar: {
        width: theme.controlSizes.avatarLg,
        height: theme.controlSizes.avatarLg,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.brand,
        marginRight: theme.spacing.md,
    },
    profileText: {
        flex: 1,
    },
    name: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    employeeId: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
    },
    detailRow: {
        minHeight: theme.controlSizes.minTouchTarget,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        gap: theme.spacing.sm,
    },
    detailLabel: {
        flex: 1,
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
    },
    detailValue: {
        flex: 1.2,
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.medium,
        textAlign: 'right',
    },
    centered: {
        flex: 1,
        padding: theme.spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
    statusTitle: {
        ...theme.typography.title,
        marginTop: theme.spacing.md,
        color: theme.colors.text,
        textAlign: 'center',
    },
    statusText: {
        ...theme.typography.bodySmall,
        marginTop: theme.spacing.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    retry: {
        marginTop: theme.spacing.lg,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
    },
});
