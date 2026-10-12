import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { showMessage } from 'react-native-flash-message';
import { useSelector } from "react-redux";
import { Checkbox } from "react-native-paper";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { 
    useCreateUserMutation, 
    useGetCompanycodeQuery, 
    useGetEmployeeidsQuery, 
    useGetUsersQuery 
} from "../../../store/api/userApi";
import { useGet_all_roleQuery } from "../../../store/api/RoleOnApi";
import { useDelete_CommonMutation, useUpdate_CommonMutation } from '../../../store/api/commonMastersApi';

import { Dropdown } from "../../../components/ReusableComponents/inputs";
import FloatingButton from "../../../components/Buttons/Buttons";
import ClearState from "../../../components/Utils/ClearState";
import ProgressPopup from "../../../components/Utils/PopupLoading";
import CheckboxGroup from "../../../components/CheckBoxes/GroupCheckBox";
import RoleLevelSelector from "./RoleLevelSelector";

export default function UserCreationForm({ onClose, userDet }) {
    const UserSelect = useSelector((state) => state?.UserDetails);
    const [selectedKey, setSelectedKey] = useState(null);
    const [username, setUserName] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [isotpEmail, setOtpEmail] = useState(false);
    const [otpEmail, setOtpEmailInp] = useState("");

    const [selectedEmply, setSelectedEmply] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedHod, setSelectedHod] = useState('');
    const [selectedHR, setSelectedHR] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectLevel, setSelectedLevel] = useState("user");
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [createUser] = useCreateUserMutation();
    const { data: tableData, refetch: refetchUsers } = useGetUsersQuery();
    const [delete_row] = useDelete_CommonMutation();
    const [update_row] = useUpdate_CommonMutation();

    const { data: all_Role_names } = useGet_all_roleQuery({
        feilds: "COMPCODE",
        where: selectedCompany
    });
    const { data: companyCode } = useGetCompanycodeQuery();
    const { data: employee } = useGetEmployeeidsQuery();

    useEffect(() => {
        if (userDet) {
            editData(userDet);
        }
    }, [userDet]);

    useEffect(() => {
        setIsEditing(false);
    }, []);

    const validateData = (data) => {
        return !!(data.username && data.password);
    };

    const handleSubmitCustom = async (callback, data) => {
        try {
            setLoading(true);
            const response = await callback(data).unwrap();

            if (response.statusCode === 1 || response.status === 0) {
                showMessage({
                    message: "User Creation",
                    description: response.message || "User already exists or creation failed",
                    type: "danger",
                });
            } else {
                showMessage({
                    message: "Success",
                    description: "User created successfully",
                    type: "success",
                });
                ClearState(setUserName, setPassword, setEmail, setSelectedCompany, setSelectedEmply, setSelectedRole, setSelectedHod);
                refetchUsers();
                if (onClose) onClose();
            }
        } catch (error) {
            showMessage({
                message: "Error",
                description: error.data?.message || error.message || "Operation failed",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const idCard = selectedEmply?.split("-")[1];
        const hod = selectedHod?.split("-")[1];
        const hr = selectedHR?.split("-")[1];

        if (selectLevel !== "admin" && selectLevel !== "top" && (!selectedEmply || !selectedHod || !username)) {
            return Alert.alert(
                "Warning",
                !selectedEmply ? "Please Select Your Employee" : !username ? "Please Enter Your Username" : "Please Select Your HOD"
            );
        }

        const company_code = Array.isArray(selectedCompany) 
            ? selectedCompany.map((data) => {
                const companyId = companyCode?.data?.find((cdata) => cdata?.value === data);
                return { companyCode: data, companyid: String(companyId?.COMPID), GCOMP: UserSelect?.GCOMPCODE };
            }) 
            : [];

        const idCardRandom = String(Date.now() + Math.floor(Math.random() * 10000));
        const isAdmin = selectLevel === "top" || selectLevel === "admin";

        const formData = {
            username,
            approval: selectedKey,
            roleId: selectedRole,
            otpemail: otpEmail,
            hr,
            password,
            email,
            hod,
            Idcard: isAdmin ? idCardRandom : idCard,
            Compcodes: company_code,
            level: selectLevel,
            isAdmin,
        };

        if (!validateData(formData)) {
            Toast.show({
                type: "info",
                text1: "Please fill all required fields",
            });
            return;
        }

        Alert.alert(
            "Confirmation",
            "Are you sure you want to save the user details?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => handleSubmitCustom(createUser, formData) },
            ],
            { cancelable: false }
        );
    };

    const editData = useCallback(async (item) => {
        try {
            setIsEditing(true);
            setCurrentUserId(item.id);
            setUserName(item.username || '');
            setEmail(item.gmail || '');
            setOtpEmailInp(item?.otpemail || '');
            setSelectedHR(item?.role?.COMPCODE ? `${item.role.COMPCODE}-${item.hr}` : '');
            setSelectedRole(item.roleId);
            setSelectedLevel(item.level || 'user');
            setSelectedKey(item?.approval);
            setSelectedEmply(item?.role?.COMPCODE ? `${item.role.COMPCODE}-${item.Idcard}` : '');
            setSelectedHod(item?.role?.COMPCODE ? `${item.role.COMPCODE}-${item.hod}` : '');

            if (item?.Companies) {
                const companyValues = item.Companies.map(code => code.companyCode);
                setSelectedCompany(companyValues);
            }

            showMessage({
                message: "Edit Mode",
                description: `Editing user: ${item.username}`,
                type: "info",
            });
        } catch (error) {
            showMessage({
                message: "Error",
                description: "Failed to load user data",
                type: "danger",
            });
        }
    }, []);

    const onDelete = (id) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to delete this user?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => handleDelete(id) }
            ]
        );
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const response = await delete_row({
                table: 'user',
                where: { id: id, GCOMP: UserSelect?.GCOMPCODE },
                onlywhere: true
            }).unwrap();

            if (response.status === 1) {
                showMessage({
                    message: "Success",
                    description: "User deleted successfully",
                    type: "success",
                });
                refetchUsers();
            }
        } catch (error) {
            showMessage({
                message: "Error",
                description: "Failed to delete user",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const company_code = Array.isArray(selectedCompany)
                ? selectedCompany.map((data) => {
                    const companyId = companyCode?.data?.find((cdata) => cdata?.value === data);
                    return { companyCode: data, companyid: String(companyId?.COMPID), GCOMP: UserSelect?.GCOMPCODE };
                })
                : [];

            const idCard = selectedEmply?.split("-")[1];
            const hod = selectedHod?.split("-")[1];
            const hr = selectedHR?.split("-")[1];
            const idCardRandom = String(Date.now() + Math.floor(Math.random() * 10000));
            const isAdmin = selectLevel === "top" || selectLevel === "admin";

            const formData = {
                Compcodes: company_code,
                GCOMP: UserSelect?.GCOMPCODE,
                hr,
                username,
                role: {
                    connect: { name: selectedRole }
                },
                otpemail: otpEmail,
                password,
                email,
                hod,
                approval: selectedKey,
                Idcard: isAdmin ? idCardRandom : idCard,
                level: selectLevel,
                user_updation: true,
                isAdmin,
            };

            const response = await update_row({
                table: 'user',
                data: formData,
                onlywhere: true,
                where: { id: currentUserId },
            }).unwrap();

            if (response?.status === 1) {
                showMessage({
                    message: "Success",
                    description: "User updated successfully",
                    type: "success",
                });
                refetchUsers();
                ClearState(setUserName, setPassword, setEmail, setSelectedCompany, setSelectedEmply, setSelectedRole, setSelectedHod);
                setIsEditing(false);
                setCurrentUserId(null);
                if (onClose) onClose();
            }
        } catch (error) {
            showMessage({
                message: "Error",
                description: "Failed to update user",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterRole = all_Role_names?.data?.filter((data) => data?.RoleOnPage?.length > 0) || [];

    return (
        <>
            {loading && (
                <ProgressPopup
                    visible={loading}
                    message={isEditing ? "Updating User..." : "Creating User..."}
                />
            )}
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {isEditing ? "Edit User" : "Create New User"}
                        </Text>
                        {onClose && (
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <MaterialIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Company and Employee Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <Dropdown
                            selected={selectedCompany}
                            label="Select Company"
                            multiple={true}
                            setSelected={setSelectedCompany}
                            options={companyCode}
                            zIndex={300}
                            style={styles.dropdown}
                        />

                        <Dropdown
                            selected={selectedEmply}
                            label="Select Employee"
                            setSelected={setSelectedEmply}
                            options={employee}
                            zIndex={200}
                            style={styles.dropdown}
                        />
                    </View>

                    {/* User Role and Level */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>User Role & Permissions</Text>

                        <RoleLevelSelector
                            selected={selectLevel}
                            setSelected={setSelectedLevel}
                        />

                        <Dropdown
                            selected={selectedRole}
                            label="Select Pages Role"
                            setSelected={setSelectedRole}
                            _label={"name"}
                            _value={"name"}
                            options={{ data: filterRole }}
                            zIndex={300}
                            style={styles.dropdown}
                        />

                        {(selectLevel === "user" || selectLevel === "hod") && (
                            <Dropdown
                                selected={selectedHod}
                                label="Select HOD"
                                setSelected={setSelectedHod}
                                options={employee}
                                zIndex={200}
                                style={styles.dropdown}
                            />
                        )}

                        {(selectLevel === "user" || selectLevel === "hod") && (
                            <Dropdown
                                selected={selectedHR}
                                label="Select HR"
                                setSelected={setSelectedHR}
                                options={employee}
                                zIndex={100}
                                style={styles.dropdown}
                            />
                        )}

                        <Text style={[styles.label, { marginTop: 12 }]}>Approval Request To:</Text>
                        <CheckboxGroup
                            selectedKey={selectedKey}
                            setSelectedKey={setSelectedKey}
                            options={["HOD", "HR", "BOTH"]}
                        />
                    </View>

                    {/* Login Credentials */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Login Credentials</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username *</Text>
                            <TextInput
                                value={username}
                                onChangeText={setUserName}
                                style={styles.input}
                                placeholder="Enter username"
                                placeholderTextColor="#94a3b8"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password *</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                style={styles.input}
                                secureTextEntry
                                placeholder="Enter password"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Email Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Email Settings</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={(e) => {
                                    if (!isotpEmail) setOtpEmailInp(e);
                                    setEmail(e);
                                }}
                                style={styles.input}
                                placeholder="Enter email"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.otpEmailRow}>
                                <Text style={styles.label}>OTP Email</Text>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() => {
                                        if (isotpEmail) {
                                            setOtpEmailInp('');
                                        } else {
                                            setOtpEmailInp(email);
                                        }
                                        setOtpEmail(!isotpEmail);
                                    }}
                                >
                                    <Checkbox
                                        status={isotpEmail ? 'checked' : 'unchecked'}
                                        color="#3b82f6"
                                    />
                                    <Text style={styles.checkboxLabel}>Different from Email</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                value={otpEmail}
                                onChangeText={setOtpEmailInp}
                                style={[styles.input, !isotpEmail && styles.disabledInput]}
                                placeholder="Enter OTP email"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                editable={isotpEmail}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Existing Users Table */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Existing Users</Text>

                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Username</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Role</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Email</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Actions</Text>
                        </View>

                        {tableData?.data && tableData.data.length > 0 ? (
                            tableData.data.map((item, index) => (
                                <View
                                    key={item.id || index}
                                    style={[
                                        styles.tableRow,
                                        index % 2 === 0 ? styles.evenRow : styles.oddRow
                                    ]}
                                >
                                    <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.username}</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{item?.role?.name || "-"}</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.gmail || "-"}</Text>
                                    <View style={[styles.tableCell, { flex: 1.5, flexDirection: 'row', justifyContent: 'center' }]}>
                                        <TouchableOpacity
                                            onPress={() => editData(item)}
                                            style={styles.actionButton}
                                        >
                                            <MaterialIcons name="edit" size={18} color="#3b82f6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => onDelete(item.id)}
                                            style={[styles.actionButton, { marginLeft: 8 }]}
                                        >
                                            <MaterialIcons name="delete" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No users available</Text>
                        )}
                    </View>
                </ScrollView>

                <FloatingButton
                    type="user"
                    save={isEditing ? handleUpdate : handleSubmit}
                    edit={editData}
                    Update={handleUpdate}
                    editable={isEditing}
                    New={() => {
                        setIsEditing(false);
                        setCurrentUserId(null);
                        ClearState(setUserName, setPassword, setEmail, setSelectedCompany, setSelectedEmply, setSelectedRole, setSelectedHod);
                    }}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 110,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    closeButton: {
        padding: 6,
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 6,
    },
    dropdown: {
        marginBottom: 14,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        backgroundColor: '#ffffff',
        color: '#1e293b',
    },
    disabledInput: {
        backgroundColor: '#f1f5f9',
        color: '#94a3b8',
    },
    otpEmailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableHeaderText: {
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 13,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
    },
    evenRow: {
        backgroundColor: '#ffffff',
    },
    oddRow: {
        backgroundColor: '#f8fafc',
    },
    tableCell: {
        textAlign: 'center',
        fontSize: 13,
        color: '#334155',
    },
    noDataText: {
        textAlign: 'center',
        padding: 20,
        color: '#94a3b8',
        fontSize: 14,
    },
    actionButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
});
