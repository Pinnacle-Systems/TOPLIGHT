import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import { useAppTheme } from "../../../theme";

export default function UserCreationForm({ onClose, userDet }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
                                <MaterialIcons name="close" size={24} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Company and Employee Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <Dropdown
                            selected={selectedCompany}
                            label="Select Company"
                            placeholder="Choose a company"
                            multiple={true}
                            setSelected={setSelectedCompany}
                            options={companyCode}
                            zIndex={300}
                            style={styles.dropdown}
                        />

                        <Dropdown
                            selected={selectedEmply}
                            label="Select Employee"
                            placeholder="Choose an employee"
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
                            placeholder="Choose a pages role"
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
                                placeholder="Choose an HOD"
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
                                placeholder="Choose an HR"
                                setSelected={setSelectedHR}
                                options={employee}
                                zIndex={100}
                                style={styles.dropdown}
                            />
                        )}

                        <Text style={styles.approvalLabel}>Approval Request To</Text>
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
                                placeholderTextColor={theme.colors.placeholder}
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
                                placeholderTextColor={theme.colors.placeholder}
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
                                placeholderTextColor={theme.colors.placeholder}
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
                                        color={theme.colors.brand}
                                    />
                                    <Text style={styles.checkboxLabel}>Different from Email</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                value={otpEmail}
                                onChangeText={setOtpEmailInp}
                                style={[styles.input, !isotpEmail && styles.disabledInput]}
                                placeholder="Enter OTP email"
                                placeholderTextColor={theme.colors.placeholder}
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
                                            <MaterialIcons name="edit" size={18} color={theme.colors.brand} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => onDelete(item.id)}
                                            style={[styles.actionButton, { marginLeft: 8 }]}
                                        >
                                            <MaterialIcons name="delete" size={18} color={theme.colors.danger} />
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

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContainer: {
        padding: theme.layout.screenGutter,
        paddingBottom: 110,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    closeButton: {
        padding: 6,
    },
    section: {
        ...theme.styles.card,
        ...theme.styles.shadow,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    sectionTitle: {
        ...theme.typography.title,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        paddingBottom: theme.spacing.sm,
    },
    dropdown: {
        marginBottom: theme.spacing.md + 2,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    approvalLabel: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        ...theme.typography.bodySmall,
        backgroundColor: theme.colors.inputBackground,
        color: theme.colors.text,
    },
    disabledInput: {
        backgroundColor: theme.colors.disabledBackground,
        color: theme.colors.disabledText,
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
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginLeft: theme.spacing.xs,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme.colors.brand,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableHeaderText: {
        fontWeight: '700',
        color: theme.colors.brandContrast,
        textAlign: 'center',
        ...theme.typography.caption,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: theme.colors.divider,
        alignItems: 'center',
    },
    evenRow: {
        backgroundColor: theme.colors.surface,
    },
    oddRow: {
        backgroundColor: theme.colors.backgroundSubtle,
    },
    tableCell: {
        textAlign: 'center',
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    noDataText: {
        textAlign: 'center',
        padding: 20,
        ...theme.typography.bodySmall,
        color: theme.colors.textDisabled,
    },
    actionButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceSunken,
    },
});
