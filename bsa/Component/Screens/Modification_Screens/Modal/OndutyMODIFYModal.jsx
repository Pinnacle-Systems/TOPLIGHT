import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Modal, Pressable, Alert, TextInput } from 'react-native';
import { Text } from 'react-native';
import { Card, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import { showMessage } from 'react-native-flash-message';
import { useGet__Onduty_editQuery, useGet__VechileQuery } from '../../../../redux/service/Onduty';
import CustomDataTable from '../../../Utils/CommonDataTable';
import { useDelete_CommonMutation, useUpdate_CommonMutation } from '../../../../redux/service/commonMasters';
import { useDispatch, useSelector } from 'react-redux';
import CustomDropdownInput from '../../../Inputs/DropDownCustom';
import { setInput } from '../../../../redux/Slices/inputsHandler';
import moment from 'moment';

// Backend stores IST directly — parse as-is, NO UTC→local conversion.
const parseISTTime = (timeStr) => {
  if (!timeStr) return null;
  if (typeof timeStr === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    return moment(timeStr, 'HH:mm:ss');
  }
  return moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true).isValid()
    ? moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601])
    : moment(timeStr);
};

const friendlyDateTime = (timeStr) => {
  if (!timeStr) return '—';
  const m = parseISTTime(timeStr);
  return m && m.isValid() ? m.format('DD MMM YYYY, hh:mm A') : timeStr;
};

function Onduty_ALL_EDIT() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const FuelSelect = useSelector((state) => state?.Input?.Fuel_state);
  const [actionLoading, setActionLoading] = useState(false);
  const { data: allOndutyEntries, refetch: refreshData } = useGet__Onduty_editQuery();
   const { data: get_all_vechile } = useGet__VechileQuery()
    const [deleteRow] = useDelete_CommonMutation();
    const [updateRecord] = useUpdate_CommonMutation();
     const dispatch=useDispatch()

  // Filter data based on search query
  const filteredData = useMemo(() => {
    return allOndutyEntries?.data?.filter(item => 
      item.empname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.idcard?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.docid?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [allOndutyEntries, searchQuery]);

  // Prepare detailed view data for modal
  const modalTableData = selectedItem ? [
    ["Field", "Value"],
    ["Document ID", selectedItem.docid || "N/A"],
    ["Employee", `${selectedItem.empname} (${selectedItem.idcard})`],
    ["Status", selectedItem.approvalStatus || "N/A"],
    ["HOD Approval", selectedItem.hod ? selectedItem.approvalStatus : "-"],
    ["HR Approval", selectedItem.hr ? selectedItem.approvalStatus :  "-"],
    ["Check-In", friendlyDateTime(selectedItem.in_time)],
    ["Check-Out", friendlyDateTime(selectedItem.out_time)],
    ["Vehicle No.", selectedItem.vechileno || "N/A"],
    ["Location", selectedItem.in_location || "N/A"],
    ["Created On", friendlyDateTime(selectedItem.createdAt)],
  ] : [];

  // Handle row selection (for modal details)
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  // Start editing a row
  const handleEditStart = (item) => {
    setEditingItem(item.id);
    setEditedValues({
      empname: item.empname,
      idcard: item.idcard,
      vechileno: item.vechileno,
      in_time: item.in_time,
      out_time: item.out_time,
    });
  };

  // Handle input changes during editing
  const handleEditChange = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save edited data
  const handleEditSave = async (item) => {
    setActionLoading(true);
    try {
      const result = await updateRecord({
        table: 'onduty',
        where: { id: item.id },
        data: editedValues
      }).unwrap();

      if (result?.status === 1) {
        showMessage({
          message: "Success",
          description: "Onduty record updated",
          type: "success",
        });
        setEditingItem(null);
        refreshData();
      }
    } catch (error) {
      showMessage({
        message: "Error",
        description: "Failed to update record",
        type: "danger",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingItem(null);
    setEditedValues({});
  };

  // Handle approval/rejection
  const handleStatusChange = async (item, status) => {
    setActionLoading(true);
    try {
      const result = await updateRecord({
        table: 'onduty',
        where: { id: item.id },
        data: { 
          approvalStatus: status,
          ...(status === 'approved' ? { approvedBy: 'admin' } : { rejectBy: 'admin' })
        }
      }).unwrap();

      if (result?.status === 1) {
        showMessage({
          message: "Success",
          description: `Onduty record ${status}`,
          type: "success",
        });
        refreshData();
      }
    } catch (error) {
      showMessage({
        message: "Error",
        description: `Failed to ${status} record`,
        type: "danger",
      });
    } finally {
      setActionLoading(false);
    }
  };


    useEffect(() => {
      if (get_all_vechile?.data) {
        dispatch(setInput({ id: "Fuel_state", vechil_option: get_all_vechile?.data }));
      }
    }, [get_all_vechile]);

  // Delete confirmation
  const handleDelete = async (item) => {
    Alert.alert(
      'Confirm Deletion',
      `Delete onduty record for ${item.empname} (${item.docid})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            setActionLoading(true);
            try {
              const result = await deleteRow({ 
                table: 'onduty', 
                where: { id: item.id } ,
                onlywhere:true
              }).unwrap();
              
              if (result?.status === 1) {
                showMessage({
                  message: "Success",
                  description: "Onduty record deleted",
                  type: "success",
                });
                refreshData();
              }
            } catch (error) {
              showMessage({
                message: "Error",
                description: "Failed to delete record",
                type: "danger",
              });
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  // Table columns configuration
  const tableFields = [
    { 
      key: 'docid', 
      label: 'Doc ID',
      width: 150,
      cellProps: { numeric: false }
    },
    { 
      key: 'empname', 
      label: 'Employee',
      width: 150,
      cellProps: { numeric: false },
      renderCell: (item) => (
       
          <Text>{item.empname}</Text>
        
      )
    },
    { 
      key: 'idcard', 
      label: 'ID Card',
      width: 120,
      cellProps: { numeric: false },
      renderCell: (item) => (
       
          <Text>{item.idcard}</Text>
        
      )
    },
    { 
      key: 'vechileno', 
      label: 'Vehicle No',
      width: 200,
      cellProps: { numeric: false },
      renderCell: (item) => (
       editingItem === item.id ? (
          <CustomDropdownInput
                          height={50} 
                          width={180}
                          labelKey={"vechilename"} 
                          valueKey={"vechileno"} 
                          items_state={"vechil_option"}  
                          id={"Fuel_state"}  
                          state={"vechile"} 
                          label={"Select Vehicle"}
                        /> 

          ):(
          <Text>{item.vechileno || 'N/A'}</Text>
        )
      )
    },
    { 
      key: 'approvalStatus', 
      label: 'Status',
      width: 100,
      cellProps: { numeric: false },
      renderCell: (item) => (
  

        <Text style={{
          color: item.approvalStatus === 'approved' ? 'green' : 
                item.approvalStatus === 'rejected' ? 'red' : 'orange',
          fontWeight: 'bold'
        }}>
          {item.approvalStatus}
        </Text>
  )
      
    },
    { 
      key: 'actions', 
      label: 'Actions',
      width: 200,
      renderCell: (item) => (
        <View style={styles.actionButtons}>
          {editingItem === item.id ? (
            <>
              <TouchableOpacity 
                onPress={() => handleEditSave(item)}
                style={styles.saveButton}
                disabled={actionLoading}
              >
                <Icon name="save" size={18} color="#27ae60" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleEditCancel}
                style={styles.cancelButton}
                disabled={actionLoading}
              >
                <Icon name="cancel" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                onPress={() => handleViewDetails(item)}
                style={styles.viewButton}
              >
                <Icon name="visibility" size={18} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleEditStart(item)}
                style={styles.editButton}
              >
                <Icon name="edit" size={18} color="#f39c12" />
              </TouchableOpacity>
              
              {item.approvalStatus === 'pending' && (
                <>
                  <TouchableOpacity 
                    onPress={() => handleStatusChange(item, 'approved')}
                    style={styles.approveButton}
                    disabled={actionLoading}
                  >
                    <Icon name="check" size={18} color="#27ae60" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleStatusChange(item, 'rejected')}
                    style={styles.rejectButton}
                    disabled={actionLoading}
                  >
                    <Icon name="close" size={18} color="#e74c3c" />
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity 
                onPress={() => handleDelete(item)}
                style={styles.deleteButton}
                disabled={actionLoading}
              >
                <Icon name="delete" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.header}>Onduty Records Management</Text>
          
          <Searchbar
            placeholder="Search by employee, ID or doc number..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          <CustomDataTable
            data={filteredData}
            fields={tableFields}
            itemsPerPage={5}
            emptyMessage="No onduty records found"
          />
        </Card.Content>
      </Card>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Onduty Details: {selectedItem?.docid}
            </Text>
            
            <ScrollView>
              <Table borderStyle={styles.tableBorder}>
                <Rows 
                  data={modalTableData} 
                  textStyle={styles.modalCellText}
                  style={styles.modalRow}
                />
              </Table>
              
              {selectedItem?.reject_reason && (
                <View style={styles.rejectReasonContainer}>
                  <Text style={styles.rejectReasonLabel}>Rejection Reason:</Text>
                  <Text style={styles.rejectReasonText}>{selectedItem.reject_reason}</Text>
                </View>
              )}


                <Pressable
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
            </ScrollView>

            {selectedItem?.approvalStatus === 'pending' && (
              <View style={styles.modalActionButtons}>
                <Pressable
                  style={[styles.modalButton, styles.approveButton]}
                  onPress={() => {
                    handleStatusChange(selectedItem, 'approved');
                    setShowDetailsModal(false);
                  }}
                  disabled={actionLoading}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.rejectButton]}
                  onPress={() => {
                    handleStatusChange(selectedItem, 'rejected');
                    setShowDetailsModal(false);
                  }}
                  disabled={actionLoading}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </Pressable>
              </View>
            )}

          
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  searchBar: {
    marginBottom: 15,
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    padding: 5,
  },
  editButton: {
    padding: 5,
  },
  saveButton: {
    padding: 5,
  },
  cancelButton: {
    padding: 5,
  },
  approveButton: {
    padding: 5,
  },
  rejectButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 5,
    backgroundColor: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#3498db',
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalRow: {
    minHeight: 40,
    backgroundColor: '#f9f9f9',
  },
  modalCellText: {
    padding: 8,
    fontSize: 14,
  },
  rejectReasonContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fde8e8',
    borderRadius: 5,
  },
  rejectReasonLabel: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  rejectReasonText: {
    marginTop: 5,
    color: '#333',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  closeButton: {
    backgroundColor: '#3498db',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Onduty_ALL_EDIT;