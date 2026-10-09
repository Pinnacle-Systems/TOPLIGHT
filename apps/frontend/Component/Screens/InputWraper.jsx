import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import CustomInput from '../Inputs/CustomInput'
import CustomTimeInput from '../Inputs/TimeInput'
import CustomDateInput from '../Inputs/DateInput'
import CustomDropdownInput from '../Inputs/DropDownCustom'

function InputWraper({states=[],change}) {


  const InputContainer = StyleSheet.create({
    ContainerInp: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      paddingTop: 10,
      paddingBottom: 10,
      width: '100%',
    }
  });

  return (
    <View style={InputContainer.ContainerInp}> 
    {
        states?.map((data,index)=>{
          const labelComponent = data?.required ? (
            <Text>{data.label} <Text style={{color: 'red'}}>*</Text></Text>
          ) : (
            data.label
          );

          return  data?.type=="time" ? <CustomTimeInput props={data?.props || {}} isTimeInput={true}  key={index} id={data?.id} height={data?.style?.height} {...data?.style} state={data?.state} label={labelComponent}></CustomTimeInput>:  data?.type=="date" ? <CustomDateInput height={data?.style?.height}  props={data?.props || {}} isDateInput={true} key={index}  id={data?.id} {...data?.style} state={data?.state} label={labelComponent}></CustomDateInput> : data?.type=="select" ? <CustomDropdownInput rawLabel={data?.label} addOnVal_State={data?.addOnVal_State || undefined} addOnVal_Key={data?.addOnVal_Key || undefined} height={data?.style?.height} labelKey={data?.select?.labelKey} valueKey={data?.select?.valueKey} props={data?.props || {}} items_state={data?.option_data}  key={index} id={data?.id} {...data?.style} state={data?.state} label={labelComponent}></CustomDropdownInput>: <CustomInput change={change} height={data?.style?.height}  props={data?.props || {}} key={index} id={data?.id} {...data?.style} state={data?.state} label={labelComponent}></CustomInput>
        })
      }
    </View>
  )
}

export default InputWraper