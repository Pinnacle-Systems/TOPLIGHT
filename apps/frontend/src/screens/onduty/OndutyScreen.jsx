import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator, 
    TouchableOpacity, 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageResizer from 'react-native-image-resizer';
import RNBlobUtil from 'react-native-blob-util';
import { showMessage } from 'react-native-flash-message';

// Redux & APIs
import { 
    useGetDocIDQuery, 
    useGetInQuery, 
    useGet_reachedQuery, 
    useGet_all_Onduty_reasonQuery, 
    useGet__VechileQuery,
    useGet__vechilekmQuery,
} from '../../store/api/OndutyApi';
import { useGet_refresh_tokenQuery, useGet_hod_tokenQuery } from '../../store/api/userApi';
import { 
    setOndutyField, 
    setOndutyLocation, 
    setOndutyDocId,
    setKmEntryEnabled,
} from '../../store/slices/ondutyInputSlice';

// Utilities
import { getCurrentLocationAsync } from '../../components/Utils/CustomLocation';
import { getKmEntrySetting } from '../../utils/kmSettings';
import socket from '../../utils/Socket';

// Custom Hooks
import { useLocationTracker } from './hooks/useLocationTracker';
import { useOndutySubmit } from './hooks/useOndutySubmit';

// Components
import OndutyActiveTrip from './components/OndutyActiveTrip';
import OndutyReachedTrip from './components/OndutyReachedTrip';
import OndutyEntryForm from './components/OndutyEntryForm';
import OndutyModificationModal from './components/OndutyModificationModal';
import CameraModal from '../../components/Modal/CameraModal';
import { useAppTheme } from '../../theme';

const IMAGE_CONFIG = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 80,
    format: 'JPEG',
    maxFileSize: 2 * 1024 * 1024, // 2MB
};

export default function OndutyScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const UserSelect = useSelector(state => state.UserDetails);
    const formState = useSelector(state => state.ondutyInput);

    // Local UI states
    const [photo, setPhoto] = useState(null);
    const [compressedPhoto, setCompressedPhoto] = useState(null);
    const [isCameraModal, setIsCameraModal] = useState(false);
    const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);

    // Queries
    const { data: docidData, refetch: refetchDocId } = useGetDocIDQuery();
    const { data: data_IN, error: error_IN, refetch: refetchIn, isLoading: loadingIn } = useGetInQuery();
    const { data: reachedData, refetch: refetchReached } = useGet_reachedQuery();
    const { data: allReasons, refetch: refetchAllReasons } = useGet_all_Onduty_reasonQuery();
    const { data: allVehicles } = useGet__VechileQuery(
        {
            params: { where: JSON.stringify({ USEDBY: UserSelect?.EMPNAME }) },
        },
        { skip: !formState.isKmEntryEnabled }
    );

    // Query last recorded KM when KM entry is enabled and vehicle selected
    const { data: kmData } = useGet__vechilekmQuery(
        { VEHICLENO: formState.vechileno },
        { skip: !formState.isKmEntryEnabled || !formState.vechileno }
    );
    const lastRecordedKm = kmData?.data?.end_km || kmData?.data?.start_km;

    const approvalType = String(UserSelect?.approval || 'HOD').toUpperCase();
    const hod = String(UserSelect?.hod || '').trim();
    const hr = String(UserSelect?.hr || '').trim();

    const isHodMissing = (approvalType === 'HOD' || approvalType === 'BOTH') && (!hod || hod === 'null' || hod === 'undefined' || hod === '0');
    const isHrMissing = (approvalType === 'HR' || approvalType === 'BOTH') && (!hr || hr === 'null' || hr === 'undefined' || hr === '0');

    const authorityWarning = useMemo(() => {
        if (approvalType === 'BOTH' && isHodMissing && isHrMissing) {
            return {
                title: 'Reporting HOD and HR Not Assigned',
                desc: 'Your profile is configured for dual HOD and HR approval in User Control, but neither an HOD nor an HR is assigned. Please ask your administrator to assign your reporting authorities.',
            };
        }
        if (isHodMissing) {
            return {
                title: 'Reporting HOD Not Assigned',
                desc: approvalType === 'BOTH'
                    ? 'Your profile requires dual HOD and HR approval, but no reporting HOD is assigned. Please ask your administrator to assign an HOD in User Control.'
                    : 'Your profile is configured for HOD approval, but no reporting HOD is assigned. OnDuty requests require an HOD for approval. Please ask your administrator to assign an HOD in User Control.',
            };
        }
        if (isHrMissing) {
            return {
                title: 'Reporting HR Not Assigned',
                desc: approvalType === 'BOTH'
                    ? 'Your profile requires dual HOD and HR approval, but no reporting HR is assigned. Please ask your administrator to assign an HR in User Control.'
                    : 'Your profile is configured for HR approval, but no reporting HR is assigned. OnDuty requests require an HR for approval. Please ask your administrator to assign an HR in User Control.',
            };
        }
        return null;
    }, [approvalType, isHodMissing, isHrMissing]);

    const shouldFetchHod = (approvalType === 'HOD' || approvalType === 'BOTH') && Boolean(hod && hod !== 'null');
    const shouldFetchHr = (approvalType === 'HR' || approvalType === 'BOTH') && Boolean(hr && hr !== 'null');

    const { data: refToken } = useGet_refresh_tokenQuery();
    const { data: hodToken } = useGet_hod_tokenQuery({
        params: { hod },
    }, { skip: !shouldFetchHod });
    const { data: hrToken } = useGet_hod_tokenQuery({
        params: { hod: hr },
    }, { skip: !shouldFetchHr });

    // Location Tracker Hook (persistent background service)
    const { startTracking, stopTracking } = useLocationTracker({
        autoRestartOnMount: true,
        onError: (err) => console.warn('[LocationTracker Error]', err),
    });

    // Onduty Submit Hook
    const { handleSubmitIN, handleSubmitOUT, handleReached } = useOndutySubmit({
        onStartTracking: startTracking,
        onStopTracking: stopTracking,
        setIsSubmitting,
        setCompressedPhoto,
        setUploadProgress,
        refetchAllReasons,
        refetchFCMTokens: {
            refToken: refToken?.data?.token,
            hodFCMToken: hodToken?.data?.fcm,
            hrFCMToken: hrToken?.data?.fcm,
            approvalType,
        },
    });

    // ── Sync KM Entry Setting from AsyncStorage on mount ────────────────────────
    useEffect(() => {
        async function syncKmSetting() {
            const isEnabled = await getKmEntrySetting();
            dispatch(setKmEntryEnabled(isEnabled));
        }
        syncKmSetting();
    }, [dispatch]);

    // ── Initial DocID Setup ─────────────────────────────────────────────────────
    useEffect(() => {
        if (docidData?.data?.count && UserSelect?.GCOMPCODE) {
            const count = String(docidData.data.count).padStart(6, '0');
            const docid = `${UserSelect.GCOMPCODE}/OND-${count}`;
            dispatch(setOndutyDocId({
                docid,
                docdate: new Date().toISOString(),
                idcard: UserSelect.UserId,
                empname: UserSelect.EMPNAME,
            }));
        }
    }, [docidData, UserSelect, dispatch]);

    // ── Reason Options Setup ────────────────────────────────────────────────────
    useEffect(() => {
        if (allReasons?.data) {
            dispatch(setOndutyField({ category_options: allReasons.data }));
        }
    }, [allReasons, dispatch]);

    // ── Vehicles Options Setup ──────────────────────────────────────────────────
    useEffect(() => {
        if (allVehicles?.data && allVehicles.data.length > 0) {
            dispatch(setOndutyField({ category_vechileno: allVehicles.data }));
            if (allVehicles.data.length === 1) {
                dispatch(setOndutyField({ vechileno: allVehicles.data[0].vechileno }));
            }
        }
    }, [allVehicles, dispatch]);

    // ── Initial GPS Location Fetch ──────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;
        const fetchLocation = async () => {
            try {
                setLoadingLocation(true);
                const coords = await getCurrentLocationAsync(10000);
                if (isMounted && coords) {
                    dispatch(setOndutyLocation({
                        latitude: coords.latitude || 0,
                        longitude: coords.longitude || 0,
                        address: coords.address || 'GPS coordinates ready',
                    }));
                }
            } catch (err) {
                console.log('[OndutyScreen] Location fetch:', err?.message);
            } finally {
                if (isMounted) setLoadingLocation(false);
            }
        };
        fetchLocation();
        return () => { isMounted = false; };
    }, [dispatch]);

    // ── Socket Approval Notification ───────────────────────────────────────────
    useEffect(() => {
        if (!UserSelect?.UserId || !socket?.connected) return;
        const ev = `get_Onduty_Approval_status:${UserSelect.GCOMPCODE}${UserSelect.UserId}`;
        const handler = () => {
            refetchIn();
            refetchReached();
        };
        socket.on(ev, handler);
        return () => socket.off(ev, handler);
    }, [UserSelect, socket?.connected, refetchIn, refetchReached]);

    // ── Image Processing & Compression ─────────────────────────────────────────
    const handleImageProcessing = async (imageUri) => {
        try {
            const cleanUri = imageUri.replace('file://', '');
            const stat = await RNBlobUtil.fs.stat(cleanUri);
            if (stat.size <= IMAGE_CONFIG.maxFileSize) {
                return imageUri;
            }
            const ratio = Math.sqrt(IMAGE_CONFIG.maxFileSize / stat.size);
            const targetWidth = Math.floor(IMAGE_CONFIG.maxWidth * ratio);
            const targetHeight = Math.floor(IMAGE_CONFIG.maxHeight * ratio);

            const resized = await ImageResizer.createResizedImage(
                imageUri,
                targetWidth,
                targetHeight,
                IMAGE_CONFIG.format,
                IMAGE_CONFIG.quality,
                0,
                null,
                false,
                { mode: 'stretch' }
            );
            return resized.uri;
        } catch (e) {
            console.error('[Image Processing Error]:', e);
            return imageUri;
        }
    };

    const handlePictureTaken = async (imageUri) => {
        try {
            setIsCameraModal(false);
            const processed = await handleImageProcessing(imageUri);
            setPhoto(imageUri);
            setCompressedPhoto(processed);
        } catch {
            showMessage({ message: 'Image Error', description: 'Failed to process photo.', type: 'danger' });
        }
    };

    // ── Field Change Handlers ───────────────────────────────────────────────────
    const onSelectCategory = (val) => {
        const value = typeof val === 'function' ? val(formState.category) : val;
        dispatch(setOndutyField({ category: value }));
    };

    const onSelectVehicle = (val) => {
        const value = typeof val === 'function' ? val(formState.vechileno) : val;
        dispatch(setOndutyField({ vechileno: value }));
    };

    const onChangeOthers = (text) => {
        dispatch(setOndutyField({ others: text }));
    };

    const onChangeStartKm = (val) => {
        dispatch(setOndutyField({ start_km: val }));
    };

    const onChangeEndKm = (val) => {
        dispatch(setOndutyField({ end_km: val }));
    };

    const onChangeReachedKm = (val) => {
        dispatch(setOndutyField({ reached_km: val }));
    };

    const handleStartOnduty = () => {
        handleSubmitIN(compressedPhoto);
    };

    // ── Render States ───────────────────────────────────────────────────────────

    // 1. Full Submission Loading Overlay
    if (isSubmitting) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.loadingCard}>
                    <View style={styles.loadingIconCircle}>
                        <ActivityIndicator size="large" color={theme.colors.brand} />
                    </View>
                    <Text style={styles.loadingTitle}>Submitting OnDuty</Text>
                    <Text style={styles.loadingSubtitle}>Syncing trip details and initializing background GPS tracking...</Text>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${Math.max(uploadProgress, 15)}%` }]} />
                    </View>
                </View>
            </View>
        );
    }

    // 2. Network Error State
    if (error_IN) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.errorCard}>
                    <MaterialCommunityIcons name="wifi-off" size={48} color={theme.colors.danger} />
                    <Text style={styles.errorTitle}>Connection Error</Text>
                    <Text style={styles.errorSubtitle}>Unable to connect to OnDuty service. Please check your network connection.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => refetchIn()}>
                        <Text style={styles.retryBtnText}>Retry Connection</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // 3. Initial Loading State
    if (loadingIn && !data_IN) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
                <Text style={styles.initLoadingText}>Loading OnDuty session...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Trip Reached Office State */}
                {reachedData?.data?.docid && reachedData?.data?.inout === 'OUT' ? (
                    <OndutyReachedTrip
                        reachedData={reachedData.data}
                        onConfirmReached={handleReached}
                        isSubmitting={isSubmitting}
                        isKmEntryEnabled={formState.isKmEntryEnabled}
                        reachedKm={formState.reached_km}
                        onChangeReachedKm={onChangeReachedKm}
                    />
                ) : data_IN?.data?.docid && data_IN?.data?.inout === 'IN' ? (
                    /* 2. Active Trip (IN) State */
                    <OndutyActiveTrip
                        tripData={data_IN.data}
                        onSubmitOut={handleSubmitOUT}
                        isSubmitting={isSubmitting}
                        isKmEntryEnabled={formState.isKmEntryEnabled}
                        endKm={formState.end_km}
                        onChangeEndKm={onChangeEndKm}
                    />
                ) : (
                    /* 3. New Entry Form State */
                    <>
                        {authorityWarning && (
                            <View style={styles.warningBanner}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={22} color={theme.colors.warning} />
                                <View style={styles.warningBannerTextGroup}>
                                    <Text style={styles.warningBannerTitle}>{authorityWarning.title}</Text>
                                    <Text style={styles.warningBannerDesc}>{authorityWarning.desc}</Text>
                                </View>
                            </View>
                        )}
                        <OndutyEntryForm
                        docId={formState.docid}
                        categoryOptions={formState.category_options}
                        selectedCategory={formState.category}
                        onSelectCategory={onSelectCategory}
                        categoryDropdownOpen={categoryDropdownOpen}
                        setCategoryDropdownOpen={setCategoryDropdownOpen}
                        othersText={formState.others}
                        onChangeOthers={onChangeOthers}
                        // KM Entry Props (Conditional)
                        isKmEntryEnabled={formState.isKmEntryEnabled}
                        vehicleOptions={formState.category_vechileno}
                        selectedVehicle={formState.vechileno}
                        onSelectVehicle={onSelectVehicle}
                        vehicleDropdownOpen={vehicleDropdownOpen}
                        setVehicleDropdownOpen={setVehicleDropdownOpen}
                        startKm={formState.start_km}
                        onChangeStartKm={onChangeStartKm}
                        lastRecordedKm={lastRecordedKm}
                        // Photo & Submit
                        photoUri={compressedPhoto}
                        onOpenCamera={() => setIsCameraModal(true)}
                        onSubmitIN={handleStartOnduty}
                        isSubmitting={isSubmitting}
                        isAdmin={UserSelect?.isAdmin === 1 || UserSelect?.isAdmin === true}
                        onOpenBrowseModal={() => setIsBrowseModalOpen(true)}
                    />
                    </>
                )}
            </ScrollView>

            {/* Camera Modal */}
            <CameraModal
                visible={isCameraModal}
                setVisible={setIsCameraModal}
                onPictureTaken={handlePictureTaken}
            />

            {/* Admin Browse / Modification Modal */}
            <OndutyModificationModal
                visible={isBrowseModalOpen}
                onClose={() => setIsBrowseModalOpen(false)}
            />
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingHorizontal: theme.layout.screenGutter,
        paddingTop: theme.spacing.md + 2,
        paddingBottom: theme.spacing.xxxl,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xxl,
    },
    loadingCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
        padding: theme.spacing.xxxl,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.isDark ? 0.32 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    loadingIconCircle: {
        width: theme.controlSizes.avatarXl - 8,
        height: theme.controlSizes.avatarXl - 8,
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.brandSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    loadingTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs + 2,
    },
    loadingSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    progressBarBackground: {
        width: '100%',
        height: 6,
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.brand,
        borderRadius: 4,
    },
    errorCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
        padding: theme.spacing.xxxl,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        elevation: 3,
    },
    errorTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs + 2,
    },
    errorSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    retryBtn: {
        backgroundColor: theme.colors.brand,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radii.md,
    },
    retryBtnText: {
        ...theme.typography.button,
        color: theme.colors.brandContrast,
    },
    initLoadingText: {
        marginTop: theme.spacing.md + 2,
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.warningSoft,
        borderColor: theme.colors.warning,
        borderWidth: 1,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    warningBannerTextGroup: {
        flex: 1,
        marginLeft: theme.spacing.sm,
    },
    warningBannerTitle: {
        ...theme.typography.label,
        fontFamily: theme.typography.fontBold,
        color: theme.colors.warning,
        marginBottom: 2,
    },
    warningBannerDesc: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        lineHeight: 18,
    },
});
