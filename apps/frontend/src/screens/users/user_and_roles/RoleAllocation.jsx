import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { showMessage } from 'react-native-flash-message';

import { 
    useCreateRoleOnPageMutation, 
    useUpdateRoleOnPageMutation, 
    useGetCreatedRolesOnPageQuery 
} from '../../../store/api/UserApi';
import { useGet_all_roleQuery } from '../../../store/api/RoleOnApi';
import { useDelete_CommonMutation } from '../../../store/api/CommonMastersApi';
import appTabs from '../../../constants/AppTabs';

import { Dropdown } from '../../../components/reusable_components/Inputs';
import FloatingButton from '../../../components/buttons/Buttons';
import CustomDataTable from '../../../components/utils/CommonDataTable';
import { useAppTheme } from '../../../theme';

export default function RoleAllocation() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [permissions, setPermissions] = useState({});
    const [roleName, setRoleName] = useState(null);
    const [username, setUsername] = useState(null);
    const [edit, setEdit] = useState(false);
    const [currentEditingId, setCurrentEditingId] = useState();
    const [disabled, setDisabled] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const { data: get_created_roles, refetch: userRefetch } = useGetCreatedRolesOnPageQuery();
    const { data: all_Role_names, refetch: refetchCreatedRoles } = useGet_all_roleQuery();
    const [createUserOnRole] = useCreateRoleOnPageMutation();
    const [updateUserOnRole] = useUpdateRoleOnPageMutation();
    const [delete_row] = useDelete_CommonMutation();

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([userRefetch(), refetchCreatedRoles()]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userName');
                if (storedUser) {
                    setUsername(JSON.parse(storedUser)?.userName);
                }
            } catch (err) {
                console.error("Error fetching username from storage:", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const deletedfun = async (id) => {
        try {
            const delete_Data = await delete_row({ table: 'role', where: { id: id.id } });
            const res = delete_Data?.data;
            if (res?.status == 1) {
                showMessage({
                    message: "Success",
                    description: "Role Deleted Successfully",
                    type: "info",
                });
                userRefetch();
                refetchCreatedRoles();
            }
        } catch (err) {
            console.error("Delete role error:", err);
        }
    };

    const onDelete = (id) => {
        Alert.alert('Confirmation', 'Are you sure you want to delete this role?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => deletedfun(id) }
        ]);
    };

    const onNew = () => {
        setPermissions({});
        setRoleName(null);
        setEdit(false);
        setDisabled(false);
        setCurrentEditingId(null);
    };

    const handlePermissionChange = (page, permission) => {
        setPermissions(prev => {
            const updated = { ...prev };
            if (!updated[page]) {
                updated[page] = {
                    read: false,
                    create: false,
                    edit: false,
                    delete: false,
                    isdefault: false,
                };
            }

            if (permission === 'isdefault') {
                updated[page] = {
                    read: true,
                    create: true,
                    edit: true,
                    delete: true,
                    isdefault: true,
                    ...(edit && { dbid: updated[page].dbid }),
                };
            } else {
                updated[page] = {
                    ...updated[page],
                    [permission]: !updated[page][permission],
                    isdefault: ['read', 'create', 'edit', 'delete'].every(
                        p => p === permission ? !updated[page][p] : updated[page][p]
                    ),
                };
            }
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!roleName || Object.keys(permissions).length === 0) {
            Toast.show({ type: 'info', text1: 'Please fill all required fields' });
            return;
        }

        try {
            const permission_data = !edit ? {
                ...permissions,
                HOME: { read: true, create: true, edit: true, delete: true, isdefault: true, roleName },
                DashBoard: { read: true, create: true, edit: true, delete: true, isdefault: true, roleName }
            } : permissions;

            const formData = {
                roleName,
                permissions: permission_data,
                ...(edit && { roleName: currentEditingId }),
            };

            const response = edit
                ? await updateUserOnRole(formData).unwrap()
                : await createUserOnRole(formData).unwrap();

            if (response.data?.count > 0 || response.status === 1 || response.statusCode === 1) {
                Toast.show({
                    type: 'success',
                    text1: `Role ${edit ? 'Updated' : 'Created'} Successfully`,
                });
                refetchCreatedRoles();
                userRefetch();
                onNew();
            } else {
                Toast.show({
                    type: 'success',
                    text1: `Role ${edit ? 'Updated' : 'Created'} Successfully`,
                });
                refetchCreatedRoles();
                userRefetch();
                onNew();
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: `Error: ${error.message || 'Failed to save role'}`,
            });
        }
    };

    const handleUpdate = () => {
        Alert.alert('Confirmation', 'Are you sure you want to update the role details?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => handleSubmit() }
        ]);
    };

    const transformPermissions = (data) => {
        return (data || []).reduce((acc, perm) => {
            acc[perm.link] = {
                dbid: perm?.dbid || perm?.id,
                read: !!perm.read,
                create: !!perm.create,
                edit: !!perm.edit,
                delete: !!perm.delete,
                isdefault: !!perm.isdefault,
            };
            return acc;
        }, {});
    };

    const editData = async (item) => {
        try {
            setEdit(true);
            setDisabled(false);
            setRoleName(item.name);
            setCurrentEditingId(item?.name);

            const data = item.RoleOnPage;
            if (data) {
                setPermissions(transformPermissions(data));
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'No permission data returned for this role',
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to load role data',
                text2: error.message,
            });
        }
    };

    const permissionColumns = [
        { key: 'read', label: 'Read' },
        { key: 'create', label: 'Create' },
        { key: 'edit', label: 'Edit' },
        { key: 'delete', label: 'Delete' },
        { key: 'isdefault', label: 'Admin' },
    ];

    const fields = [
        {
            key: 'name',
            label: 'Role Name',
            flex: 1.4,
            titleProps: { numeric: false },
            cellProps: { numeric: false },
        },
        {
            key: 'active',
            label: 'Active',
            flex: 0.7,
            titleProps: { numeric: false },
            cellProps: { numeric: false },
        },
    ];

    const filterRole = all_Role_names?.data?.filter((data) => data?.RoleOnPage?.length === 0) || [];

    return (
        <Animated.View
            style={[
                styles.pageContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>User Information</Text>
                    <Text style={styles.cardDescription}>Choose the role you want to configure.</Text>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Logged In User:</Text>
                        <View style={styles.usernameContainer}>
                            <MaterialIcons name="person" size={20} color={theme.colors.brand} />
                            <Text style={styles.usernameText}>{username || 'Admin'}</Text>
                        </View>

                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                selected={roleName}
                                label="Role Name"
                                placeholder="Choose a role to configure"
                                setSelected={setRoleName}
                                width={"100%"}
                                _label={"name"}
                                _value={"name"}
                                options={{ data: filterRole }}
                                zIndex={300}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Page Permissions</Text>
                    <Text style={styles.cardDescription}>
                        Toggle access for each page. Swipe horizontally to see every permission.
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.permissionTableContent}
                    >
                        <View style={styles.permissionTable}>
                            <View style={[styles.permissionRow, styles.permissionHeader]}>
                                <Text style={[styles.pageName, styles.permissionHeaderText]}>Page</Text>
                                {permissionColumns.map(column => (
                                    <Text key={column.key} style={[styles.permissionColumn, styles.permissionHeaderText]}>
                                        {column.label}
                                    </Text>
                                ))}
                            </View>
                            {(appTabs || []).filter(item => item.list).map((item, index) => {
                                const pagePermissions = permissions[item.name] || {};
                                return (
                                    <View
                                        key={item.name}
                                        style={[
                                            styles.permissionRow,
                                            index % 2 === 1 && styles.permissionAlternateRow,
                                        ]}
                                    >
                                        <Text style={styles.pageName} numberOfLines={2}>
                                            {item.list_name}
                                        </Text>
                                        {permissionColumns.map(column => {
                                            const isActive = !!(item.default || pagePermissions[column.key]);
                                            const isDisabled = !!item.default || disabled;
                                            return (
                                                <View key={column.key} style={styles.permissionColumn}>
                                                    <TouchableOpacity
                                                        accessibilityRole="checkbox"
                                                        accessibilityLabel={`${item.list_name} ${column.label}`}
                                                        accessibilityState={{ checked: isActive, disabled: isDisabled }}
                                                        disabled={isDisabled}
                                                        style={[
                                                            styles.permissionCell,
                                                            isActive && styles.permissionActiveCell,
                                                            isDisabled && styles.permissionDisabledCell,
                                                        ]}
                                                        onPress={() => handlePermissionChange(item.name, column.key)}
                                                        activeOpacity={0.75}
                                                    >
                                                        {isActive && (
                                                            <MaterialIcons
                                                                name="check"
                                                                size={17}
                                                                color={isDisabled ? theme.colors.textMuted : theme.colors.success}
                                                            />
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.actionButtonBar}>
                    <TouchableOpacity
                        style={styles.primaryActionButton}
                        onPress={edit ? handleUpdate : handleSubmit}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons 
                            name={edit ? "check" : "save"} 
                            size={20} 
                            color={theme.colors.brandContrast} 
                        />
                        <Text style={styles.primaryActionText}>
                            {edit ? "Update Role" : "Save Role"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryActionButton}
                        onPress={onNew}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name={edit ? "close" : "add"} size={18} color={theme.colors.textSecondary} />
                        <Text style={styles.secondaryActionText}>
                            {edit ? "Cancel" : "New Role"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Available Roles</Text>
                    <Text style={styles.cardDescription}>Review, edit, or remove configured roles.</Text>
                    <View style={styles.tableContainer}>
                        <CustomDataTable
                            data={get_created_roles?.data || []}
                            fields={fields}
                            onEdit={editData}
                            onDelete={onDelete}
                            itemsPerPage={4}
                        />
                    </View>
                </View>
            </ScrollView>

            <FloatingButton
                save={handleSubmit}
                edit={editData}
                editable={edit}
                New={onNew}
                Update={handleUpdate}
            />
        </Animated.View>
    );
}

const createStyles = theme => StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContainer: {
        padding: theme.layout.screenGutter,
        paddingBottom: 110,
    },
    card: {
        ...theme.styles.card,
        ...theme.styles.shadow,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    cardTitle: {
        ...theme.typography.h4,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    cardDescription: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: -theme.spacing.xs,
        marginBottom: theme.spacing.md,
        lineHeight: 18,
    },
    formContainer: {
        paddingVertical: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
    },
    usernameText: {
        ...theme.typography.subtitle,
        marginLeft: theme.spacing.sm,
        color: theme.colors.text,
    },
    dropdownContainer: {
        marginTop: 2,
    },
    tableContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    permissionTableContent: {
        minWidth: '100%',
    },
    permissionTable: {
        minWidth: 350,
        borderRadius: theme.radii.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    permissionRow: {
        minHeight: theme.controlSizes.minTouchTarget,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    permissionHeader: {
        minHeight: theme.controlSizes.buttonHeightCompact,
        backgroundColor: theme.colors.brand,
    },
    permissionHeaderText: {
        textAlign: 'center',
        fontWeight: '700',
        ...theme.typography.caption,
        color: theme.colors.brandContrast,
    },
    pageName: {
        width: 110,
        paddingHorizontal: theme.spacing.sm,
        ...theme.typography.caption,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.medium,
    },
    permissionColumn: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionCell: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.xs,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    permissionActiveCell: {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.success,
    },
    permissionDisabledCell: {
        opacity: 0.75,
    },
    permissionAlternateRow: {
        backgroundColor: theme.colors.backgroundSubtle,
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
});