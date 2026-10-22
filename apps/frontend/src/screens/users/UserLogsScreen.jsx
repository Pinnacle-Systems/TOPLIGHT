import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetLoginLogsQuery } from '../../store/api/UserApi';
import { useAppTheme } from '../../theme';

const formatLogDate = value => {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const LoginLogCard = ({ item, theme, styles }) => {
    const successful = String(item?.status || '').toLowerCase() === 'success';
    const eventType = item?.type || 'Login';
    const userName = item?.User || 'Unknown user';

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, successful ? styles.successIcon : styles.neutralIcon]}>
                    <MaterialCommunityIcons
                        name={successful ? 'check' : 'login'}
                        size={19}
                        color={successful ? theme.colors.success : theme.colors.brand}
                    />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.eventType}>{eventType}</Text>
                </View>
                <Text style={[styles.status, successful ? styles.successText : styles.neutralText]}>
                    {item?.status || 'Recorded'}
                </Text>
            </View>

            <View style={styles.logDetail}>
                <MaterialCommunityIcons name="clock-outline" size={17} color={theme.colors.textMuted} />
                <Text style={styles.logDetailText}>{formatLogDate(item?.date)}</Text>
            </View>
            {!!item?.MobileName && (
                <View style={styles.logDetail}>
                    <MaterialCommunityIcons name="cellphone" size={17} color={theme.colors.textMuted} />
                    <Text style={styles.logDetailText}>Device: {item.MobileName}</Text>
                </View>
            )}
            {!!item?.MobileIP && (
                <View style={styles.logDetail}>
                    <MaterialCommunityIcons name="ip-network-outline" size={17} color={theme.colors.textMuted} />
                    <Text style={styles.logDetailText}>IP: {item.MobileIP}</Text>
                </View>
            )}
            {!!item?.error && <Text style={styles.errorText}>{item.error}</Text>}
        </View>
    );
};

export default function UserLogsScreen() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data, isLoading, isError, refetch, isFetching } = useGetLoginLogsQuery();
    const logs = Array.isArray(data?.data) ? data.data : [];

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
                <Text style={styles.statusText}>Loading login activity...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centered}>
                <MaterialCommunityIcons name="alert-circle-outline" size={36} color={theme.colors.danger} />
                <Text style={styles.statusTitle}>Could not load login activity</Text>
                <Text style={styles.statusText}>Check your connection and try again.</Text>
                <Text accessibilityRole="button" onPress={refetch} style={styles.retry}>Try again</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.list}
            contentContainerStyle={[styles.listContent, logs.length === 0 && styles.emptyList]}
            data={logs}
            keyExtractor={item => String(item?.id)}
            renderItem={({ item }) => <LoginLogCard item={item} theme={theme} styles={styles} />}
            refreshControl={
                <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
            }
            ListHeaderComponent={<Text style={styles.title}>Login Activity</Text>}
            ListEmptyComponent={(
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="text-box-search-outline" size={38} color={theme.colors.textDisabled} />
                    <Text style={styles.statusTitle}>No login activity found</Text>
                </View>
            )}
        />
    );
}

const createStyles = theme => StyleSheet.create({
    list: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSubtle,
    },
    listContent: {
        flexGrow: 1,
        padding: theme.layout.screenGutter,
        paddingBottom: theme.spacing.xxl,
    },
    title: {
        ...theme.typography.h3,
        marginBottom: theme.spacing.md,
        color: theme.colors.text,
    },
    card: {
        ...theme.styles.card,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.styles.shadow,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    iconWrap: {
        width: theme.controlSizes.avatarSm + 6,
        height: theme.controlSizes.avatarSm + 6,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    successIcon: {
        backgroundColor: theme.colors.successSoft,
    },
    neutralIcon: {
        backgroundColor: theme.colors.brandSoft,
    },
    headerText: {
        flex: 1,
    },
    userName: {
        ...theme.typography.title,
        color: theme.colors.text,
    },
    eventType: {
        marginTop: theme.spacing.xxs,
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    status: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.pill,
        overflow: 'hidden',
        ...theme.typography.overline,
        textTransform: 'uppercase',
    },
    successText: {
        color: theme.colors.success,
        backgroundColor: theme.colors.successSoft,
    },
    neutralText: {
        color: theme.colors.brandStrong,
        backgroundColor: theme.colors.brandSoft,
    },
    logDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    logDetailText: {
        flex: 1,
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    errorText: {
        marginTop: theme.spacing.md,
        ...theme.typography.caption,
        color: theme.colors.danger,
    },
    emptyList: {
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.huge,
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
