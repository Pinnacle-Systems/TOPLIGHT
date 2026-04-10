import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { useCreateUserMutation, useGetCompanycodeQuery, useGetDesignationQuery, useGetEmployeeidsQuery, useGetUserDetQuery, useGetUsersQuery } from "../../redux/service/user";
import { Dropdown } from "../../ReusableComponents/inputs";
import FloatingButton from "../Buttons/Buttons";
import { showMessage } from 'react-native-flash-message';
import ClearState from "../Utils/ClearState";
import { useSelector } from "react-redux";
import { Checkbox } from "react-native-paper";
import { useGet_all_roleQuery } from "../../redux/service/RoleOn";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CheckboxLevelGroup from "./LeaveGroup";
import { useDelete_CommonMutation, useUpdate_CommonMutation } from '../../redux/service/commonMasters';
import { Colors } from "./../../constants/Colors";
import ProgressPopup from "../Utils/PopupLoading";
import CheckboxGroup from "../CheckBoxes/GroupCheckBox";

const { width, height } = Dimensions.get('window');

const Form = ({ closeModal, onClose, userDet }) => {
    const [selectedKey, setSelectedKey] = React.useState(null);
    const [username, setUserName] = useState("");
    const UserSelect = useSelector((state) => state?.UserDetails);
    const [loading, setloading] = useState(false);
    const [password, setPassword] = useState("");
    const [isotpEmail, setotpEmail] = useState();
    const [otpEmail, setotpEmail_inp] = useState({});
   
    const [selectedEmply, setSelectedEmply] = useState('');
    const [SelectedCompany, setSelectedCompany] = useState('');
    const [SelectedHod, setSelectedHod] = useState('');
    const [SelectedHR, setSelectedHR] = useState('');
    const [email, setEmail] = useState('');
    const [createUser] = useCreateUserMutation();
    const { data: tableData, refetch: refetchUsers } = useGetUsersQuery({});
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectLevel, setSelectedLevel] = useState("user");
    const [delete_row] = useDelete_CommonMutation();
    const [update_row] = useUpdate_CommonMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
     const { data: all_Role_names, refetch: get_all_refresh } = useGet_all_roleQuery({feilds:"COMPCODE",where:SelectedCompany});

  //  const { data: role, refetch } = useGetDesignationQuery();
    const { data: companyCode, refetch: companycoderef } = useGetCompanycodeQuery();
    const { data: employee, refetch: employeecoderef } = useGetEmployeeidsQuery();



   
    // Alert.alert("",JSON?.stringify(tableData))
    useEffect(() => {
        if (userDet) {
            editData(userDet);
        }
    }, [userDet]);

    useEffect(()=>{
    setIsEditing(false)
    },[])

    const validateData = (data) => {
        if (data.username && data.password) {
            return true;
        }
        return false;
    };

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            setloading(true);
            const response = await callback(data).unwrap();

            if (response.statusCode === 1) {
                showMessage({
                    message: "User Creation",
                    description: "Already Exist!",
                    type: "danger",
                });
            } else {
                showMessage({
                    message: "User Creation",
                    description: "Your User Create completed",
                    type: "success",
                });
                ClearState(setUserName, setPassword, setEmail, setSelectedCompany, setSelectedEmply, setSelectedRole, setSelectedHod);
                refetchUsers();
            }
            onClose &&  onClose();
        } catch (error) {
            console.log(`Error: ${error.message}`);
        } finally {
            setloading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        var Idcard=selectedEmply?.split("-")[1]
        var hod=SelectedHod?.split("-")[1]
        var hr=SelectedHR?.split("-")[1]

        if (selectLevel !== "admin"  && selectLevel !== "top" && (!selectedEmply || !SelectedHod || !username))
            return Alert.alert("⚠ Warning!", !selectedEmply ? "Please Select Your Employee" : !username ? "Please Enter Your UserName" : "Please Select Your Hod")

        var company_code = SelectedCompany?.map((data) => {
            var companyId = companyCode?.data?.find((cdata) => cdata?.value == data)
            return { companyCode: data, companyid: String(companyId?.COMPID),GCOMP:UserSelect?.GCOMPCODE }
        });

        var Id_card_Random=Date.now()+Math.floor(Math.random()*10000)

        const formData = { username,approval:selectedKey, roleId: selectedRole, otpemail: otpEmail,hr, password, email, hod, Idcard: selectLevel=="top" || selectLevel=="admin" ? String(Id_card_Random) : Idcard, Compcodes: company_code, level: selectLevel, isAdmin:selectLevel=="top" || selectLevel=="admin" ? true : false };

        if (!validateData(formData)) {
            Toast.show({
                type: "info",
                text1: "Please fill all required fields...!",
            });
            return;
        }

        Alert.alert(
            "Confirmation",
            "Are you sure you want to save the details?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => handleSubmitCustom(createUser, formData, "User Created"),
                },
            ],
            { cancelable: false }
        );
    };

    const editData =  useCallback(async (item) => {
        try {

           
            setIsEditing(true);
            setCurrentUserId(item.id);
            setUserName(item.username);
            setEmail(item.gmail);
            setotpEmail_inp(item?.otpemail)
           // setotpEmail(item?.otpemail)
           setSelectedHR(item?.role?.COMPCODE+"-"+item?.hr)
            setSelectedRole(item.roleId);
            setSelectedLevel(item.level);
            setSelectedKey(item?.approval)
            setSelectedEmply(item?.role?.COMPCODE+"-"+item.Idcard);
            setSelectedHod(item?.role?.COMPCODE+"-"+item.hod);
 
            if (item?.Companies) {
                const companyValues = item?.Companies.map(code => code.companyCode);
                setSelectedCompany(companyValues);
            }

            showMessage({
                message: "Edit Mode",
                description: "You're now editing an existing user",
                type: "info",
            });

        } catch (error) {
            showMessage({
                message: "Error",
                description: "Failed to load user data",
                type: "danger",
            });
            console.error('Error loading user data:', error);
        }
    },[isEditing])


   

    const onDelete = (id) => {
        
        Alert.alert(
            "Confirmation",
            "Are you sure you want to delete this user?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK",
                    onPress: () => handleDelete(id)
                }
            ]
        );
    };

    const handleDelete = async (id) => {
        try {
            setloading(true);
            const response = await delete_row({
                table: 'user',
                where: { id: id ,GCOMP:UserSelect?.GCOMPCODE},
                onlywhere:true
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
            console.error('Delete error:', error);
        } finally {
            setloading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setloading(true);
            const company_code = SelectedCompany?.map((data) => {
                const companyId = companyCode?.data?.find((cdata) => cdata?.value == data);
                return { companyCode: data, companyid: String(companyId?.COMPID),GCOMP:UserSelect?.GCOMPCODE };
            });

              var Idcard=selectedEmply?.split("-")[1]
              var hod=SelectedHod?.split("-")[1]
              var hr=SelectedHR?.split("-")[1]
             var Id_card_Random=Date.now()+Math.floor((Math?.random()*10000))
            const formData = {
                Compcodes: company_code,
                GCOMP:UserSelect?.GCOMPCODE,
                hr,
                username,
                 role: {
               connect: { name: selectedRole }  
                  },
                otpemail: otpEmail,
                password,
                email,
                hod,
                approval:selectedKey,
                Idcard:  selectLevel=="top" || selectLevel=="admin" ? String(Id_card_Random) : Idcard,
                level: selectLevel,
                user_updation:true,
                isAdmin:selectLevel=="top" || selectLevel=="admin" ? true : false 
            };

           

            const response = await update_row({
                table: 'user',
                data: formData,
                onlywhere:true,
                where: { id: currentUserId },
            }).unwrap();

           

            if (response?.status == 1) {
                showMessage({
                    message: "Success",
                    description: "User updated successfully",
                    type: "success",
                });
             refetchUsers();
             ClearState(setUserName, setPassword, setEmail, setSelectedCompany, setSelectedEmply, setSelectedRole, setSelectedHod);
               onClose && onClose();
            }
        } catch (error) {
            showMessage({
                message: "Error",
                description: "Failed to update user",
                type: "danger",
            });
            console.error('Update error:', error);
        } finally {
            setloading(false);
        }
    };

   const filterRole =all_Role_names  ?  (all_Role_names?.data?.length>0 ? all_Role_names?.data : [] )?.filter((data) => data?.RoleOnPage?.length > 0) : []

    return (<>
        {loading && (
            <ProgressPopup
                visible={loading}
                message={isEditing ? "Updating User Please wait....." : "Creating User Please wait....."}
            />
        )}
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {isEditing ? "Edit User" : "Create New User"}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <MaterialIcons name="close" size={24} color={Colors.darkGray} />
                    </TouchableOpacity>
                </View>

                {/* Company and Employee Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <Dropdown
                        selected={SelectedCompany}
                        label="Select Company"
                        multiple={true}
                        setSelected={setSelectedCompany}
                        options={companyCode}
                        zIndex={300}
                        style={styles.dropdown}
                    />

                    <Dropdown
                        selected={selectedEmply}
                        label="Select Employee"
                        setSelected={setSelectedEmply}
                        options={employee}
                        zIndex={300}
                        style={styles.dropdown}
                    />
                </View>

                {/* User Role and Level */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>User Role</Text>

                    <CheckboxLevelGroup
                        selected={selectLevel}
                        setSelected={setSelectedLevel}
                        style={styles.levelGroup}
                    />

                    <Dropdown
                        selected={selectedRole}
                        label="Select Pages Role"
                        setSelected={setSelectedRole}
                        _label={"name"}
                        _value={"name"}
                        options={{ data:filterRole  } || []}
                        zIndex={300}
                        style={styles.dropdown}
                    />

                    {(selectLevel === "user" || selectLevel === "hod") && (
                        <Dropdown
                            selected={SelectedHod}
                            label="Select HOD"
                            setSelected={setSelectedHod}
                            options={employee}
                            zIndex={300}
                            style={styles.dropdown}
                        />
                    )}


                    {(selectLevel === "user" || selectLevel === "hod") && (
                        <Dropdown
                            selected={SelectedHR}
                            label="Select HR"
                            setSelected={setSelectedHR}
                            options={employee}
                            zIndex={300}
                            style={styles.dropdown}
                        />
                    )}

                      <Text >Approval Request TO:</Text>
                    <CheckboxGroup selectedKey={selectedKey} setSelectedKey={setSelectedKey} options={["HOD","HR","BOTH"]}></CheckboxGroup>
                </View>

                {/* Login Credentials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Login Credentials</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username*</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUserName}
                            style={styles.input}
                            placeholder="Enter username"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password*</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            secureTextEntry
                            placeholder="Enter password"
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
                                !isotpEmail && setotpEmail_inp(e);
                                setEmail(e);
                            }}
                            style={styles.input}
                            placeholder="Enter email"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.otpEmailRow}>
                            <Text style={styles.label}>OTP Email</Text>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => {
                                    if (isotpEmail) {
                                        setotpEmail_inp('');
                                    } else {
                                        setotpEmail_inp(email);
                                    }
                                    setotpEmail(!isotpEmail);
                                }}
                            >
                                <Checkbox
                                    status={isotpEmail ? 'checked' : 'unchecked'}
                                    color={Colors.primary}
                                />
                                <Text style={styles.checkboxLabel}>Different from Email</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={otpEmail}
                            onChangeText={setotpEmail_inp}
                            style={styles.input}
                            placeholder="Enter OTP email"
                            keyboardType="email-address"
                            editable={isotpEmail}
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

                    {tableData?.data ? (
                        tableData.data.map((item, index) => (
                            <View
                                key={index}
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
                                        <MaterialIcons name="edit" size={20} color={Colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => onDelete(item.id)}
                                        style={[styles.actionButton, { marginLeft: 10 }]}
                                    >
                                        <MaterialIcons name="delete" size={20} color={Colors.error} />
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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightBackground,
        position: "relative"
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.dark,
    },
    closeButton: {
        padding: 4,
    },
    section: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.darkText,
        marginBottom: 12,
    },
    dropdown: {
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.darkGray,
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: Colors.white,
    },
    otpEmailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 14,
        color: Colors.darkGray,
        marginLeft: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: "#38c98d",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableHeaderText: {
        fontWeight: 'bold',
        color: Colors.white,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: Colors.border,
    },
    evenRow: {
        backgroundColor: Colors.white,
    },
    oddRow: {
        backgroundColor: Colors.lightGray,
    },
    tableCell: {
        textAlign: 'center',
        fontSize: 14,
        color: Colors.darkText,
    },
    noDataText: {
        textAlign: 'center',
        padding: 16,
        color: Colors.darkGray,
    },
    levelGroup: {
        marginBottom: 16,
    },
    actionButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
    },
});

export default Form;