import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Table, Row, Rows } from 'react-native-table-component';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { showMessage } from 'react-native-flash-message';

import { 
    useCreateRoleOnPageMutation, 
    useUpdateRoleOnPageMutation, 
    useGetCreatedRolesOnPageQuery 
} from '../../../store/api/userApi';
import { useGet_all_roleQuery } from '../../../store/api/RoleOnApi';
import { useDelete_CommonMutation } from '../../../store/api/commonMastersApi';
import appTabs from '../../../constants/appTabs';

import { Dropdown } from '../../../components/ReusableComponents/inputs';
import FloatingButton from '../../../components/Buttons/Buttons';
import CustomDataTable from '../../../components/Utils/CommonDataTable';

export default function RoleAllocation() {
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

    const tableHead = ['Pages', 'Read', 'Create', 'Edit', 'Delete', 'Admin'];
    const tableData = (appTabs || []).map(item => {
        if (!item.list) return null;
        const p = permissions[item.name] || {};
        return [
            item.list_name,
            ...['read', 'create', 'edit', 'delete', 'isdefault'].map(perm => (
                <TouchableOpacity
                    key={perm}
                    disabled={item?.default || disabled}
                    style={[
                        styles.permissionCell,
                        (item?.default || p[perm]) && styles.permissionActiveCell,
                    ]}
                    onPress={() => handlePermissionChange(item.name, perm)}
                >
                    <Text style={styles.tickText}>{item?.default || p[perm] ? '✔' : ''}</Text>
                </TouchableOpacity>
            ))
        ];
    }).filter(Boolean);

    const fields = [
        {
            key: 'name',
            label: 'Role Name',
            titleProps: { numeric: false },
            cellProps: { numeric: false },
        },
        {
            key: 'active',
            label: 'Active',
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
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Logged In User:</Text>
                        <View style={styles.usernameContainer}>
                            <MaterialIcons name="person" size={20} color="#3b82f6" />
                            <Text style={styles.usernameText}>{username || 'Admin'}</Text>
                        </View>

                        <Text style={styles.label}>Role Name:</Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                selected={roleName}
                                label={<Text>Select Role</Text>}
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
                    <View style={styles.tableContainer}>
                        <Table borderStyle={styles.tableBorder}>
                            <Row
                                data={tableHead}
                                style={styles.head}
                                textStyle={styles.headText}
                            />
                            <Rows
                                data={tableData}
                                style={styles.rows}
                                textStyle={styles.cellText}
                            />
                        </Table>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Available Roles</Text>
                    <View style={styles.tableContainer}>
                        <CustomDataTable
                            title="Available Roles"
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

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 110,
    },
    card: {
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
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    formContainer: {
        paddingVertical: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
    },
    usernameText: {
        fontSize: 15,
        marginLeft: 8,
        color: '#1e293b',
        fontWeight: '600',
    },
    dropdownContainer: {
        marginTop: 2,
    },
    tableContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    tableBorder: {
        borderWidth: 0,
    },
    head: {
        height: 44,
        backgroundColor: '#3b82f6',
    },
    headText: {
        textAlign: 'center',
        fontWeight: '700',
        color: '#ffffff',
        fontSize: 13,
    },
    rows: {
        minHeight: 48,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    permissionCell: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#f8fafc',
        margin: 2,
        borderRadius: 6,
    },
    permissionActiveCell: {
        backgroundColor: '#dcfce7',
    },
    tickText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#16a34a',
        fontWeight: 'bold',
    },
    cellText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#334155',
        paddingHorizontal: 4,
    },
});
