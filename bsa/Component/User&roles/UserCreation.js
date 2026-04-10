import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { Table, Row, Rows } from 'react-native-table-component';

import { useCreateRoleOnPageMutation, useUpdateRoleOnPageMutation, useGetDesignationQuery, useGetRolesOnPageQuery, useGetCreatedRolesOnPageQuery } from '../../redux/service/user';
import tabs from '../tabIndex';
import PullToRefresh from '../../ReusableComponents/PullToRefresh';
import { Dropdown } from '../../ReusableComponents/inputs';
import FloatingButton from '../Buttons/Buttons';
import { useCustomFonts } from '../CustomHooks/useFonts';
import CustomText from '../Text/CustomText';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useGet_all_roleQuery } from '../../redux/service/RoleOn';
import CustomDataTable from '../Utils/CommonDataTable';
import { useDelete_CommonMutation } from '../../redux/service/commonMasters';
import { showMessage } from 'react-native-flash-message';

export default function UserCreation() {
    const [permissions, setPermissions] = useState({});
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleName, setRoleName] = useState(null);
    const [username, setUsername] = useState(null);
    const [edit, setEdit] = useState(false);
    const [ CurrentEditingId, setCurrentEditingId]=useState()
    const [disabled, setDisabled] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const UserDetailsdata = useSelector(state => state.UserDetails);
    
    const {data:get_created_roles,refetch:userRefetch}=useGetCreatedRolesOnPageQuery()
      const { data: all_Role_names, isError, error, refetch: refetchCreatedRoles } = useGet_all_roleQuery()
    const [createUserOnRole] = useCreateRoleOnPageMutation();
    const [delete_row] = useDelete_CommonMutation()
    const [updateUserOnRole] = useUpdateRoleOnPageMutation();
    const { fontsLoaded } = useCustomFonts();

    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = await AsyncStorage.getItem('userName');
            setUsername(JSON?.parse(storedUser)?.userName);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start();
    }, []);



    // useEffect(() => {
    //    // setSelectedRole(UserDetailsdata?.Role);
    // }, [UserDetailsdata?.Role, edit]);

    // useEffect(() => {
    //     setPagePermission(roleOnPage?.data || []);
    // }, [roleOnPage]);

    const deletedfun=async (id)=>{
         var delete_Data = await delete_row({ table: 'role', where: { id: id.id } });
            const res = delete_Data?.data;
            if (res?.status == 1) {
              showMessage({
                message: "Data",
                description: "Data Deleted Successfully",
                type: "info",
              });
              userRefetch()
            }
    }

    const onDelete=(id)=>{

       Alert.alert('Confirmation', 'Are you sure you want to Delete the details?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () =>{deletedfun(id)}}
        ]);


    }

    const setPagePermission = (userData) => {
        
        const transformed = userData.reduce((acc, perm) => {
            acc[perm.Pages] = {
                read: !! perm.read,
                create: !!perm.create,
                edit: !!perm.edit,
                delete: !!perm.delete,
                isdefault: !!perm.isdefault
            };
            return acc;
        }, {});
        setPermissions(transformed);
    };

    const onNew = () =>{ 
        
     setPermissions({})
     setEdit(false)
    setDisabled(false);   
    
}

    const validateData = ({ roleName, permissions }) => roleName && Object.keys(permissions).length > 0;

    const handleSubmission = async (callback, data, successMessage) => {
        try {
            const response = await callback(data).unwrap();
            
            if (response.status === 1) {
                 onNew();
               
            } else {
                Toast.show({ type: 'success', text1: `${successMessage} Successfully` });
            }
           // refetch()
            userRefetch();
        } catch (error) {
            Toast.show({ type: 'error', text1: `Error: ${error.message}` });
        }
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
        isdefault: false 
      };
    }

    if (permission === 'isdefault') {
      updated[page] = {
        read: true,
        create: true,
        edit: true,
        delete: true,
        isdefault: true,
        ...(edit && { dbid: updated[page].dbid })
      };
    } else {
      updated[page] = {
        ...updated[page],
        [permission]: !updated[page][permission],
        isdefault: ['read', 'create', 'edit', 'delete'].every(
          p => p === permission ? !updated[page][p] : updated[page][p]
        )
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
           
            
    const permission_data=!edit ?  {...permissions,HOME:{ read: true,
        create: true,
        edit: true,
        delete: true,
        isdefault: true,roleName},DashBoard:{ read: true,
        create: true,
        edit: true,
        delete: true,
        isdefault: true,roleName}} : permissions
        
    const formData = { 
                roleName, 
                permissions:permission_data,
                ...(edit && {  roleName: CurrentEditingId }) // Include ID if in edit mode
            };

           

            const response = edit 
                ? await updateRole(formData).unwrap()
                : await createUserOnRole(formData).unwrap();
                
            if (response.data?.count > 0) {
                Toast.show({ 
                    type: 'success', 
                    text1: `Role ${edit ? 'Updated' : 'Created'} Successfully` 
                        });
                refetchCreatedRoles();
                onNew();
            }
        } catch (error) {
            Toast.show({ 
                type: 'error', 
                text1: `Error: ${error.message || 'Failed to save role'}` 
            });
        }
    };

    const handleUpdate = () => {
        const formData = { permissions, roleName: selectedRole };
        Alert.alert('Confirmation', 'Are you sure you want to Update the details?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => handleSubmission(updateUserOnRole, formData, 'User Updated') }
        ]);
    };

    const transformPermissions = (data) => {
        return data.reduce((acc, perm) => {
            acc[perm.link] = {
                dbid:perm?.dbid || perm?.id ,
                read: !!perm.read,
                create: !!perm.create,
                edit: !!perm.edit,
                delete: !!perm.delete,
                isdefault: !!perm.isdefault
            };
            return acc;
        }, {});
    };

  const editData = async (item) => {
setSelectedRole(undefined)
  try {
    // Set loading states
    setEdit(true);
    setDisabled(false);
    setRoleName(item.name);
    setSelectedRole(item?.name);
    setCurrentEditingId(item?.name);

    // Force refetch with the new RoleId
    const data=item.RoleOnPage 
    if (data) {
      setPermissions(transformPermissions(data));
    } else {
      Toast.show({
        type: 'error', 
        text1: 'No data returned for this role'
      });
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed to load role data',
      text2: error.message
    });
    console.error('Error fetching role data:', error);
  }
};
        
   


    const tableHead = ['Pages', 'read', 'create', 'edit', 'delete', 'Admin'];
    const tableData = (tabs || []).map(item => {
        if (!item.list) return null;
      
        
        const p = permissions[item.name] || {};
        return [
            item.list_name,
            ...['read', 'create', 'edit', 'delete', 'isdefault'].map(perm => {
                //  (item?.default) && handlePermissionChange(item.name, perm)
                
               return <TouchableOpacity 
                    key={perm}
                    disabled={item?.default || disabled}
                    style={[
                        styles.permissionCell,
                        p[perm] && styles.permissionActiveCell
                    ]}
                    onPress={() => handlePermissionChange(item.name, perm)}
                >
                    <Text style={styles.tickText}>{item?.default || p[perm] ? '✔' : ''}</Text>
                </TouchableOpacity>
    })
        ];
    }).filter(Boolean);




    


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

const { data: role, refetch: refetch_data} = useGetRolesOnPageQuery({RoleId: selectedRole || undefined })



//const filterRole=all_Role_names?.data?.filter((data))
 const filterRole=all_Role_names?.data?.filter((data)=>data?.RoleOnPage?.length==0)


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
            >
                <PullToRefresh data={role} keyExtractor={item => item.userName} refetch={userRefetch} />

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>User Information</Text>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Username:</Text>
                        <View style={styles.usernameContainer}>
                            <MaterialIcons name="person" size={20} color="#555" />
                            <Text style={styles.usernameText}>{username}</Text>
                        </View>

                       
                        <View style={styles.dropdownContainer}>
                         
                            <Dropdown
                                   selected={roleName}
                                    label={<Text>Select Role</Text>}
                                    setSelected={setRoleName}
                                    width={"100%"}
                                    _label={"name"}
                                    _value={"name"}
                                    options={{data:filterRole} || []}
                                     zIndex={300}
                                      />
                        </View>

                        {/* {edit && (
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.label}>Select Role:</Text>
                                <Dropdown
                                    selected={selectedRole}
                                    setSelected={setSelectedRole}
                                    options={role}
                                    style={styles.dropdown}
                                />
                            </View>
                        )} */}
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
                    
                    <View style={styles.tableContainer}>
                       <CustomDataTable
                                      title="Available Roles"
                                      data={get_created_roles?.data || []}
                                      fields={fields}
                                      onEdit={editData}
                                      onDelete={onDelete}
                                      itemsPerPage={3}
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
    </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    pageContainer: { flex: 1, position: 'relative' },
    scrollContainer: { paddingBottom: 8 ,width:"100%",padding:0},
    formContainer: { padding: 2 },
    label: { fontSize: 19, marginBottom: 5 },
    input: {
        height: 40,
        width: "100%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        padding:5
    },
    dropdown: { marginTop: 2 },
    tableContainer: { flex: 1, marginBottom: 2 },
    tableBorder: { borderWidth: 1, borderColor: 'gray' },
    head: { height: 40, backgroundColor: "#7999f2" },
    headText: { textAlign: "center", fontFamily: "Dosis-Bold",color:"white" },
    rows: { height: "auto", width: "auto", borderBottomWidth: 4 },
    permissionCell: { justifyContent: 'center', alignItems: 'center' },
    tickText: { textAlign: 'center', fontSize: 18 },
    cellText: { textAlign: 'center' },
    pageContainer: { 
        flex: 1, 
        position: 'relative',
        backgroundColor: '#f5f7fa',
    },
    scrollContainer: { 
        padding: 2,
        paddingBottom: 100 
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        width:"100%"
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    formContainer: { 
        padding: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
        marginBottom: 8,
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    usernameText: {
        fontSize: 16,
        marginLeft: 8,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#333',
    },
    dropdownContainer: {
        marginTop: 8,
    },
    dropdown: {
        marginTop: 2,
    },
    tableContainer: {
        flex: 1,
        marginBottom: 2,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableBorder: {
        borderWidth: 0,
    },
    head: {
        height: 48,
        backgroundColor: '#38c98d',
    },
    headText: {
        textAlign: 'center',
        fontWeight: '600',
        color: 'white',
        fontSize: 14,
    },
    rows: {
        height: 60,
        backgroundColor: 'white',
        padding:5
    },
    permissionCell: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        backgroundColor:"#f5f4f2",
        marginLeft:5
    },
    permissionActiveCell: {
        backgroundColor: '#E8F5E9',
    },
    pageNameText: {
        paddingLeft: 12,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    roleIndexText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
    },
    roleNameText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    cellText: {
        textAlign: 'center',
        fontSize: 14,
    },
});