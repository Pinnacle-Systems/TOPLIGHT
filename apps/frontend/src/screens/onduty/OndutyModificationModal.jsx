import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Modal, 
    ActivityIndicator 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

import { useGet__Onduty_editQuery } from '../../store/api/OndutyApi';
import { useAppTheme } from '../../theme';

export default function OndutyModificationModal({ visible, onClose }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: allOndutyEntries, isLoading, refetch } = useGet__Onduty_editQuery(undefined, {
        skip: !visible,
    });

    const filteredData = useMemo(() => {
        const list = allOndutyEntries?.data || [];
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(item => 
            item.empname?.toLowerCase().includes(q) ||
            item.idcard?.toLowerCase().includes(q) ||
            item.docid?.toLowerCase().includes(q)
        );
    }, [allOndutyEntries, searchQuery]);

    const formatTime = (timeStr) => {
        if (!timeStr) return '—';
        return moment(timeStr).isValid() ? moment(timeStr).format('DD MMM, hh:mm A') : timeStr;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Modal Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>OnDuty Records</Text>
                    <TouchableOpacity style={styles.refreshBtn} onPress={() => refetch()}>
                        <MaterialCommunityIcons name="refresh" size={22} color={theme.colors.brand} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textDisabled} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search employee, ID or Doc ID..."
                        placeholderTextColor={theme.colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textDisabled} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Content */}
                {isLoading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color={theme.colors.brand} />
                        <Text style={styles.loadingText}>Loading records...</Text>
                    </View>
                ) : filteredData.length === 0 ? (
                    <View style={styles.centerBox}>
                        <MaterialCommunityIcons name="file-search-outline" size={48} color={theme.colors.borderStrong} />
                        <Text style={styles.emptyTitle}>No Records Found</Text>
                        <Text style={styles.emptySubtitle}>Try adjusting your search criteria</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                        {filteredData.map((item, index) => (
                            <TouchableOpacity 
                                key={item.id || item.docid || index}
                                style={styles.recordCard}
                                onPress={() => setSelectedItem(item)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.cardTopRow}>
                                    <Text style={styles.cardDocId}>{item.docid}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        item.approvalStatus === 'approved' ? styles.statusApproved : styles.statusPending
                                    ]}>
                                        <Text style={[
                                            styles.statusBadgeText,
                                            item.approvalStatus === 'approved' ? styles.statusApprovedText : styles.statusPendingText
                                        ]}>
                                            {item.approvalStatus || 'PENDING'}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.cardEmpName}>
                                    {item.empname} <Text style={styles.cardIdCard}>({item.idcard})</Text>
                                </Text>

                                <View style={styles.cardMetaRow}>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>IN</Text>
                                        <Text style={styles.metaValue}>{formatTime(item.in_time)}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>OUT</Text>
                                        <Text style={styles.metaValue}>{formatTime(item.out_time)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Detail View Sub-Modal */}
                {selectedItem ? (
                    <Modal
                        visible={!!selectedItem}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setSelectedItem(null)}
                    >
                        <View style={styles.detailOverlay}>
                            <View style={styles.detailCard}>
                                <View style={styles.detailHeader}>
                                    <Text style={styles.detailTitle}>Trip Details</Text>
                                    <TouchableOpacity onPress={() => setSelectedItem(null)}>
                                        <MaterialCommunityIcons name="close" size={22} color={theme.colors.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ maxHeight: 380 }}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>DOC ID</Text>
                                        <Text style={styles.detailValueMono}>{selectedItem.docid}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>EMPLOYEE</Text>
                                        <Text style={styles.detailValue}>{selectedItem.empname} ({selectedItem.idcard})</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>STATUS</Text>
                                        <Text style={styles.detailValue}>{selectedItem.approvalStatus || 'pending'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>CHECK-IN</Text>
                                        <Text style={styles.detailValue}>{formatTime(selectedItem.in_time)}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>CHECK-OUT</Text>
                                        <Text style={styles.detailValue}>{formatTime(selectedItem.out_time)}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>LOCATION</Text>
                                        <Text style={styles.detailValue}>{selectedItem.in_location || '—'}</Text>
                                    </View>
                                    {selectedItem.others ? (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>REMARKS</Text>
                                            <Text style={styles.detailValue}>{selectedItem.others}</Text>
                                        </View>
                                    ) : null}
                                </ScrollView>

                                <TouchableOpacity 
                                    style={styles.detailCloseBtn} 
                                    onPress={() => setSelectedItem(null)}
                                >
                                    <Text style={styles.detailCloseBtnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                ) : null}
            </View>
        </Modal>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    closeBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
    },
    refreshBtn: {
        padding: 4,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
        padding: 0,
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: theme.colors.textMuted,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        gap: 10,
    },
    recordCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardDocId: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.brand,
        fontFamily: 'monospace',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusApproved: {
        backgroundColor: theme.colors.successSoft,
    },
    statusApprovedText: {
        color: theme.colors.success,
        fontSize: 10,
        fontWeight: '800',
    },
    statusPending: {
        backgroundColor: theme.colors.warningSoft,
    },
    statusPendingText: {
        color: theme.colors.warning,
        fontSize: 10,
        fontWeight: '800',
    },
    cardEmpName: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
    },
    cardIdCard: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.textMuted,
    },
    cardMetaRow: {
        flexDirection: 'row',
        gap: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
        paddingTop: 8,
    },
    metaItem: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.textDisabled,
    },
    metaValue: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    detailOverlay: {
        flex: 1,
        backgroundColor: theme.colors.scrim,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    detailCard: {
        backgroundColor: theme.colors.surface,
        width: '100%',
        borderRadius: 20,
        padding: 20,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
    },
    detailRow: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.textDisabled,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    detailValueMono: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.brand,
        fontFamily: 'monospace',
    },
    detailCloseBtn: {
        backgroundColor: theme.colors.brand,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    detailCloseBtnText: {
        color: theme.colors.brandContrast,
        fontSize: 14,
        fontWeight: '700',
    },
});
