import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { showMessage } from 'react-native-flash-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAddRole_masterMutation, useGet_all_roleQuery } from '../../store/api/RoleOnApi';
import { useUpdate_CommonMutation, useDelete_CommonMutation } from '../../store/api/CommonMastersApi';
import MasterTopBar from './MasterTopBar';
import MasterStatsRow from './MasterStatsRow';
import MasterSearchBar from './MasterSearchBar';
import MasterItemCard from './MasterItemCard';
import MasterFormModal from './MasterFormModal';
import { useAppTheme } from '../../theme';

export default function RoleMasterScreen({ navigation }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const ACCENT = theme.colors.secondary;
    const UserSelect = useSelector(state => state.UserDetails);

    // ── API Hooks ─────────────────────────────────────────────────────────────
    const {
        data: allRoles,
        isLoading,
        isFetching,
        refetch,
    } = useGet_all_roleQuery({ where: UserSelect?.GCOMPCODE });
    const [addRole_master] = useAddRole_masterMutation();
    const [update_Common] = useUpdate_CommonMutation();
    const [delete_Common] = useDelete_CommonMutation();

    // ── Local State ───────────────────────────────────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [active, setActive] = useState('Yes');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Filtered Data ─────────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        const raw = allRoles?.data || [];
        // Strip the @COMPCODE suffix from role name for display
        return raw
            .map(item => ({
                ...item,
                displayName: item?.name
                    ? item.name.replace(`@${UserSelect?.GCOMPCODE}`, '').replace(/@.*$/, '')
                    : '',
            }))
            .filter(item => {
                const matchSearch = item?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
                const isItemActive = item?.active === 'Yes' || item?.active === 'Yes' || item?.active === 'y';
                const matchStatus =
                    activeFilter === 'all' ? true :
                    activeFilter === 'active' ? isItemActive :
                    !isItemActive;
                return matchSearch && matchStatus;
            });
    }, [allRoles, searchQuery, activeFilter, UserSelect?.GCOMPCODE]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const raw = allRoles?.data || [];
        const activeCount = raw.filter(i => i?.active === 'Yes' || i?.active === 'y').length;
        return { total: raw.length, active: activeCount, inactive: raw.length - activeCount };
    }, [allRoles]);

    // ── Modal Handlers ────────────────────────────────────────────────────────
    const openAddModal = useCallback(() => {
        setIsEdit(false);
        setEditId(null);
        setName('');
        setActive('Yes');
        setModalVisible(true);
    }, []);

    const openEditModal = useCallback((item) => {
        setIsEdit(true);
        setEditId(item.id);
        // Use display name (without compcode suffix) in the form
        setName(item.displayName || item.name || '');
        const isAct = item?.active === 'Yes' || item?.active === 'y';
        setActive(isAct ? 'Yes' : 'No');
        setModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setName('');
        setActive('Yes');
        setEditId(null);
        setIsEdit(false);
    }, []);

    const handleSubmit = async () => {
        if (!name?.trim()) {
            showMessage({ message: 'Validation', description: 'Role name is required.', type: 'warning' });
            return;
        }
        setIsSubmitting(true);
        try {
            if (isEdit) {
                // For update, preserve the @COMPCODE suffix in DB
                const result = await update_Common({
                    table: 'Role',
                    where: { id: editId },
                    data: { active },
                    onlywhere: true,
                });
                if (result?.data?.status === 1) {
                    showMessage({ message: 'Updated', description: 'Role updated successfully.', type: 'success' });
                    closeModal();
                    refetch();
                } else {
                    showMessage({ message: 'Error', description: 'Update failed. Please retry.', type: 'danger' });
                }
            } else {
                // Add role appends @COMPCODE as in the old code
                const result = await addRole_master({
                    data: {
                        name: `${name.trim()}@${UserSelect?.GCOMPCODE}`,
                        active,
                        COMPCODE: UserSelect?.GCOMPCODE,
                    },
                });
                if (result?.data?.status === 1) {
                    showMessage({ message: 'Added', description: `Role "${name.trim()}" created.`, type: 'success' });
                    closeModal();
                    refetch();
                } else {
                    showMessage({ message: 'Error', description: 'Failed to add role.', type: 'danger' });
                }
            }
        } catch (e) {
            showMessage({ message: 'Error', description: 'Something went wrong.', type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = useCallback((item) => {
        Alert.alert(
            'Delete Role',
            `Remove the role "${item.displayName || item.name}"? This may affect assigned users.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await delete_Common({
                                table: 'Role',
                                where: { id: item.id },
                                onlywhere: true,
                            });
                            if (result?.data?.status === 1) {
                                showMessage({ message: 'Deleted', description: 'Role removed.', type: 'info' });
                                refetch();
                            } else {
                                showMessage({ message: 'Error', description: 'Could not delete role.', type: 'danger' });
                            }
                        } catch (e) {
                            showMessage({ message: 'Error', description: 'Delete failed.', type: 'danger' });
                        }
                    },
                },
            ],
        );
    }, [delete_Common, refetch]);

    const renderItem = useCallback(({ item }) => (
        <MasterItemCard
            item={{ ...item, name: item.displayName || item.name }}
            onEdit={openEditModal}
            onDelete={handleDelete}
            accentColor={ACCENT}
        />
    ), [openEditModal, handleDelete, ACCENT]);

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="shield-account-outline" size={44} color={theme.colors.borderStrong} />
            </View>
            <Text style={styles.emptyTitle}>
                {searchQuery ? 'No Results Found' : 'No Roles Configured'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery
                    ? `No roles matching "${searchQuery}".`
                    : 'Create organizational roles to control page access and permissions.'}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={styles.loadingText}>Loading Roles...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MasterTopBar
                title="Role & Page Master"
                subtitle="Manage organizational roles and access"
                onBack={() => navigation.goBack()}
                onAdd={openAddModal}
                accentColor={ACCENT}
                addLabel="New Role"
            />

            <MasterStatsRow
                total={stats.total}
                active={stats.active}
                inactive={stats.inactive}
                accentColor={ACCENT}
            />

            <MasterSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search roles..."
                hasPtype={false}
                activeFilter={activeFilter}
                onActiveFilterChange={setActiveFilter}
            />

            <FlatList
                data={filteredData}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                ListEmptyComponent={EmptyState}
                contentContainerStyle={[
                    styles.listContent,
                    filteredData.length === 0 && styles.listEmpty,
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        colors={[ACCENT]}
                        tintColor={ACCENT}
                    />
                }
            />

            <MasterFormModal
                visible={modalVisible}
                onClose={closeModal}
                isEdit={isEdit}
                name={name}
                setName={setName}
                active={active}
                setActive={setActive}
                hasPtype={false}
                isLoading={isSubmitting}
                onSubmit={handleSubmit}
                accentColor={ACCENT}
                title="Add New Role"
            />
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.textMuted,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 30,
    },
    listEmpty: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceSunken,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
