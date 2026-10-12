import React, { useState, useEffect, useCallback } from 'react';
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
    const { data: allReasons } = useGet_all_Onduty_reasonQuery();
    const { data: allVehicles } = useGet__VechileQuery({
        params: { where: JSON.stringify({ USEDBY: UserSelect?.EMPNAME }) },
    });

    // Query last recorded KM when KM entry is enabled and vehicle selected
    const { data: kmData } = useGet__vechilekmQuery(
        { VEHICLENO: formState.vechileno },
        { skip: !formState.isKmEntryEnabled || !formState.vechileno }
    );
    const lastRecordedKm = kmData?.data?.end_km || kmData?.data?.start_km;

    const { data: refToken } = useGet_refresh_tokenQuery();
    const { data: hodToken } = useGet_hod_tokenQuery({
        params: { hod: UserSelect?.hod },
    }, { skip: !UserSelect?.hod });

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
        setUploadProgress,
        refetchFCMTokens: {
            refToken: refToken?.data?.token,
            hodFCMToken: hodToken?.data?.fcm,
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
                        <ActivityIndicator size="large" color="#007AFF" />
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
                    <MaterialCommunityIcons name="wifi-off" size={48} color="#EF4444" />
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
                <ActivityIndicator size="large" color="#007AFF" />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 30,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 28,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    loadingIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 6,
    },
    loadingSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
    },
    progressBarBackground: {
        width: '100%',
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    errorCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 28,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 3,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 12,
        marginBottom: 6,
    },
    errorSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
    },
    retryBtn: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
    },
    retryBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    initLoadingText: {
        marginTop: 14,
        fontSize: 14,
        color: '#64748B',
    },
});
