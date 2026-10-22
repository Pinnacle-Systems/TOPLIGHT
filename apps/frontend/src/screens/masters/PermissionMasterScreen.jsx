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
import { showMessage } from 'react-native-flash-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
    useGet_all_Permission_reasonQuery,
    useAddPermission_MasterMutation,
} from '../../store/api/PermissionApi';
import { useUpdate_CommonMutation, useDelete_CommonMutation } from '../../store/api/CommonMastersApi';
import MasterTopBar from './MasterTopBar';
import MasterStatsRow from './MasterStatsRow';
import MasterSearchBar from './MasterSearchBar';
import MasterItemCard from './MasterItemCard';
import MasterFormModal from './MasterFormModal';
import { useAppTheme } from '../../theme';

export default function PermissionMasterScreen({ navigation }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const ACCENT = theme.colors.accent;
    // ── API Hooks ─────────────────────────────────────────────────────────────
    const { data: allReasons, isLoading, isFetching, refetch } = useGet_all_Permission_reasonQuery();
    const [addPermission_Master] = useAddPermission_MasterMutation();
    const [update_Common] = useUpdate_CommonMutation();
    const [delete_Common] = useDelete_CommonMutation();

    // ── Local State ───────────────────────────────────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [active, setActive] = useState('Yes');
    const [ptype, setPtype] = useState('permission');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPtype, setFilterPtype] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Filtered Data ─────────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        const raw = allReasons?.data || [];
        return raw.filter(item => {
            const matchSearch = item?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchPtype = filterPtype === 'all' ? true : item?.ptype === filterPtype;
            const isItemActive = item?.active === 'Yes' || item?.active === 'y' || item?.active === 'Y';
            const matchStatus =
                activeFilter === 'all' ? true :
                activeFilter === 'active' ? isItemActive :
                !isItemActive;
            return matchSearch && matchPtype && matchStatus;
        });
    }, [allReasons, searchQuery, filterPtype, activeFilter]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const raw = allReasons?.data || [];
        const activeCount = raw.filter(i => i?.active === 'Yes' || i?.active === 'y' || i?.active === 'Y').length;
        return { total: raw.length, active: activeCount, inactive: raw.length - activeCount };
    }, [allReasons]);

    // ── Modal Handlers ────────────────────────────────────────────────────────
    const openAddModal = useCallback(() => {
        setIsEdit(false);
        setEditId(null);
        setName('');
        setActive('Yes');
        setPtype('permission');
        setModalVisible(true);
    }, []);

    const openEditModal = useCallback((item) => {
        setIsEdit(true);
        setEditId(item.id);
        setName(item.name || '');
        const isAct = item?.active === 'Yes' || item?.active === 'y' || item?.active === 'Y';
        setActive(isAct ? 'Yes' : 'No');
        setPtype(item?.ptype || 'permission');
        setModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setName('');
        setActive('Yes');
        setPtype('permission');
        setEditId(null);
        setIsEdit(false);
    }, []);

    const handleSubmit = async () => {
        if (!name?.trim()) {
            showMessage({ message: 'Validation', description: 'Name is required.', type: 'warning' });
            return;
        }
        if (!ptype) {
            showMessage({ message: 'Validation', description: 'Select a category type.', type: 'warning' });
            return;
        }
        setIsSubmitting(true);
        try {
            if (isEdit) {
                const result = await update_Common({
                    table: 'PermissionMaster',
                    where: { id: editId },
                    data: { name: name.trim(), active, ptype },
                    onlywhere: true,
                });
                if (result?.data?.status === 1) {
                    showMessage({ message: 'Updated', description: 'Entry updated successfully.', type: 'success' });
                    closeModal();
                    refetch();
                } else {
                    showMessage({ message: 'Error', description: 'Update failed. Please retry.', type: 'danger' });
                }
            } else {
                const result = await addPermission_Master({ data: { name: name.trim(), active, ptype } });
                if (result?.data?.status === 1) {
                    showMessage({ message: 'Added', description: 'Permission reason created.', type: 'success' });
                    closeModal();
                    refetch();
                } else {
                    showMessage({ message: 'Error', description: 'Failed to add entry.', type: 'danger' });
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
            'Delete Entry',
            `Remove "${item.name}" from permission reasons?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await delete_Common({
                                table: 'PermissionMaster',
                                where: { id: item.id },
                                onlywhere: true,
                            });
                            if (result?.data?.status === 1) {
                                showMessage({ message: 'Deleted', description: `"${item.name}" removed.`, type: 'info' });
                                refetch();
                            } else {
                                showMessage({ message: 'Error', description: 'Could not delete.', type: 'danger' });
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
            item={item}
            onEdit={openEditModal}
            onDelete={handleDelete}
            accentColor={ACCENT}
        />
    ), [openEditModal, handleDelete, ACCENT]);

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="account-clock-outline" size={44} color={theme.colors.borderStrong} />
            </View>
            <Text style={styles.emptyTitle}>
                {searchQuery ? 'No Results Found' : 'No Permission Reasons Yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery
                    ? `No results for "${searchQuery}".`
                    : 'Add your first permission, advance, or leave reason category.'}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={styles.loadingText}>Loading Reasons...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MasterTopBar
                title="Permissions & Reasons"
                subtitle="Permission, Advance & Leave categories"
                onBack={() => navigation.goBack()}
                onAdd={openAddModal}
                accentColor={ACCENT}
                addLabel="New Reason"
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
                placeholder="Search permission reasons..."
                hasPtype={true}
                filterPtype={filterPtype}
                onPtypeChange={setFilterPtype}
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
                ptype={ptype}
                setPtype={setPtype}
                hasPtype={true}
                isLoading={isSubmitting}
                onSubmit={handleSubmit}
                accentColor={ACCENT}
                title="Add Permission Reason"
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
