import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, ActivityIndicator, Modal, Pressable, Alert } from 'react-native';
import { Text } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { setInput } from '../../../redux/Slices/inputsHandler';

import Custom_Notification from '../../Utils/Custom_Notification';
import { Table, Row, Rows } from 'react-native-table-component';
import { Card, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InputWraper from '../InputWraper';
import CustomDataTable from '../../Utils/CommonDataTable';
import { useDelete_CommonMutation, useUpdate_CommonMutation } from '../../../redux/service/commonMasters';
import { showMessage } from 'react-native-flash-message';
import { useAddOnduty_masterMutation, useGet_all_Onduty_reasonQuery } from '../../../redux/service/Onduty';
import { Onduty_master_Meta } from '../../../redux/States/Master/Onduty';

function OndutyMaster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEdit, setisEdit] = useState(false);
  const [id, setid] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [insertedData, setInsertedData] = useState(null);
  const data = useSelector((state) => state?.Input?.Onduty_Master_state);
  const [addOnduty_category] = useAddOnduty_masterMutation()
  const [update_table] = useUpdate_CommonMutation();
  const [delete_row] = useDelete_CommonMutation();
  const { data: all_Onduty_reasons, isError, error, refetch: get_all_refresh } = useGet_all_Onduty_reasonQuery()
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInput({
      options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }],
      id: "Onduty_Master_state"
    }));
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { options, ...reset } = data;
      const ondutydata = await addOnduty_category({ data: reset }).unwrap();

      if (ondutydata?.status == 1) {
        // Store the inserted data to show in report
        setInsertedData(reset);
        get_all_refresh();
        setShowReport(true);
        get_all_refresh();
        dispatch(setInput({ name: "", active: "", id: "Onduty_Master_state" }));
      }
      Custom_Notification(ondutydata?.status);
    } catch (error) {
      Custom_Notification(0); // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return all_Onduty_reasons?.data?.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  }, [all_Onduty_reasons, searchQuery]);

  // Report table data
  const reportTableData = insertedData ? [
    ["Field", "Value"],
    ["Name", insertedData.name || "N/A"],
    ["Active", insertedData.active === "y" ? "Yes" : "No"],
    ["Date", new Date().toLocaleDateString()],
  ] : [];

  // Define table fields
  const fields = [
    { 
      key: 'name', 
      label: 'Name',
      titleProps: { numeric: false },
      cellProps: { numeric: false }
    },
    { 
      key: 'active', 
      label: 'Active',
      titleProps: { numeric: false },
      cellProps: { numeric: false }
    },
  ];

  // Edit handler
  const handleEdit = (item) => {
    dispatch(setInput({ name: item?.name, active: item.active, id: "Onduty_Master_state" })); 
    setid(item?.id);
    setisEdit(true);
  };

  // Delete handler
  const deleteConfirm = async (item) => {
    var delete_Data = await delete_row({ table: 'OndutyMaster', where: { id: item.id } });
    const res = delete_Data?.data;
    if (res?.status == 1) {
      showMessage({
        message: "Data",
        description: "Data Deleted Successfully",
        type: "info",
      });
      get_all_refresh();
    }
  };

  const handleDelete = async (item) => {
    Alert.alert('🗑 Delete', 'Do You Want Delete ? ', [{
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "OK",
      onPress: () => deleteConfirm(item),
    }]);
  };

  const handleUpdate = async () => {
    const { options, ...reset } = data;
    var Update_data = await update_table({ where: { id: id }, data: { ...reset }, table: 'OndutyMaster' });
    if (Update_data?.data?.status == 1) {
      showMessage({
        message: "Data",
        description: "Data Update Successfully",
        type: "success",
      });
      dispatch(setInput({ name: "", active: "", id: "Onduty_Master_state" })); 
      setisEdit(false);
      get_all_refresh();
    } else {
      showMessage({
        message: "Data",
        description: "Data Update Failed",
        type: "danger",
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.header}>Onduty Management</Text>
          
          {/* Search Bar */}
          <Searchbar
            placeholder="Search onduty reasons..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />

          {/* Form Section */}
          <View style={styles.formContainer}>
            <InputWraper states={Onduty_master_Meta} />
            
            {isEdit ? (
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    <Icon name="edit" size={18} color="#fff" /> Update Onduty
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    <Icon name="add" size={18} color="#fff" /> Add Onduty
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Onduty Table */}
          <View style={styles.tableContainer}>
            <CustomDataTable
              title="Onduty List"
              data={filteredData || []}
              fields={fields}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemsPerPage={3}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Insert Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReport}
        onRequestClose={() => setShowReport(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Onduty Added Successfully</Text>
            
            <Table borderStyle={styles.reportTableBorder}>
              <Rows 
                data={reportTableData} 
                textStyle={styles.reportCellText}
                style={styles.reportRow}
              />
            </Table>

            <Pressable
              style={styles.closeButton}
              onPress={() => setShowReport(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
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
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  tableContainer: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  tableBorder: {
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  head: {
    height: 50,
    backgroundColor: '#3498db',
  },
  headText: {
    textAlign: 'center',
    fontWeight: '600',
    color: 'white',
    fontSize: 14,
  },
  rows: {
    height: 50,
    backgroundColor: 'white',
  },
  cellText: { 
    textAlign: 'center',
    color: '#34495e',
    fontSize: 13,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
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
    color: '#27ae60',
  },
  reportTableBorder: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportCellText: {
    padding: 8,
    fontSize: 14,
  },
  reportRow: {
    height: 40,
    backgroundColor: '#f9f9f9',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OndutyMaster;