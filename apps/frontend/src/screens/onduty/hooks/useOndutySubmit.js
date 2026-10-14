/**
 * useOndutySubmit.js
 *
 * Encapsulates ALL submission logic for:
 *   1. handleSubmitIN  - Start OnDuty (IN)
 *   2. handleSubmitOUT - Checkout from OnDuty (OUT)
 *   3. handleReached   - Confirm reached office
 */
import { useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'react-native-flash-message';
import { API_URL as BASE_URL } from '@env';

import { resetOndutyForm } from '../../../store/slices/ondutyInputSlice';
import {
    useRequestOndutyOutMutation,
    useRequestReachedOutMutation,
    useGetDocIDQuery,
    useGetInQuery,
    useGet__VechileQuery,
} from '../../../store/api/OndutyApi';
import { getCurrentLocationAsync } from '../../../components/Utils/CustomLocation';
import { _FCM_SENDER } from '../../../components/Utils/FCM';
import socket from '../../../utils/Socket';
import OndutyRTk from '../../../store/api/OndutyApi';

const ONDUTY_API = `${BASE_URL}/onduty/requestOnduty`;

export function useOndutySubmit({
    onStartTracking,    // fn(userId, docId, compCode)
    onStopTracking,     // fn()
    setIsSubmitting,    // local state setter
    setUploadProgress,  // local state setter
    refetchFCMTokens,   // { refToken, hodFCMToken }
    setCompressedPhoto,  // local state setter for compressed photo URI
}) {
    const dispatch = useDispatch();
    const isSubmittingRef = useRef(false);

    const UserSelect = useSelector(st => st?.UserDetails);
    const formState  = useSelector(st => st?.ondutyInput);

    const { refetch: refetchDocId } = useGetDocIDQuery();
    const { refetch: refetchIn    } = useGetInQuery();
    const { refetch: refetchVehicles } = useGet__VechileQuery({
        params: { where: JSON.stringify({ USEDBY: UserSelect?.EMPNAME }) },
    });

    const [requestOndutyOut] = useRequestOndutyOutMutation();
    const [requestReachedOut] = useRequestReachedOutMutation();

    // ── Helper: get current GPS coords ────────────────────────────────────────
    const fetchCoords = useCallback(async () => {
        try {
            const coords = await getCurrentLocationAsync(15000);
            return {
                latitude: coords.latitude,
                longitude: coords.longitude,
                address: 'Location retrieved on submission',
            };
        } catch {
            return {
                latitude: formState.latitude || 0,
                longitude: formState.longitude || 0,
                address: 'Location unavailable',
            };
        }
    }, [formState.latitude, formState.longitude]);

    // ── Helper: refetch all and reset form ────────────────────────────────────
    const refreshAndReset = useCallback(async () => {
        dispatch(resetOndutyForm());
        await Promise.allSettled([refetchIn(), refetchVehicles(), refetchDocId()]);
    }, [dispatch, refetchIn, refetchVehicles, refetchDocId]);

    // ── Submit IN ──────────────────────────────────────────────────────────────
    const handleSubmitIN = useCallback(async (compressedPhotoUri) => {
        if (isSubmittingRef.current) return;

        if (!compressedPhotoUri) {
            showMessage({ message: 'Photo Required', description: 'Please capture a photo.', type: 'warning' });
            return;
        }

        if (!formState.category) {
            showMessage({ message: 'Reason Required', description: 'Please select a category.', type: 'warning' });
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const activeSessionQuery = await refetchIn();
            if (activeSessionQuery.error || activeSessionQuery.data?.status !== 1) {
                showMessage({
                    message: 'Data Fetch Failed',
                    description: 'Unable to verify your active OnDuty session. Please try again.',
                    type: 'danger',
                });
                return;
            }

            const activeSession = activeSessionQuery.data?.data;
            if (activeSession?.docid && activeSession?.inout === 'IN') {
                showMessage({
                    message: 'Active OnDuty Found',
                    description: 'Your active OnDuty session is being loaded.',
                    type: 'warning',
                });
                return;
            }

            const coords = await fetchCoords();

            const latestDocQuery = await refetchDocId();
            const latestCount = latestDocQuery?.data?.data?.count || 0;
            const paddedCount = String(latestCount).padStart(6, '0');
            const finalDocId = `${UserSelect?.GCOMPCODE}/OND-${paddedCount}`;

            const formData = new FormData();

            if (UserSelect?.approval === 'HOD') {
                formData.append('hod', String(UserSelect?.hod || '0'));
            } else if (UserSelect?.approval === 'HR') {
                formData.append('hr', String(UserSelect?.hr || '0'));
            } else {
                formData.append('hod', String(UserSelect?.hod || '0'));
                formData.append('hr',  String(UserSelect?.hr  || '0'));
            }

            formData.append('userId',       UserSelect?.UserId || '0');
            formData.append('idcard',       UserSelect?.UserId || '0');
            formData.append('docdate',      new Date().toISOString());
            formData.append('others',       formState.others   || 'No reason provided');
            formData.append('create',       '1');
            formData.append('docid',        finalDocId);

            // KM Entry: only pass vehicle and start_km when isKmEntryEnabled is true
            const hasKmEnabled = Boolean(formState.isKmEntryEnabled);
            formData.append('vechileno',    hasKmEnabled ? (formState.vechileno || '') : '');
            formData.append('start_km',     hasKmEnabled ? (formState.start_km || '0') : '0');
            formData.append('Svechilekm',   hasKmEnabled ? (formState.start_km || '0') : '0');

            formData.append('bunk',         formState.bunk      || '');
            formData.append('compCode',     UserSelect?.GCOMPCODE || '');
            formData.append('inout',        'IN');
            formData.append('empname',      UserSelect?.EMPNAME || 'Employee');
            formData.append('category',     String(formState.category || '0'));
            formData.append('in_location',  coords.address);
            formData.append('in_latitude',  String(coords.latitude));
            formData.append('in_longtiude', String(coords.longitude));
            formData.append('docCount',     String(latestCount));

            const safeName = String(UserSelect?.EMPNAME || 'emp').replace(/\s/g, '_');
            formData.append('file', {
                uri:  compressedPhotoUri,
                type: 'image/jpeg',
                name: `${UserSelect?.GCOMPCODE}_${safeName}_onduty.jpg`,
            });

            setUploadProgress(30);

            const response = await fetch(ONDUTY_API, {
                method:  'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'compcode': UserSelect?.GCOMPCODE,
                    'Idcard':   UserSelect?.UserId,
                },
                body: formData,
            });

            setUploadProgress(70);
            const data = await response.json();
            setUploadProgress(90);

            if (data?.status === 1) {
                showMessage({ message: 'OnDuty Started ✓', description: 'Your trip has been recorded.', type: 'success' });

                socket.emit('onduty_request', {
                    hod:      UserSelect?.hod,
                    compcode: UserSelect?.GCOMPCODE,
                    userdata: {
                        email:    '',
                        username: UserSelect?.userName,
                        Idcard:   UserSelect?.UserId,
                        mobile:   UserSelect?.MOBNO,
                    },
                    ...data?.data,
                });

                await onStartTracking?.(UserSelect?.UserId, finalDocId, UserSelect?.GCOMPCODE);

                try {
                    await _FCM_SENDER(
                        refetchFCMTokens?.refToken,
                        refetchFCMTokens?.hodFCMToken,
                        `OnDuty By: ${UserSelect?.EMPNAME}`,
                    );
                } catch { /* silent */ }

                await refreshAndReset();

            } else if (data?.message?.includes('active on-duty session')) {
                Alert.alert(
                    'Active Session Found',
                    data?.message || 'You already have an active OnDuty session.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Close Old Session',
                            onPress: () => {
                                if (data?.docid) {
                                    handleSubmitOUT({ overrideDocId: data.docid });
                                } else {
                                    Alert.alert('Error', 'Cannot find the old session ID.');
                                }
                            },
                        },
                    ],
                );
            } else {
                Alert.alert('Submission Failed', data?.message || 'Server returned an error.');
            }

        } catch (e) {
            dispatch(OndutyRTk.util.resetApiState());
            showMessage({ message: 'Error', description: e?.message || 'Submission failed', type: 'danger' });
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            setCompressedPhoto(null);
            setUploadProgress(0);
        }
    }, [formState, UserSelect, fetchCoords, refetchDocId, refetchIn, refreshAndReset, onStartTracking, refetchFCMTokens, dispatch, setIsSubmitting, setUploadProgress]);

    // ── Submit OUT ─────────────────────────────────────────────────────────────
    const handleSubmitOUT = useCallback(async ({
        docId,
        toOnduty = false,
        overrideDocId,
        endKm,
    } = {}) => {
        setIsSubmitting(true);
        try {
            const coords = await fetchCoords();
            const targetDocId = overrideDocId || docId;
            const hasKmEnabled = Boolean(formState.isKmEntryEnabled);

            const response = await requestOndutyOut({
                docid:         targetDocId,
                out_latitude:  String(coords.latitude),
                out_longtiude: String(coords.longitude),
                out_location:  coords.address,
                end_km:        hasKmEnabled ? (endKm || formState.end_km || '0') : '0',
                inout:         'OUT',
                to_onduty:     toOnduty,
            }).unwrap();

            if (response?.status === 1) {
                showMessage({ message: 'Checked Out ✓', description: 'OnDuty OUT recorded.', type: 'success' });

                await onStopTracking?.();

                try {
                    await _FCM_SENDER(
                        refetchFCMTokens?.refToken,
                        refetchFCMTokens?.hodFCMToken,
                        `OnDuty Out: ${UserSelect?.EMPNAME}`,
                    );
                } catch { /* silent */ }

                await refreshAndReset();

            } else {
                Alert.alert('Error', response?.message || 'Checkout failed');
            }
        } catch (e) {
            showMessage({ message: 'Error', description: e?.message || 'Checkout failed', type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchCoords, formState.isKmEntryEnabled, formState.end_km, requestOndutyOut, onStopTracking, refreshAndReset, refetchFCMTokens, UserSelect, setIsSubmitting]);

    // ── Confirm Reached ────────────────────────────────────────────────────────
    const handleReached = useCallback(async ({ docId, vehicleNo, reachedKm } = {}) => {
        setIsSubmitting(true);
        try {
            const hasKmEnabled = Boolean(formState.isKmEntryEnabled);

            const response = await requestReachedOut({
                docid:      docId,
                Evechilekm: hasKmEnabled ? (reachedKm || formState.reached_km || '0') : '0',
                VEHICLENO:  hasKmEnabled ? (vehicleNo || formState.vechileno || '') : '',
            }).unwrap();

            if (response?.status === 1) {
                showMessage({ message: 'Trip Complete ✓', description: 'Reached office confirmed.', type: 'success' });

                await onStopTracking?.();

                try {
                    await _FCM_SENDER(
                        refetchFCMTokens?.refToken,
                        refetchFCMTokens?.hodFCMToken,
                        `OnDuty Reached: ${UserSelect?.EMPNAME}`,
                    );
                } catch { /* silent */ }

                await refreshAndReset();

            } else {
                Alert.alert('Error', response?.message || 'Failed');
            }
        } catch (e) {
            showMessage({ message: 'Error', description: e?.message || 'Failed', type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    }, [requestReachedOut, formState.isKmEntryEnabled, formState.reached_km, formState.vechileno, onStopTracking, refreshAndReset, refetchFCMTokens, UserSelect, setIsSubmitting]);

    return { handleSubmitIN, handleSubmitOUT, handleReached };
}
