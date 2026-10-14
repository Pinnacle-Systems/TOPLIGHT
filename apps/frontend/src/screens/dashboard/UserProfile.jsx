import React, { useMemo, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useGetUserBasicDetailsQuery } from '../../store/api/userApi';
import { useGetInQuery } from '../../store/api/OndutyApi';
import { BASE_URL, USERS_API } from '@env';
import ImageViewModal from '../../components/Modal/ImageViewModal';
import { CustomNavigation } from '../../components/Utils/NavigationRef';
import { Current_moment_dataformat } from '../../components/Utils/FormatedDate';
import { useAppTheme } from '../../theme';

export function UserProfileCard({ USER, picture, openCamera }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data: data_IN } = useGetInQuery();
    const UserSelect = useSelector((state) => state?.UserDetails);
    const [openImageModal, setOpenImageModal] = useState(false);

    // Resolve idcard safely: USER can be a string (Idcard) or object with UserId
    const resolvedIdcard = typeof USER === 'string'
        ? USER
        : (USER?.UserId || USER?.IDCARD || USER?.Id || UserSelect?.UserId || UserSelect?.IDCARD);

    const resolvedUsername = typeof USER === 'string'
        ? UserSelect?.userName
        : (USER?.userName || UserSelect?.userName);

    const { data, isLoading, isError } = useGetUserBasicDetailsQuery(
        { Idcard: resolvedIdcard },
        { skip: !resolvedIdcard }
    );

    const EmployeeDetail = data?.data;
    const Onduty_IN = data_IN?.data;

    const isOnDuty = Onduty_IN?.approvalStatus === 'approved';
    const isInOffice = !!UserSelect?.INTIME;

    // Status config
    const statusConfig = isOnDuty
        ? { label: '● On Duty', bg: theme.colors.dangerSoft, text: theme.colors.danger, icon: 'van-quick' }
        : isInOffice
        ? { label: '● In Office', bg: theme.colors.successSoft, text: theme.colors.success, icon: 'office-building-check' }
        : { label: '● Not Punched', bg: theme.colors.surfaceSunken, text: theme.colors.textSecondary, icon: 'clock-outline' };

    const photoUri = picture || `${BASE_URL}/${USERS_API}/getUserImage/${resolvedUsername?.toLowerCase()}`;

    if (isLoading) {
        return (
            <View style={styles.skeletonCard}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonBody}>
                    <View style={styles.skeletonLine} />
                    <View style={[styles.skeletonLine, { width: '55%', marginTop: 8 }]} />
                    <View style={[styles.skeletonLine, { width: '70%', marginTop: 8 }]} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.card}>
                {/* Accent stripe */}
                <View style={styles.accentStripe} />

                <View style={styles.cardBody}>
                    {/* Avatar Column */}
                    <TouchableOpacity
                        style={styles.avatarWrap}
                        onPress={() => setOpenImageModal(true)}
                        activeOpacity={0.85}
                    >
                        <Image
                            source={{ uri: photoUri }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity
                            style={styles.cameraBtn}
                            onPress={() => openCamera(true)}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="camera" size={13} color={theme.colors.brandContrast} />
                        </TouchableOpacity>

                        {/* Status badge under avatar */}
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                            <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Info Column */}
                    <View style={styles.infoCol}>
                        {/* Name + ID row */}
                        <View style={styles.nameRow}>
                            <Text style={styles.nameText} numberOfLines={1}>
                                {EmployeeDetail?.Name || UserSelect?.EMPNAME || UserSelect?.userName || 'Employee'}
                            </Text>
                        </View>

                        {/* ID pill */}
                        {(EmployeeDetail?.EmpId || resolvedIdcard) ? (
                            <View style={styles.idPill}>
                                <MaterialCommunityIcons name="badge-account-outline" size={11} color={theme.colors.brand} />
                                <Text style={styles.idPillText}>
                                    {EmployeeDetail?.EmpId || resolvedIdcard}
                                </Text>
                            </View>
                        ) : null}

                        {/* Designation */}
                        {EmployeeDetail?.Designation ? (
                            <Text style={styles.designationText} numberOfLines={1}>
                                {EmployeeDetail.Designation}
                            </Text>
                        ) : null}

                        {/* Department */}
                        {EmployeeDetail?.Department ? (
                            <Text style={styles.departmentText} numberOfLines={1}>
                                {EmployeeDetail.Department}
                            </Text>
                        ) : null}

                        {/* Punch times row */}
                        <View style={styles.punchRow}>
                            <View style={styles.punchItem}>
                                <MaterialCommunityIcons name="calendar-today" size={12} color={theme.colors.textMuted} />
                                <Text style={styles.punchItemText}>
                                    {Current_moment_dataformat('MMM DD')}
                                </Text>
                            </View>

                            <View style={styles.punchDivider} />

                            <TouchableOpacity
                                style={styles.punchItem}
                                onPress={isOnDuty ? () => CustomNavigation('onduty') : undefined}
                            >
                                <MaterialCommunityIcons name="login" size={12} color={theme.colors.success} />
                                <Text style={[styles.punchItemText, { color: theme.colors.success }]}>
                                    {UserSelect?.INTIME || '--:--'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.punchDivider} />

                            <View style={styles.punchItem}>
                                <MaterialCommunityIcons name="logout" size={12} color={theme.colors.danger} />
                                <Text style={[styles.punchItemText, { color: theme.colors.danger }]}>
                                    {UserSelect?.OUTTIME || '--:--'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <ImageViewModal
                direct={picture}
                image={photoUri}
                visible={openImageModal}
                setVisible={setOpenImageModal}
            />
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    wrapper: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        elevation: 3,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
    },
    accentStripe: {
        height: 4,
        backgroundColor: theme.colors.brand,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        gap: 14,
    },

    // Avatar
    avatarWrap: {
        alignItems: 'center',
        width: 76,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: theme.colors.borderSubtle,
        backgroundColor: theme.colors.surfaceSunken,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 22,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.brand,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    statusBadge: {
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        alignSelf: 'center',
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // Info
    infoCol: { flex: 1 },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.text,
        flex: 1,
        letterSpacing: -0.3,
    },
    idPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.brandSoft,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        gap: 4,
        marginBottom: 5,
    },
    idPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.brand,
    },
    designationText: {
        fontSize: 12,
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    departmentText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },

    // Punch row
    punchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        gap: 8,
    },
    punchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        flex: 1,
        justifyContent: 'center',
    },
    punchItemText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    punchDivider: {
        width: 1,
        height: 16,
        backgroundColor: theme.colors.divider,
    },

    // Skeleton
    skeletonCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 14,
        margin: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        gap: 14,
    },
    skeletonAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: theme.colors.divider,
    },
    skeletonBody: { flex: 1, justifyContent: 'center' },
    skeletonLine: {
        height: 13,
        backgroundColor: theme.colors.divider,
        borderRadius: 6,
        width: '80%',
    },
});

export default UserProfileCard;
