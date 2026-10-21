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
import { formatUserFriendlyError } from '../../../utils/userFriendlyError';
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

        if (!UserSelect?.idcard) {
            showMessage({
                message: 'Employee ID Missing',
                description: 'Your employee ID is missing from your profile. Please log out and sign in again, or contact your administrator.',
                type: 'danger',
                duration: 4500,
            });
            return;
        }

        const approvalType = String(UserSelect?.approval || 'HOD').toUpperCase();
        const hod = String(UserSelect?.hod || '').trim();
        const hr = String(UserSelect?.hr || '').trim();

        const isHodMissing = (approvalType === 'HOD' || approvalType === 'BOTH') && (!hod || hod === 'null' || hod === '0');
        const isHrMissing = (approvalType === 'HR' || approvalType === 'BOTH') && (!hr || hr === 'null' || hr === '0');

        if (approvalType === 'BOTH' && isHodMissing && isHrMissing) {
            showMessage({
                message: 'Reporting Authorities Not Assigned',
                description: 'Your profile is configured for dual HOD and HR approval in User Control, but neither an HOD nor an HR is assigned. Please contact your administrator.',
                type: 'danger',
                duration: 5000,
            });
            return;
        }
        if (isHodMissing) {
            showMessage({
                message: 'Reporting HOD Not Assigned',
                description: approvalType === 'BOTH'
                    ? 'Your profile requires dual HOD and HR approval, but no reporting HOD is assigned. Please contact your administrator in User Control.'
                    : 'Your profile is configured for HOD approval, but no reporting HOD is assigned. OnDuty requests require an HOD for approval. Please contact your administrator in User Control.',
                type: 'danger',
                duration: 5000,
            });
            return;
        }
        if (isHrMissing) {
            showMessage({
                message: 'Reporting HR Not Assigned',
                description: approvalType === 'BOTH'
                    ? 'Your profile requires dual HOD and HR approval, but no reporting HR is assigned. Please contact your administrator in User Control.'
                    : 'Your profile is configured for HR approval, but no reporting HR is assigned. OnDuty requests require an HR for approval. Please contact your administrator in User Control.',
                type: 'danger',
                duration: 5000,
            });
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

            const effectiveHod = hod || (approvalType === 'HR' ? hr : '0');
            formData.append('hod', effectiveHod);
            formData.append('hr', hr || '');
            formData.append('approval', approvalType);

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
                    hod:      effectiveHod,
                    hr:       hr || '',
                    approval: approvalType,
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

                if (refetchFCMTokens?.refToken) {
                    const senderToken = refetchFCMTokens.refToken;
                    const noteMsg = `OnDuty By: ${UserSelect?.EMPNAME}`;
                    const fcmTasks = [];
                    if ((approvalType === 'HOD' || approvalType === 'BOTH') && refetchFCMTokens?.hodFCMToken) {
                        fcmTasks.push(_FCM_SENDER(senderToken, refetchFCMTokens.hodFCMToken, noteMsg).catch(() => {}));
                    }
                    if ((approvalType === 'HR' || approvalType === 'BOTH') && refetchFCMTokens?.hrFCMToken) {
                        fcmTasks.push(_FCM_SENDER(senderToken, refetchFCMTokens.hrFCMToken, noteMsg).catch(() => {}));
                    }
                    await Promise.allSettled(fcmTasks);
                }

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
                const friendly = formatUserFriendlyError(data?.message || 'Server returned an error.', 'OnDuty submission failed.');
                Alert.alert('Submission Failed', friendly);
            }

        } catch (e) {
            dispatch(OndutyRTk.util.resetApiState());
            const friendly = formatUserFriendlyError(e, 'Submission failed. Please check network connection and try again.');
            showMessage({ message: 'Submission Failed', description: friendly, type: 'danger', duration: 4500 });
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

                if (refetchFCMTokens?.refToken) {
                    const senderToken = refetchFCMTokens.refToken;
                    const noteMsg = `OnDuty Out: ${UserSelect?.EMPNAME}`;
                    const appType = refetchFCMTokens?.approvalType || 'HOD';
                    if ((appType === 'HOD' || appType === 'BOTH') && refetchFCMTokens?.hodFCMToken) {
                        _FCM_SENDER(senderToken, refetchFCMTokens.hodFCMToken, noteMsg).catch(() => {});
                    }
                    if ((appType === 'HR' || appType === 'BOTH') && refetchFCMTokens?.hrFCMToken) {
                        _FCM_SENDER(senderToken, refetchFCMTokens.hrFCMToken, noteMsg).catch(() => {});
                    }
                }

                await refreshAndReset();

            } else {
                const friendly = formatUserFriendlyError(response?.message || 'Checkout failed', 'Checkout failed');
                Alert.alert('Checkout Failed', friendly);
            }
        } catch (e) {
            const friendly = formatUserFriendlyError(e, 'Checkout failed. Please try again.');
            showMessage({ message: 'Checkout Failed', description: friendly, type: 'danger', duration: 4500 });
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

                if (refetchFCMTokens?.refToken) {
                    const senderToken = refetchFCMTokens.refToken;
                    const noteMsg = `OnDuty Reached: ${UserSelect?.EMPNAME}`;
                    const appType = refetchFCMTokens?.approvalType || 'HOD';
                    if ((appType === 'HOD' || appType === 'BOTH') && refetchFCMTokens?.hodFCMToken) {
                        _FCM_SENDER(senderToken, refetchFCMTokens.hodFCMToken, noteMsg).catch(() => {});
                    }
                    if ((appType === 'HR' || appType === 'BOTH') && refetchFCMTokens?.hrFCMToken) {
                        _FCM_SENDER(senderToken, refetchFCMTokens.hrFCMToken, noteMsg).catch(() => {});
                    }
                }

                await refreshAndReset();

            } else {
                const friendly = formatUserFriendlyError(response?.message || 'Failed', 'Operation failed');
                Alert.alert('Error', friendly);
            }
        } catch (e) {
            const friendly = formatUserFriendlyError(e, 'Confirmation failed. Please try again.');
            showMessage({ message: 'Failed', description: friendly, type: 'danger', duration: 4500 });
        } finally {
            setIsSubmitting(false);
        }
    }, [requestReachedOut, formState.isKmEntryEnabled, formState.reached_km, formState.vechileno, onStopTracking, refreshAndReset, refetchFCMTokens, UserSelect, setIsSubmitting]);

    return { handleSubmitIN, handleSubmitOUT, handleReached };
}
