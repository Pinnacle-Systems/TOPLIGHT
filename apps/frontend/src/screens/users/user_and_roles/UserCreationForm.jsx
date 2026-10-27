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
} from "../../../store/api/UserApi";
import { useGet_all_roleQuery } from "../../../store/api/RoleOnApi";
import { useDelete_CommonMutation, useUpdate_CommonMutation } from '../../../store/api/CommonMastersApi';

import { Dropdown } from "../../../components/reusable_components/Inputs";
import FloatingButton from "../../../components/buttons/Buttons";
import ClearState from "../../../components/utils/ClearState";
import ProgressPopup from "../../../components/utils/PopupLoading";
import CheckboxGroup from "../../../components/check_boxes/GroupCheckBox";
import RoleLevelSelector from "./RoleLevelSelector";
import { useAppTheme } from "../../../theme";

export default function UserCreationForm({ onClose, userDet }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const UserSelect = useSelector((state) => state?.UserDetails);
    const [selectedKey, setSelectedKey] = useState(null);
    const [username, setUserName] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
    const [searchQuery, setSearchQuery] = useState("");

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

    // Helper to extract employee name from employee option/value
    const extractEmpName = useCallback((emp) => {
        if (!emp) return '';
        if (typeof emp === 'object') {
            if (emp.empName) return String(emp.empName).trim();
            if (emp.EMPNAME) return String(emp.EMPNAME).trim();
            if (emp.FNAME) return String(emp.FNAME).trim();
            if (emp.value) {
                const match = String(emp.value).match(/\(([^()]+)\)$/);
                if (match && match[1]) return match[1].trim();
            }
        } else if (typeof emp === 'string') {
            const match = emp.match(/\(([^()]+)\)$/);
            if (match && match[1]) return match[1].trim();
            const parts = emp.split('-');
            if (parts.length > 1 && isNaN(parts[0])) return parts[0].trim();
        }
        return '';
    }, []);

    // Find the currently selected employee object
    const selectedEmployeeObj = useMemo(() => {
        if (!selectedEmply || !employee?.data) return null;
        return employee.data.find(emp => {
            const idStr = String(emp.id || '');
            return idStr === selectedEmply || emp.value === selectedEmply || idStr.endsWith(`-${selectedEmply}`);
        });
    }, [selectedEmply, employee?.data]);

    // Auto-populate username when employee is chosen in creation mode
    useEffect(() => {
        if (isEditing || !selectedEmply) return;
        const name = extractEmpName(selectedEmployeeObj) || extractEmpName(selectedEmply);
        if (name) {
            setUserName(name);
        }
        // Also auto-select company if currently unselected and available
        if (selectedEmployeeObj?.COMPCODE && (!selectedCompany || (Array.isArray(selectedCompany) && selectedCompany.length === 0))) {
            setSelectedCompany([selectedEmployeeObj.COMPCODE]);
        }
    }, [selectedEmply, selectedEmployeeObj, isEditing, extractEmpName]);

    // Helper to get employee name for any user item (e.g., in table)
    const getEmployeeName = useCallback((userItem) => {
        if (!userItem) return '';
        if (userItem.empName) return String(userItem.empName).trim();
        if (userItem.employeeName) return String(userItem.employeeName).trim();
        if (!employee?.data) return '';
        const rawId = String(userItem.idCard || userItem.Idcard || '').trim();
        if (!rawId) return '';
        const found = employee.data.find(emp => {
            const empIdStr = String(emp.id || '');
            const idPart = empIdStr.includes('-') ? empIdStr.split('-')[1] : empIdStr;
            return idPart === rawId || empIdStr === rawId || String(emp.idCard || emp.IDCARD || '') === rawId;
        });
        return extractEmpName(found);
    }, [employee?.data, extractEmpName]);

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

    const handleClearForm = () => {
        setIsEditing(false);
        setCurrentUserId(null);
        ClearState(setUserName, setPassword, setEmail, setSelectedCompany, setSelectedEmply, setSelectedRole, setSelectedHod);
        setSelectedKey(null);
        setSelectedHR('');
        setOtpEmailInp('');
        setOtpEmail(false);
        setSelectedLevel("user");
        setLoadingMessage("");
    };

    const handleSubmitCustom = async (callback, data) => {
        try {
            setLoadingMessage(isEditing ? "Updating User..." : "Creating User...");
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
                handleClearForm();
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

        if (selectLevel !== "admin" && selectLevel !== "top") {
            if (!selectedEmply) {
                return Alert.alert("Warning", "Please Select Your Employee");
            }
            if (!username) {
                return Alert.alert("Warning", "Please Enter Your Username");
            }
            if (selectedKey === "HOD" || selectedKey === "BOTH") {
                if (!selectedHod) {
                    return Alert.alert("Warning", "Please Select Your HOD");
                }
            }
            if (selectedKey === "HR" || selectedKey === "BOTH") {
                if (!selectedHR) {
                    return Alert.alert("Warning", "Please Select Your HR");
                }
            }
        }

        const company_code = Array.isArray(selectedCompany)
            ? selectedCompany.map((data) => {
                const companyId = companyCode?.data?.find((cdata) => cdata?.value === data);
                const compIdStr = String(companyId?.COMPID || companyId?.companyId || companyId?.id || data || '0');
                return {
                    companyCode: data,
                    companyId: compIdStr,
                    companyid: compIdStr,
                    GCOMP: UserSelect?.GCOMPCODE,
                    gComp: UserSelect?.GCOMPCODE
                };
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
            setUserName(item.username || item.userName || '');
            setEmail(item.gmail || item.email || '');
            setOtpEmailInp(item?.otpemail || item?.otpEmail || '');

            const comp = item?.role?.COMPCODE || item?.role?.compCode || item?.companies?.[0]?.companyCode || item?.Companies?.[0]?.companyCode || '';
            setSelectedHR(item.hr ? (comp ? `${comp}-${item.hr}` : item.hr) : '');
            setSelectedRole(item.roleId);
            setSelectedLevel(item.level || 'user');
            setSelectedKey(item?.approval);

            const rawId = String(item.idCard || item.Idcard || '').trim();
            if (rawId) {
                const matchedEmp = employee?.data?.find(e => {
                    const idPart = String(e.id || '').includes('-') ? e.id.split('-')[1] : e.id;
                    return idPart === rawId || String(e.id) === rawId || String(e.idCard || e.IDCARD || '') === rawId;
                });
                if (matchedEmp) {
                    setSelectedEmply(matchedEmp.id);
                } else if (comp) {
                    setSelectedEmply(`${comp}-${rawId}`);
                } else {
                    setSelectedEmply(rawId);
                }
            } else {
                setSelectedEmply('');
            }

            setSelectedHod(item.hod ? (comp ? `${comp}-${item.hod}` : item.hod) : '');

            if (item?.companies || item?.Companies) {
                const comps = item.companies || item.Companies;
                const companyValues = comps.map(code => code.companyCode || code.companycode);
                setSelectedCompany(companyValues);
            }

            const dispName = getEmployeeName(item) || item.username || item.userName;
            showMessage({
                message: "Edit Mode",
                description: `Editing user: ${dispName}`,
                type: "info",
            });
        } catch (error) {
            showMessage({
                message: "Error",
                description: "Failed to load user data",
                type: "danger",
            });
        }
    }, [employee?.data, getEmployeeName]);

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
            setLoadingMessage("Deleting User...");
            setLoading(true);
            const response = await delete_row({
                table: 'user',
                where: { id: Number(id) },
                onlywhere: true
            }).unwrap();

            if (response.status === 1 || response.statusCode === 0) {
                showMessage({
                    message: "Success",
                    description: "User deleted successfully",
                    type: "success",
                });
                refetchUsers();
                if (currentUserId === id) {
                    handleClearForm();
                }
            } else {
                showMessage({
                    message: "Error",
                    description: response.message || "Failed to delete user",
                    type: "danger",
                });
            }
        } catch (error) {
            showMessage({
                message: "Error",
                description: error?.data?.message || error.message || "Failed to delete user",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (selectLevel !== "admin" && selectLevel !== "top") {
            if (!selectedEmply) {
                return Alert.alert("Warning", "Please Select Your Employee");
            }
            if (!username) {
                return Alert.alert("Warning", "Please Enter Your Username");
            }
            if (selectedKey === "HOD" || selectedKey === "BOTH") {
                if (!selectedHod) {
                    return Alert.alert("Warning", "Please Select Your HOD");
                }
            }
            if (selectedKey === "HR" || selectedKey === "BOTH") {
                if (!selectedHR) {
                    return Alert.alert("Warning", "Please Select Your HR");
                }
            }
        }
        try {
            setLoadingMessage("Updating User...");
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
                handleClearForm();
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

    // Filtered users for existing users table
    const filteredUsers = useMemo(() => {
        if (!tableData?.data) return [];
        if (!searchQuery.trim()) return tableData.data;
        const q = searchQuery.toLowerCase();
        return tableData.data.filter(u => {
            const empName = getEmployeeName(u) || '';
            const uName = u.username || u.userName || '';
            const roleName = u?.role?.name || '';
            const emailAddr = u.gmail || u.email || '';
            return (
                uName.toLowerCase().includes(q) ||
                empName.toLowerCase().includes(q) ||
                roleName.toLowerCase().includes(q) ||
                emailAddr.toLowerCase().includes(q)
            );
        });
    }, [tableData?.data, searchQuery, getEmployeeName]);

    return (
        <>
            {loading && (
                <ProgressPopup
                    visible={loading}
                    message={loadingMessage || (isEditing ? "Updating User..." : "Creating User...")}
                />
            )}
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>
                                {isEditing ? "Edit User" : "Create New User"}
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {isEditing
                                    ? `Update account details and role permissions`
                                    : `Configure account credentials, company, and permissions`}
                            </Text>
                        </View>
                        {onClose && (
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <MaterialIcons name="close" size={24} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Edit mode banner */}
                    {isEditing && (
                        <View style={styles.editBanner}>
                            <View style={styles.editBannerLeft}>
                                <MaterialIcons name="edit" size={18} color={theme.colors.brand} />
                                <Text style={styles.editBannerText}>
                                    Editing user: <Text style={styles.editBannerUsername}>{username || 'Selected User'}</Text>
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleClearForm} style={styles.cancelEditButton}>
                                <Text style={styles.cancelEditText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Company and Employee Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconBadge, { backgroundColor: theme.colors.brandSoft }]}>
                                <MaterialIcons name="business" size={18} color={theme.colors.brand} />
                            </View>
                            <View style={styles.sectionTitleGroup}>
                                <Text style={styles.sectionTitle}>Basic Information</Text>
                                <Text style={styles.sectionSubtitle}>Associate user with company and employee record</Text>
                            </View>
                        </View>

                        <Dropdown
                            width="100%"
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
                            width="100%"
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
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconBadge, { backgroundColor: theme.colors.secondarySoft }]}>
                                <MaterialIcons name="admin-panel-settings" size={18} color={theme.colors.secondary} />
                            </View>
                            <View style={styles.sectionTitleGroup}>
                                <Text style={styles.sectionTitle}>User Role & Permissions</Text>
                                <Text style={styles.sectionSubtitle}>Define system access tier and approval authority</Text>
                            </View>
                        </View>

                        <RoleLevelSelector
                            selected={selectLevel}
                            setSelected={setSelectedLevel}
                        />

                        <Dropdown
                            width="100%"
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
                                width="100%"
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
                                width="100%"
                                selected={selectedHR}
                                label="Select HR"
                                placeholder="Choose an HR"
                                setSelected={setSelectedHR}
                                options={employee}
                                zIndex={100}
                                style={styles.dropdown}
                            />
                        )}

                        <View style={styles.approvalSection}>
                            <View style={styles.approvalHeaderRow}>
                                <MaterialIcons name="approval" size={16} color={theme.colors.brand} />
                                <Text style={styles.approvalLabel}>Approval Request To</Text>
                            </View>
                            <CheckboxGroup
                                selectedKey={selectedKey}
                                setSelectedKey={setSelectedKey}
                                options={["HOD", "HR", "BOTH"]}
                            />
                        </View>
                    </View>

                    {/* Login Credentials */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconBadge, { backgroundColor: theme.colors.warningSoft }]}>
                                <MaterialIcons name="lock" size={18} color={theme.colors.warning} />
                            </View>
                            <View style={styles.sectionTitleGroup}>
                                <Text style={styles.sectionTitle}>Login Credentials</Text>
                                <Text style={styles.sectionSubtitle}>Authentication details for application sign-in</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Username *</Text>
                                {selectedEmply && username ? (
                                    <View style={styles.autoFilledBadge}>
                                        <MaterialIcons name="check-circle" size={13} color={theme.colors.success || '#2E7D32'} />
                                        <Text style={styles.autoFilledText}>Auto-filled from employee</Text>
                                    </View>
                                ) : null}
                            </View>
                            <View style={styles.inputWithIconContainer}>
                                <MaterialIcons name="person-outline" size={20} color={theme.colors.textMuted} style={styles.inputLeadingIcon} />
                                <TextInput
                                    value={username}
                                    onChangeText={setUserName}
                                    style={styles.inputWithIcon}
                                    placeholder={selectedEmply ? "Username auto-filled from employee" : "Enter username"}
                                    placeholderTextColor={theme.colors.placeholder}
                                    autoCapitalize="none"
                                />
                                {username ? (
                                    <TouchableOpacity onPress={() => setUserName("")} style={styles.inputClearButton}>
                                        <MaterialIcons name="close" size={16} color={theme.colors.textMuted} />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password *</Text>
                            <View style={styles.inputWithIconContainer}>
                                <MaterialIcons name="lock-outline" size={20} color={theme.colors.textMuted} style={styles.inputLeadingIcon} />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    style={[styles.inputWithIcon, { paddingRight: 44 }]}
                                    secureTextEntry={!showPassword}
                                    placeholder="Enter password"
                                    placeholderTextColor={theme.colors.placeholder}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons
                                        name={showPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color={theme.colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Email Settings */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconBadge, { backgroundColor: theme.colors.infoSoft }]}>
                                <MaterialIcons name="alternate-email" size={18} color={theme.colors.info} />
                            </View>
                            <View style={styles.sectionTitleGroup}>
                                <Text style={styles.sectionTitle}>Email Settings</Text>
                                <Text style={styles.sectionSubtitle}>Email address for alerts, reports, and OTP verification</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Primary Email</Text>
                            <View style={styles.inputWithIconContainer}>
                                <MaterialIcons name="mail-outline" size={20} color={theme.colors.textMuted} style={styles.inputLeadingIcon} />
                                <TextInput
                                    value={email}
                                    onChangeText={(e) => {
                                        if (!isotpEmail) setOtpEmailInp(e);
                                        setEmail(e);
                                    }}
                                    style={styles.inputWithIcon}
                                    placeholder="Enter email address"
                                    placeholderTextColor={theme.colors.placeholder}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
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
                                    activeOpacity={0.7}
                                >
                                    <Checkbox
                                        status={isotpEmail ? 'checked' : 'unchecked'}
                                        color={theme.colors.brand}
                                    />
                                    <Text style={styles.checkboxLabel}>Different from Email</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.inputWithIconContainer, !isotpEmail && styles.disabledInputContainer]}>
                                <MaterialIcons name="verified-user" size={20} color={isotpEmail ? theme.colors.textMuted : theme.colors.disabledText} style={styles.inputLeadingIcon} />
                                <TextInput
                                    value={otpEmail}
                                    onChangeText={setOtpEmailInp}
                                    style={[styles.inputWithIcon, !isotpEmail && styles.disabledInput]}
                                    placeholder={isotpEmail ? "Enter OTP verification email" : "Uses primary email"}
                                    placeholderTextColor={theme.colors.placeholder}
                                    keyboardType="email-address"
                                    editable={isotpEmail}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Form Action Buttons Bar */}
                    <View style={styles.actionButtonBar}>
                        <TouchableOpacity
                            style={styles.primaryActionButton}
                            onPress={isEditing ? handleUpdate : handleSubmit}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons
                                name={isEditing ? "check" : "person-add"}
                                size={20}
                                color={theme.colors.brandContrast}
                            />
                            <Text style={styles.primaryActionText}>
                                {isEditing ? "Update User" : "Save User"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryActionButton}
                            onPress={handleClearForm}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="refresh" size={18} color={theme.colors.textSecondary} />
                            <Text style={styles.secondaryActionText}>
                                {isEditing ? "Cancel" : "Reset Form"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Existing Users Table */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconBadge, { backgroundColor: theme.colors.brandSoft }]}>
                                <MaterialIcons name="people" size={18} color={theme.colors.brand} />
                            </View>
                            <View style={styles.sectionTitleGroup}>
                                <Text style={styles.sectionTitle}>Existing Users</Text>
                                <Text style={styles.sectionSubtitle}>
                                    {tableData?.data ? `${tableData.data.length} registered system users` : "Registered system users"}
                                </Text>
                            </View>
                        </View>

                        {/* Search Filter */}
                        <View style={styles.tableSearchContainer}>
                            <MaterialIcons name="search" size={20} color={theme.colors.textMuted} style={styles.tableSearchIcon} />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search by name, role, email..."
                                placeholderTextColor={theme.colors.placeholder}
                                style={styles.tableSearchInput}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.tableSearchClear}>
                                    <MaterialIcons name="close" size={18} color={theme.colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>#</Text>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Username</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.8 }]}>Role</Text>
                                <Text style={[styles.tableHeaderText, { flex: 2.2 }]}>Email</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.6 }]}>Actions</Text>
                            </View>

                            {filteredUsers && filteredUsers.length > 0 ? (
                                filteredUsers.map((item, index) => (
                                    <View
                                        key={item.id || index}
                                        style={[
                                            styles.tableRow,
                                            index % 2 === 0 ? styles.evenRow : styles.oddRow,
                                            currentUserId === item.id && styles.editingRow
                                        ]}
                                    >
                                        <Text style={[styles.tableCell, { flex: 0.6, fontWeight: '600' }]}>{index + 1}</Text>
                                        <View style={[styles.tableCell, { flex: 2, alignItems: 'flex-start' }]}>
                                            <Text style={styles.usernameCellText} numberOfLines={1}>
                                                {getEmployeeName(item) || item.username || item.userName || "-"}
                                            </Text>
                                            <View style={styles.userMetaRow}>
                                                {(item.username || item.userName) && getEmployeeName(item) && getEmployeeName(item) !== (item.username || item.userName) ? (
                                                    <Text style={styles.subUsernameText} numberOfLines={1}>
                                                        @{item.username || item.userName}
                                                    </Text>
                                                ) : null}
                                                {item.level && (
                                                    <Text style={styles.levelBadgeText}>
                                                        {item.level.toUpperCase()}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={[styles.tableCell, { flex: 1.8 }]}>
                                            <Text style={styles.roleCellText} numberOfLines={1}>
                                                {item?.role?.name || "-"}
                                            </Text>
                                        </View>
                                        <Text style={[styles.tableCell, styles.emailCellText, { flex: 2.2 }]} numberOfLines={1}>
                                            {item.gmail || "-"}
                                        </Text>
                                        <View style={[styles.tableCell, { flex: 1.6, flexDirection: 'row', justifyContent: 'center' }]}>
                                            <TouchableOpacity
                                                onPress={() => editData(item)}
                                                style={styles.actionButtonEdit}
                                                activeOpacity={0.7}
                                            >
                                                <MaterialIcons name="edit" size={16} color={theme.colors.brand} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => onDelete(item.id)}
                                                style={styles.actionButtonDelete}
                                                activeOpacity={0.7}
                                            >
                                                <MaterialIcons name="delete-outline" size={16} color={theme.colors.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <MaterialIcons name="search-off" size={32} color={theme.colors.textDisabled} />
                                    <Text style={styles.noDataText}>
                                        {searchQuery ? "No matching users found" : "No users available"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <FloatingButton
                    type="user"
                    save={isEditing ? handleUpdate : handleSubmit}
                    edit={editData}
                    Update={handleUpdate}
                    editable={isEditing}
                    New={handleClearForm}
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
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        ...theme.typography.h3,
        fontSize: 22,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    closeButton: {
        padding: 6,
        borderRadius: theme.radii.sm,
        backgroundColor: theme.colors.surfaceSunken,
    },
    editBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surfaceSelected,
        borderColor: theme.colors.brand,
        borderWidth: 1,
        borderRadius: theme.radii.md,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    editBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    editBannerText: {
        ...theme.typography.bodySmall,
        fontSize: 13,
        color: theme.colors.text,
        marginLeft: 8,
    },
    editBannerUsername: {
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    cancelEditButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radii.sm,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    cancelEditText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textSecondary,
    },
    section: {
        ...theme.styles.card,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        elevation: 1,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.3 : 0.06,
        shadowRadius: 6,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    sectionIconBadge: {
        width: 32,
        height: 32,
        borderRadius: theme.radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    sectionTitleGroup: {
        flex: 1,
    },
    sectionTitle: {
        ...theme.typography.title,
        fontSize: 15,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
    },
    sectionSubtitle: {
        ...theme.typography.caption,
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    dropdown: {
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    approvalSection: {
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.sm,
    },
    approvalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    approvalLabel: {
        ...theme.typography.label,
        fontSize: 13,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textSecondary,
        marginLeft: 6,
    },
    inputGroup: {
        marginBottom: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    autoFilledBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.successSoft || '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: theme.radii.full || 12,
    },
    autoFilledText: {
        fontSize: 11,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.success || '#2E7D32',
        marginLeft: 4,
    },
    inputClearButton: {
        padding: 4,
        marginLeft: 4,
    },
    label: {
        ...theme.typography.label,
        fontSize: 13,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    inputWithIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.inputBackground,
        paddingHorizontal: 12,
        position: 'relative',
    },
    disabledInputContainer: {
        backgroundColor: theme.colors.disabledBackground,
        borderColor: theme.colors.borderSubtle,
    },
    inputLeadingIcon: {
        marginRight: 8,
    },
    inputWithIcon: {
        flex: 1,
        height: '100%',
        ...theme.typography.bodySmall,
        fontSize: 14,
        color: theme.colors.text,
        paddingVertical: 0,
    },
    disabledInput: {
        color: theme.colors.disabledText,
    },
    passwordToggle: {
        position: 'absolute',
        right: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 12,
        color: theme.colors.textMuted,
        marginLeft: 2,
    },
    actionButtonBar: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: theme.spacing.lg,
    },
    primaryActionButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.brand,
        height: 48,
        borderRadius: theme.radii.md,
        elevation: 2,
        shadowColor: theme.colors.brand,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    primaryActionText: {
        ...theme.typography.button,
        color: theme.colors.brandContrast,
        fontWeight: theme.fontWeights.bold,
        fontSize: 14,
        marginLeft: 8,
    },
    secondaryActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        height: 48,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    secondaryActionText: {
        ...theme.typography.button,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeights.semiBold,
        fontSize: 13,
        marginLeft: 6,
    },
    tableSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 42,
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    tableSearchIcon: {
        marginRight: 8,
    },
    tableSearchInput: {
        flex: 1,
        height: '100%',
        ...theme.typography.bodySmall,
        fontSize: 13,
        color: theme.colors.text,
        paddingVertical: 0,
    },
    tableSearchClear: {
        padding: 4,
    },
    tableContainer: {
        borderRadius: theme.radii.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.divider,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme.colors.brand,
        paddingVertical: 11,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    tableHeaderText: {
        fontWeight: '700',
        color: theme.colors.brandContrast,
        textAlign: 'center',
        ...theme.typography.caption,
        fontSize: 12,
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
    editingRow: {
        backgroundColor: theme.colors.surfaceSelected,
        borderColor: theme.colors.brandSoft,
    },
    tableCell: {
        textAlign: 'center',
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    usernameCellText: {
        fontSize: 12,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.text,
    },
    userMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 2,
    },
    subUsernameText: {
        fontSize: 10,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.medium,
    },
    levelBadgeText: {
        fontSize: 9,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    roleCellText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    emailCellText: {
        fontSize: 11,
        color: theme.colors.textMuted,
    },
    actionButtonEdit: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: theme.colors.brandSoft,
        marginRight: 6,
    },
    actionButtonDelete: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: theme.colors.dangerSoft,
    },
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 6,
        ...theme.typography.bodySmall,
        color: theme.colors.textDisabled,
    },
});
