import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { leave_Meta } from '../../redux/States/Transactions/Leave_meta';
import InputWraper from './InputWraper';
import { useDispatch, useSelector } from 'react-redux';
import { useGet__per_categoryQuery, } from '../../redux/service/permission';
import { setInput } from '../../redux/Slices/inputsHandler';
import { formattedDate } from '../Utils/FormatedDate';
import { parseDateStringToISO } from '../Utils/FormateToISO';
import { showMessage } from 'react-native-flash-message';
import socket from '../Utils/Socket';
import { useGet_hod_tokenQuery, useGet_refresh_tokenQuery } from '../../redux/service/user';
import { _FCM_SENDER } from '../Utils/FCM';
import { screenWidth } from '../Utils/Screens';
import {
    useAdd_requestLeaveMutation,
    useGet_LcodeQuery,
    useLazyGet_lcode_leave_availableQuery,
    useGetCurrent_FinYearQuery,
    useGetDocIDQuery
} from '../../redux/service/Leave';
import { calculateDateDifference } from '../Utils/Date_Differnet';

const LeaveEntry = () => {
    const InputState = useSelector((state) => state?.Input?.Leave_state);
    const UserSelect = useSelector((state) => state?.UserDetails);
    const dispatch = useDispatch();

    const { data: ref_token, isError: ref_token_error } = useGet_refresh_tokenQuery();
    const { data: get_per_category } = useGet__per_categoryQuery({ type: "leave" });
    const { data: get_fin_year } = useGetCurrent_FinYearQuery();
    const { data: get_Leave_Code } = useGet_LcodeQuery();
    const { data: docData, error: docError, refetch } = useGetDocIDQuery();
    const { data: hodfcm, isError } = useGet_hod_tokenQuery({ params: { hod: UserSelect?.hod } });

    const [add_requestLeave] = useAdd_requestLeaveMutation();
    const [triggerGetLeaveAvailable, { data: leaveData }] = useLazyGet_lcode_leave_availableQuery();

    const [LBAL_data] = Array.isArray(leaveData?.data) ? leaveData?.data : [{ LBAL: 0 }];
    const { LBAL } = LBAL_data || { LBAL: 0 };

    // ✅ Fetch leave balance when userId or ltype changes
    useEffect(() => {
        if (UserSelect?.UserId) {
            triggerGetLeaveAvailable({
                Idcard: UserSelect?.UserId,
                LCODE: InputState?.ltype || undefined
            });
        }
    }, [UserSelect?.UserId, InputState?.ltype]);

    // ✅ Set docid and basic user info
    useEffect(() => {
        const num = docData?.data?.count;
        const padded = num?.toString().padStart(6, '0');
        dispatch(setInput({
            docid: `${UserSelect?.GCOMPCODE}/LEV-${padded}`,
            docdate: formattedDate,
            idcard: UserSelect?.UserId,
            empname: UserSelect?.EMPNAME,
            id: "Leave_state"
        }));
    }, [docData]);

    // ✅ Set dropdown options
    useEffect(() => {
        dispatch(setInput({
            fin_options: get_fin_year?.data,
            fltype_options: [
                { label: "Full Day", value: "Full Day" },
                { label: "1st Half", value: "1st Half" },
                { label: "2nd Half", value: "2nd Half" }
            ],
            tltype_options: [
                { label: "Full Day", value: "Full Day" },
                { label: "1st Half", value: "1st Half" },
                { label: "2nd Half", value: "2nd Half" }
            ],
            ltype_options: [
                { label: "EL", value: "EL" },
                { label: "CL", value: "CL" }
            ],
            id: "Leave_state"
        }));
    }, [get_fin_year?.data, get_Leave_Code?.data]);

    // ✅ Set category options
    useEffect(() => {
        dispatch(setInput({
            category_options: get_per_category?.data,
            id: "Leave_state"
        }));
    }, [get_per_category]);

    // ✅ Sync fltype <-> tltype only on same day
    useEffect(() => {
        if (InputState.fromDate && InputState.fromDate === InputState.toDate) {
            if (InputState.fltype && !InputState.tltype) {
                dispatch(setInput({ tltype: InputState.fltype, id: "Leave_state" }));
            } else if (InputState.tltype && !InputState.fltype) {
                dispatch(setInput({ fltype: InputState.tltype, id: "Leave_state" }));
            }
        }
    }, [InputState.fltype, InputState.tltype, InputState.fromDate, InputState.toDate]);

    // ✅ Calculate total days and validate against leave balance
    useEffect(() => {
        // Don't run if dates not selected yet
        if (!InputState?.fromDate || !InputState?.toDate) return;

        let totalDays = calculateDateDifference(InputState.fromDate, InputState.toDate);

        if (InputState.fromDate === InputState.toDate) {
            const isHalf =
                InputState.fltype === "1st Half" || InputState.fltype === "2nd Half" ||
                InputState.tltype === "1st Half" || InputState.tltype === "2nd Half";
            totalDays = isHalf ? 0.5 : 1;
        } else {
            if (InputState.fltype === "1st Half" || InputState.fltype === "2nd Half") totalDays -= 0.5;
            if (InputState.tltype === "1st Half" || InputState.tltype === "2nd Half") totalDays -= 0.5;
        }

        totalDays = Math.max(0, totalDays);

        let isValid = true;

        // ✅ Only validate LBAL if leaveData has loaded (LBAL will be 0 before API returns)
        if (leaveData !== undefined) {
            if (LBAL === 0) {
                Alert.alert("Leave Alert", "Sorry, you don't have any leave balance");
                isValid = false;
            } else if (totalDays > LBAL) {
                Alert.alert("Leave Alert", `You can only take ${LBAL} days. Selected: ${totalDays}`);
                isValid = false;
            }
        }

        if (totalDays <= 0) isValid = false;

        dispatch(setInput({
            save: isValid,
            totalDays: String(totalDays),
            id: "Leave_state"
        }));

    }, [InputState.fromDate, InputState.toDate, InputState.fltype, InputState.tltype, LBAL, leaveData]);

    const handleSubmit = async () => {
        const {
            fromDate, toDate, totalDays, reason,
            docid, category, fltype, tltype,
            ltype, finyear, empname
        } = InputState;

        // ── Refetch fresh doc ID instantly to prevent sequence race conditions ──
        const latestDocQuery = await refetch();
        const latestCount = latestDocQuery?.data?.data?.count || docData?.data?.count || 0;
        let finalDocid = docid || 'DOC_ID';
        if (latestCount) {
             const paddedCount = latestCount.toString().padStart(6, '0');
             finalDocid = `${UserSelect?.GCOMPCODE}/LEV-${paddedCount}`;
        }

        const payload = {
            userId: UserSelect?.UserId,
            docDate: new Date(parseDateStringToISO(InputState.docdate)),
            fromDate: new Date(parseDateStringToISO(fromDate)),
            toDate: new Date(parseDateStringToISO(toDate)),
            totalDays: parseFloat(totalDays),
            reason,
            docid: finalDocid,
            compCode: UserSelect?.GCOMPCODE,
            createdBy: UserSelect?.UserId,
            modified_By: UserSelect?.UserId,
            hod: String(UserSelect?.hod),
            mobile: String(UserSelect?.MOBNO),
            fltype, tltype, ltype, finyear, empname, category,
            hr: String(UserSelect?.hr)
        };

        try {
            const leaveResponse = await add_requestLeave({
                data: payload,
                params: {
                    docCount: Number(latestCount),
                    PAYCAT: UserSelect?.PAYCAT
                }
            }).unwrap();

            if (leaveResponse?.status === 1) {
                // ✅ Success
                showMessage({
                    message: "Leave Request",
                    description: "Leave request sent successfully",
                    type: "success",
                });

                dispatch(setInput({
                    fromDate: "", toDate: "", totalDays: "",
                    category: "", reason: "", ltype: "",
                    fltype: "", tltype: "", id: "Leave_state"
                }));

                socket.emit("leave_request", {
                    hod: UserSelect?.hod,
                    compcode: UserSelect?.GCOMPCODE,
                    userdata: {
                        email: "",
                        username: UserSelect?.userName,
                        Idcard: UserSelect?.UserId,
                        mobile: UserSelect?.MOBNO
                    },
                    ...leaveResponse?.data
                });

                // ✅ FCM only on success, separate try-catch
                try {
                    await _FCM_SENDER(
                        ref_token?.data?.token,
                        hodfcm?.data?.fcm,
                        "Request By : " + UserSelect?.EMPNAME
                    );
                } catch (fcmError) {
                    // FCM failure should NOT block the user flow
                    console.warn("FCM notification failed:", fcmError);
                }

            } else if (leaveResponse?.status === 500) {
                // ✅ Server-side known error
                const errMeta = leaveResponse?.error?.meta?.field_name;
                if (errMeta === "hod") {
                    Alert.alert("Error", "HOD User Not Found");
                } else {
                    Alert.alert("Error", "Server error occurred. Please try again.");
                }
            } else {
                // ✅ General failure
                showMessage({
                    message: "Leave Request",
                    description: leaveResponse?.message || "Leave request failed",
                    type: "danger",
                });
            }

        } catch (error) {
            // ✅ Network / unexpected errors
            console.error("Leave submit error:", error);
            Alert.alert(
                "Submission Failed",
                error?.data?.message || error?.message || "An unexpected error occurred"
            );
        } finally {
            await refetch(); // ✅ Always refetch docId after attempt
        }
    };

    // ✅ Show error screen only if critical queries fail
    if (docError || isError || ref_token_error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: "red" }}>Something Went Wrong! Please restart the app.</Text>
            </View>
        );
    }

    const isSubmitDisabled =
        !InputState?.save ||
        !InputState?.fromDate ||
        !InputState?.toDate ||
        !InputState?.category ||
        !InputState?.reason;

    const buttonLabel = !InputState?.fromDate || !InputState?.toDate
        ? "Select Dates"
        : !InputState?.category || !InputState?.reason
            ? "Fill Required Fields"
            : !InputState?.save
                ? `Limit Exceeded (Max: ${LBAL})`
                : "Request Leave";

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Leave Entry</Text>
            <View style={styles.formContainer}>
                <InputWraper states={leave_Meta} />
                <TouchableOpacity
                    style={isSubmitDisabled ? styles.submitButton_disbled : styles.submitButton}
                    disabled={isSubmitDisabled}
                    onPress={handleSubmit}
                >
                    <Text style={isSubmitDisabled ? styles.disabledButtonText : styles.submitButtonText}>
                        {buttonLabel}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#f9f9f9' },
    header: { fontSize: 22, fontWeight: '600', color: '#333', textAlign: 'center', marginVertical: 20 },
    formContainer: { paddingHorizontal: 5, paddingBottom: 80 },
    submitButton_disbled: {
        backgroundColor: "#dbdbd9", paddingVertical: 14, borderRadius: 10,
        alignItems: 'center', marginTop: 24, alignSelf: 'center',
        width: screenWidth - 50, elevation: 3,
    },
    submitButton: {
        backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10,
        alignItems: 'center', marginTop: 24, alignSelf: 'center',
        width: screenWidth - 50, elevation: 3,
    },
    submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
    disabledButtonText: { color: 'red', fontSize: 13, fontWeight: '600' },
});

export default LeaveEntry;