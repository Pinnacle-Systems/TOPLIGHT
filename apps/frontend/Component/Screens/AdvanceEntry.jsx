import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Master_Meta, Permission_Meta } from '../../redux/States/Master/Master';
import InputWraper from './InputWraper';
import { useDispatch, useSelector } from 'react-redux';
import { useGet__per_categoryQuery, useRequestPermissionMutation } from '../../redux/service/permission';
import { setInput } from '../../redux/Slices/inputsHandler';
import { formattedDate } from '../Utils/FormatedDate';
import { parseDateStringToISO } from '../Utils/FormateToISO';
import { showMessage } from 'react-native-flash-message';
import socket from '../Utils/Socket';
import { useGet_hod_tokenQuery, useGet_refresh_tokenQuery } from '../../redux/service/user';
import { _FCM_SENDER } from '../Utils/FCM';
import { screenWidth } from '../Utils/Screens';
import { useGet_LcodeQuery, useGetCurrent_FinYearQuery } from '../../redux/service/Leave';
import { calculateDateDifference } from '../Utils/Date_Differnet';
import { advance_Meta } from '../../redux/States/Transactions/Advance_Meta';
import { useAdd_requestAdvanceMutation, useGet_AdvanceQuery, useGet_Paycode_dataQuery, useGetDocIDQuery } from '../../redux/service/Advance';
import { AddMonth } from '../Utils/AddMonth';



const AdvanceEntry = () => {
    const InputState=useSelector((state)=>state?.Input?.Advance_state)
    const  {data:ref_token,isError:ref_token_error}=useGet_refresh_tokenQuery()
    const {data:get_per_category}=useGet__per_categoryQuery({type:"advance"})
    const {data:get_fin_year,error:fin_err}=useGetCurrent_FinYearQuery()
   
    
 const UserSelect=useSelector((state)=>state?.UserDetails)
 const [add_advanceRequest]=useAdd_requestAdvanceMutation()
    const {data,error,refetch}=useGetDocIDQuery()
    const dispatch=useDispatch()


 
    const {data:hodfcm,isLoading,isError,error:terr}=useGet_hod_tokenQuery({params:{hod:UserSelect?.hod}})
     const {data:paycode_data,isError:paycodeError}=useGet_Paycode_dataQuery({params:{ADVTYPE:InputState?.advtype}})

     useEffect(()=>{
        const {paycode}=paycode_data?.data?.length>0 ? paycode_data?.data[0]  : {paycode:""}
          dispatch(setInput({
              paycode,id: "Advance_state"}))
     },[paycode_data?.data,paycodeError])


     
   
    const handleSubmit = async () => {
        const {
          docid,
          docdate,
          idcard,
          fromDate,
          toDate,
          empname,
          category,
          finyear,
          advtype,
          total,
          preloan,
          totalloan,
          predue,
          ins,
          remark,
          paytype,
          due,
          paycode,
          fincode
        } = InputState;

      
        
        
     

        const docDateIso = parseDateStringToISO(docdate)
        const fromDateIso = parseDateStringToISO(fromDate)
        const toDateIso = parseDateStringToISO(toDate)
        const payload = {
         
          docid,
          docdate: new Date(docDateIso),
          idcard,
          fromDate: new Date(fromDateIso),
          toDate: new Date(toDateIso),
           hod: String(UserSelect?.hod),
         mobile: String(UserSelect?.MOBNO),
          empname,
          category,
          finyear,
          advtype,
          total: parseFloat(Number(total || 0)),
          preloan: 10,
          totalloan: parseFloat(Number(totalloan || 0)),
          predue:String(due),
          ins: parseInt(Number(ins || 0)),
          remark,
          paytype,
          due: parseFloat(Number(due  ||0)),
          compCode: UserSelect?.GCOMPCODE,
          createdBy: UserSelect?.UserId,
          modified_By: UserSelect?.UserId,
          userId: UserSelect?.UserId,
          paycode,
          hr:String(UserSelect?.hr),
          fincode
        };

    
        try {
      
          // Replace this with your actual API call for advance request
          const response = await add_advanceRequest({
            data: payload,
            params: { docCount: Number(data?.data?.count),companyid:UserSelect?.COMPID,PAYCAT:UserSelect?.PAYCAT}
          }).unwrap();
        
      
          if (response?.status == 1) {
            showMessage({
              message: "Advance Request",
              description: "Advance request sent successfully",
              type: "success",
            });
            ref_advance()
            refetch();
      
            // Reset form
            dispatch(setInput({
              fromDate: "",
              toDate: "",
              total: "",
              category: "",
              remark: "",
              advtype: "",
              finyear: "",
              preloan: "0",
              totalloan: "0",
              predue: "",
              ins: "0",
              id: "Advance_state",
              paytype:"",
              due:0
            }));
      
            // Notify via socket
            socket.emit("advance_request", {
              hod: UserSelect?.hod,
              compcode: UserSelect?.GCOMPCODE,
              userdata: {
                email: "",
                username: UserSelect?.userName,
                Idcard: UserSelect?.UserId,
                mobile: UserSelect?.MOBNO
              },
              ...response?.data
            });
          } else {
            showMessage({
              message: "Advance Request",
              description: response?.message || "Advance request failed",
              type: "danger",
            });
          }
      
          ref_advance()
      
          // Send FCM notification to HOD
          try {
            await _FCM_SENDER(
              ref_token?.data?.token,
              hodfcm?.data?.fcm,
              "Advance Request By: " + UserSelect?.EMPNAME,
              "Advance Request"
            );
          } catch (error) {
            console.error("Error sending notification:", error);
          }
      
        } catch (error) {
          showMessage({
            message: "Error",
            description: error.message || "Failed to submit advance request",
            type: "danger",
          });
        }
      };
    


  useEffect(()=>{
     const curruntYear=new Date().getFullYear().toString()
     var current_year_fin=Number(curruntYear?.slice(-2))+1
     var finyearformat=curruntYear?.slice(-2)+"-"+current_year_fin
     const finyear_data=get_fin_year?.data?.find((data)=>{return data?.value==finyearformat})
    dispatch(setInput({fin_options:get_fin_year?.data,finyear:finyear_data?.label,fincode:finyear_data?.finId,adv_options:[{label:"Salary Advance",value:"Salary Advance"},{label:"Loan",value:"Loan"}],pay_options:[{label:"Bank",value:"Bank"},{label:"Cash",value:"Cash"}],id:"Advance_state" }));
  },[get_fin_year?.data])

  useEffect(()=>{
    let num = data?.data?.count;
    let padded = num?.toString().padStart(6, '0');
      dispatch(setInput({ docid:  UserSelect?.GCOMPCODE+"/"+"ADV-"+padded,id:"Advance_state" }));
      dispatch(setInput({ docdate: formattedDate,id:"Advance_state" }));
       dispatch(setInput({ fromDate: formattedDate,id:"Advance_state" }));
      dispatch(setInput({ idcard: UserSelect?.UserId,id:"Advance_state" }));
      dispatch(setInput({ empname: UserSelect?.EMPNAME,id:"Advance_state" }));
    
    
  },[data])

  useEffect(()=>{
    dispatch(setInput({category_options:get_per_category?.data,id:"Advance_state" }));
  },[get_per_category])



   useEffect(()=>{
  
   if( InputState?.fromDate && InputState?.toDate){
  
 var differnce= calculateDateDifference(InputState?.fromDate,InputState?.toDate)
 
  dispatch(setInput({ totalDays:differnce,id:"Advance_state" }));
   }
 },[InputState?.fromDate,InputState?.toDate])



 const {data:get_Advance,refetch:ref_advance}=useGet_AdvanceQuery({params:{Idcard:UserSelect?.UserId,adv:InputState?.advtype}})
 const advance_data=get_Advance?.data[0]

  // Set advance data
  useEffect(() => {
    if (advance_data) {
      const newValues = {
        toDate: get_Advance?.TODATE,
        fromDate: String(advance_data?.FORMDATE || ""),
        predue: String(advance_data?.PREDUEAMT || 0),
        preloan: String(advance_data?.PRELOANAMT || 0),
        ins: String(advance_data?.NOOFINS || 0),
        id: "Advance_state"
      };
      
      // Only dispatch if values actually changed
      if (
        newValues.toDate !== InputState.toDate ||
        newValues.fromDate !== InputState.fromDate ||
        newValues.predue !== InputState.predue ||
        newValues.preloan !== InputState.preloan ||
        newValues.ins !== InputState.ins
      ) {
        dispatch(setInput(newValues));
      }
    }
  }, [advance_data]);

// Calculate total loan
  useEffect(() => {
    if ( InputState?.total) {
      const newTotalLoan = String((advance_data?.PRELOANAMT || 0) + Number(InputState.total || 0));
      if (newTotalLoan !== InputState.totalloan) {
        dispatch(setInput({ 
          totalloan: newTotalLoan || "0",
          id: "Advance_state" 
        }));
      }
    }
  }, [InputState?.total, advance_data?.PRELOANAMT]);


   // Calculate installments (only when needed)
  useEffect(() => {
  // Only run calculation when both due and total have valid values
  if (InputState?.due && InputState?.total && Number(InputState.totalloan) > 0) {
    const dueAmount = Number(InputState.due) || 0;
    const totalAmount = Number(InputState.totalloan) || 0;
 
    // Prevent division by zero and ensure valid calculation
    const newTotalIns = totalAmount > 0 ? Math.ceil(totalAmount/dueAmount) : 0;
    
   if(newTotalIns !== InputState?.ins){
      dispatch(setInput({ 
        ins: String(newTotalIns),
        toDate:AddMonth(newTotalIns),
        id: "Advance_state" 
      }));
    }
    
  }
}, [InputState?.due, InputState?.total]); 

const changeIns=(e)=>{
  if (e && InputState?.total && Number(InputState.totalloan) > 0) {
    const ins= Number(e) || 0;
    const totalAmount = Number(InputState.totalloan) || 0;
 
    // Prevent division by zero and ensure valid calculation
    const newTotalIns = totalAmount > 0 ? Math.ceil(totalAmount/ins) : 0;
    
   if(newTotalIns !== Number(e)){
      dispatch(setInput({ 
        due: String(newTotalIns),
        toDate:AddMonth(ins),
        id: "Advance_state" 
      }));
    }
    
  }
}



  if(error) return <View style={{flex:1,textAlign:"center"}}>
    <Text style={{color:"red"}}>Something Went Wrong !</Text>
  </View>

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Advance Entry</Text>
  <View style={styles.formContainer}>
      <InputWraper states={advance_Meta} change={[{name:"ins",fun:changeIns}]}></InputWraper>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      </View>

     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    textAlign: 'center',
    marginVertical: 2,
  },
  formContainer: {
    paddingHorizontal: 5,
    paddingBottom: 80,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    alignSelf: 'center',
    width: screenWidth - 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default AdvanceEntry;
