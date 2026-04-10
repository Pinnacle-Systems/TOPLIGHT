import { View, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Animated, Text, Image, Alert, useWindowDimensions } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import   MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import  FontAwesome5  from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../Text/CustomText';
import { useGetCommonDataQuery, useGetCurrentMonthLeavesQuery, useGetLastMonthSalaryQuery, useGetMonthESIPFQuery, useGetOverTimeQuery, useGetYearWiseToTSalaryQuery, useGetInOutQuery, useGetMoreDetailsQuery } from '../../redux/service/misDashboardService';
import CustomDropdown from '../DropDown/CustomDropDown';
import UserProfile, { UserProfileCard } from './UserProfile';
import { useGetUserBasicDetailsQuery } from '../../redux/service/user';
import { useSelector } from 'react-redux';
import { NumbertoCurrency } from '../Utils/NumberToCurrency';
import LoanProgressBar from './Chart/Employee/LoanChart';
import WorkingDaysChart from './Chart/Employee/WorkingDays';
import YearPicker from '../Modal/YearWiseModal';
import CameraViewModal from '../Modal/CameraModal';
import CameraScreen from '../Modal/CameraModal';
import CameraModal from '../Modal/CameraModal';
import SkeletonLoader from '../SkeletonLoader/Skeleton';
import CustomDropdownSelect from '../DropDownSelect/DropDownSelect';
import CustomizeButton from '../Buttons/CustomizeButton';
import { LastMonthandYear, CurrentMonthandYear } from '../Utils/getCurrentMonth';
import CommonModal from '../Modal/CommonModal';
import PfIndividualModalBody from './Individual/Card/PfIndividualModalBody';
import EsiIndividualModalBody from './Individual/Card/EsiIndividualModalBody';
import OTIndividualModalBody from './Individual/Card/OTIndividualModalBody';
import OTESIPFFilter from './Individual/Card/OTESIPFFilterBody';
import MoreSalaryDetails from './SubModules/MoreSalaryDetails';
import { TextInput } from 'react-native-paper';
import EmployeeFilter from './Chart/Hod/EmployeeFilter';
import LoanCard from './Card/LoanCard';
import ExpandableSearch from './FloatSearchView';
import CreditAnimation from './SubModules/CreditAmountAnim';
import SalaryAdvanceCard from './Card/AdvanceCard';
import { Common_Context } from '../../Context/Common_Context';
import EmptyEmployeeCard from './Card/Top_Card_Emp_empty';
import LeaveSummaryCard from './Card/LeaveSummeryCard';
// import LiveStatusCard from './Card/LiveStatusCard';
import LeaveReport from './Individual/Card/LeaveReport';
import RecentActivityCard from './Card/RecentActivityCard';
import AttendanceStatsCard from './Card/AttendanceStatsCard';
import ImageResizer from 'react-native-image-resizer';
import { showMessage } from 'react-native-flash-message';
import { BASE_URL, USERS_API } from '../../constants/apiUrl';
import RNFetchBlob from 'rn-fetch-blob';
import tailwind from 'twrnc';
import ScreenRotationWrapper from '../Utils/ScreenRotateHandler';

 const IMAGE_CONFIG = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 80,
  format: 'JPEG',
  maxFileSize: 2 * 1024 * 1024, // 2MB
};



export default function Employee({navigation,route}) {
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height;
  const filterEmpId=route?.params
  const [animatedValue] = useState(new Animated.Value(0));
  const UserId=useSelector((state=>state?.UserDetails))
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraModal,setisCameraModel]=useState(false)
  const [profilepicture,setprofilepicture]=useState()
  const [selectMonthSalary,setSelectMonthSalary]=useState({date:new Date(),format:""})
  const screenWidth = width;
  const chartHeight = Dimensions.get('window').height * 0.3; 
  const [Year,setYear]=useState(new Date().getFullYear())
  const chartWidth = screenWidth - 20;
  const [scroll,setscroll]=useState(true)
  const [yearWiseModal,setyearWiseModal]=useState(false)
  const [epMonth,setepMonth]=useState()
  const [epyear,setepyear]=useState()
  const [isIndividualEsiModel,issetIndividualEsiModel]=useState(false)
  const [isIndividualPFModel,issetIndividualPFModel]=useState(false)
  const [isIndividualOTModel,issetIndividualOTModel]=useState(false)
  const [isOpenYMEPO,issetOpenYMEPO]=useState(false)
  const [OTESIPF_Year,set_OTESIPF_Year]=useState()
  const [OTESIPF_Month,set_OTESIPF_Month]=useState()
  const [isFilter_Employee,issetFilter_Employee]=useState(false)
  const [tempsearch,set_tempsearch]=useState("")
  const [filteredEmployeeId,setFilteredEmpId]=useState()
  const {admin,page}=useContext(Common_Context)
  const [OPEN_MORE_SALARY,SET_OPEN_MORE_SALARY]=useState(false)
  const [openYearLeaveModal,setYearOpenLeaveModal]=useState(false)
  const [leaveyaer,setleaveyear]=useState("")

  const [leaveReportmodal,setleavereportmodal]=useState(false)


 
  
  useEffect(()=>{
    if(filterEmpId?.filterEmpId){
      
   setFilteredEmpId(filterEmpId?.UserId)
    }
  },[filterEmpId?.UserId])

  



  console.log("finyear",UserId);
  


  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  const ChartStyle = StyleSheet.create({
      dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  dueDateText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
    ChartContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      gap: 3,
      paddingBottom: 16,
    },
  
    ChartView:{
        borderRadius: 16,
        padding: 20,
        marginVertical: 3,
        marginHorizontal: 16,
        backgroundColor: "#FFF",
        width: screenWidth - 32,
        // Improved shadow
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 4,
        // Border for Android
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.05)'
      },
  
    HeaderCustomText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 6,
    },
  
    metricCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 16,
      marginVertical: 8,
      borderLeftWidth: 6,
      borderLeftColor: '#5f27cd', // dynamic based on context
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
    MetricCard_end: {
      backgroundColor: '#fcfafa',
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      width: '100%',
      height: 120,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      justifyContent: "center",
      alignItems: 'center',
    },
  
    MetricTitle: {
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "Dosis-Bold",
      color: '#6d6d70',
      marginBottom: 6,
    },
  
    MetricTitle_card: {
      fontSize: 15,
      fontWeight: '800',
      fontFamily: "Dosis-Bold",
      color: '#1f1f1f',
      marginBottom: 12,
      textAlign: "left",
    },
  
    MetricValue: {
      fontSize: 18,
      color: '#1B81DB',
      fontWeight: 'bold',
    },
  
    Button: {
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: '#747f91',
      borderRadius: 25,
      textAlign: 'center',
      color: '#fff',
      fontWeight: 'bold',
    },
  
    TopBox: {
      backgroundColor: "#69b6f5",
    },
  
    fab: {
      position: 'absolute',
      bottom: "40%",
      right: -30,
      width: 65,
      height: 100,
      borderRadius: 30,
      backgroundColor: "rgba(255, 255, 255, 0.86)",
      justifyContent: 'center',
      alignItems: "flex-start",
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      zIndex: 500,
      borderWidth: 0.6,
      borderColor: "#c5c7c9",
    },
  
    MiniCard: {
      backgroundColor: '#15b35a', // Default, override with inline bgColor
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 10,
      width: 100,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
      shadowColor: "#bec1c4",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
  
    MiniCard_Title: {
      fontSize: 13,
      color: "white",
      fontWeight: "600",
      marginBottom: 4,
    },
  
    MiniCard_Value: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
    },
  });
  
 
//APPROVALSTATUS='APPROVED' no is here pf bharani bhriya
const {data:LastMonthSalary,isLoading:IsLoadingMoreSalary}=useGetLastMonthSalaryQuery({Idcard:filteredEmployeeId || UserId?.UserId})
const LastMonthSalaryAmount=NumbertoCurrency(LastMonthSalary?.data?.salary || 0)
const LastMonthgrossSalaryAmount=NumbertoCurrency(LastMonthSalary?.data?.gross || 0)
const {data:getLoan,refetch}=useGetCommonDataQuery({table:"HRMPAYTRANS",fields:"SUM(TOTPAIDAMT) Totalpaid,Sum(TOTLOANAMT) TOTLOANAMT,sum(DUEAMT) DUE,sum(NOOFINS) INS,max(TO_CHAR(TODATE,'DD-MM-YYYY')) END",where:`IDCARD='${filteredEmployeeId || UserId?.UserId}' and ACTUAL='T' and active='YES' and ADVTYPE='Loan'  group by IDNAME `})
const {data:getWorkingDays,isLoading:workingdatloading}=useGetCommonDataQuery({table:`${UserId?.GCOMPCODE}HPAYROLL`,fields:"PAYPERIOD,wdays",where:` EMPID='${filteredEmployeeId || UserId?.UserId}' and pctype='ACTUAL' and PAYPERIOD like '%${Year}' `,map:"false"})




const handleImageProcessing = async (imageUri) => {
        try {
           
            
            // First get file info
            const fileInfo = await RNFetchBlob.fs.stat(imageUri);
            const fileSize = fileInfo.size;
            
            // If file is already within size limit, return original
            if (fileSize <= IMAGE_CONFIG.maxFileSize) {
                return imageUri;
            }
            
            // Calculate resize ratio based on how much we need to reduce
            const sizeRatio = Math.sqrt(IMAGE_CONFIG.maxFileSize / fileSize);
            const targetWidth = Math.floor(IMAGE_CONFIG.maxWidth * sizeRatio);
            const targetHeight = Math.floor(IMAGE_CONFIG.maxHeight * sizeRatio);
            
            // Resize the image
            const resizedImage = await ImageResizer.createResizedImage(
                imageUri,
                targetWidth,
                targetHeight,
                IMAGE_CONFIG.format,
                IMAGE_CONFIG.quality,
                0,
                null,
                false,
                { mode: 'stretch' }
            );
            
            // Verify the new size
            const newFileInfo = await RNFetchBlob.fs.stat(resizedImage.uri);
            if (newFileInfo.size > IMAGE_CONFIG.maxFileSize) {
                // If still too large, try with lower quality
                const furtherCompressed = await ImageResizer.createResizedImage(
                    resizedImage.uri,
                    targetWidth,
                    targetHeight,
                    IMAGE_CONFIG.format,
                    Math.floor(IMAGE_CONFIG.quality * 0.7), // Reduce quality further
                    0,
                    null,
                    false,
                    { mode: 'stretch' }
                );
                return furtherCompressed.uri;
            }
            
            return resizedImage.uri;
        } catch (error) {
            console.error('Image processing error:', error);
            throw error;
        } finally {
        }
    };


const onUploaddedPicture=async (pic)=>{
 const processedUri = await handleImageProcessing(pic);
 const formData=new FormData()

  let EmpName_removed_space=String(UserId?.EMPNAME).replace(/\s/g, '_')
   
        formData.append('file', {
                uri: processedUri,
                type: 'image/jpeg',
                name: `${UserId?.GCOMPCODE}_${EmpName_removed_space}_profile.jpg`
            });

             




              const response = await fetch(`${BASE_URL}/${USERS_API}/upload`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'compcode': UserId?.GCOMPCODE,
                                'Idcard':UserId?.UserId
                            },
                            body: formData
                        });
          
           
                        
            
                        const data = await response.json();
            
                        if (data?.status === 1) {
                          setprofilepicture(pic)
                            showMessage({
                                message: "Profile",
                                description: "Profile has been Changed",
                                type: "success",
                            });

                          }

  

}


// Alert.alert("",JSON?.stringify(CurrentMonthLeaves))

var OTpfEsiPayperiod= epMonth  && epyear ? epMonth+" "+epyear : LastMonthandYear



const {data:esipfdata,error:err}=useGetMonthESIPFQuery({params:{
  Idcard:filteredEmployeeId || UserId?.UserId ,payperiod:OTpfEsiPayperiod
}})
const {data:OverTimedata,isLoading:IsOverTimeLoading}=useGetOverTimeQuery({params:{
  Idcard: filteredEmployeeId || UserId?.UserId,payperiod:OTpfEsiPayperiod,COMPCODE:UserId?.GCOMPCODE
}})



 
const esipfdataOnMonth=esipfdata?.data ? esipfdata?.data[0] : {} 
const  OtData=OverTimedata?.data ? OverTimedata?.data?.reduce(function (acc, obj) { return {OTAMT:acc.OTAMT + obj.OTAMT,OT:acc.OT + obj.OT} }, {OTAMT:0,OT:0}) : {}



useEffect(()=>{
refetch()
},[Year])



const {data:recentInOut} = useGetInOutQuery({params:{
  Idcard: filteredEmployeeId || UserId?.UserId,
  payperiod: CurrentMonthandYear,
  COMPCODE: UserId?.GCOMPCODE
}})

const currentMonthData = getWorkingDays?.data?.find(m => m[0]?.startsWith(CurrentMonthandYear.split(' ')[0]));
const workedDays = currentMonthData ? currentMonthData[1] : 0;

useEffect(()=>{},[filteredEmployeeId])

const {data:CurrentMonthLeaves}=useGetCurrentMonthLeavesQuery({Idcard:filteredEmployeeId || UserId?.UserId,Year:String(leaveyaer)?.slice(-2) || undefined })

 return (<ScreenRotationWrapper>
   {/* {Number(LastMonthSalary?.data?.salary)>0 &&  <CreditAnimation user={UserId} admin={admin} amount={Number(LastMonthSalary?.data?.salary|| 0)} />} */}
 
    
 <ExpandableSearch 
  UserId={UserId}
  tempsearch={tempsearch}
  set_tempsearch={set_tempsearch}
  setFilteredEmpId={setFilteredEmpId}
  issetFilter_Employee={issetFilter_Employee}
/>


  <CameraModal visible={isCameraModal} USER={UserId} setVisible={setisCameraModel} onPictureTaken={onUploaddedPicture}></CameraModal>

    <View style={[{ flex: 1, padding: 10, width: "100%"},tailwind`bg-[#FFF] overflow-hidden`]}>
      
     
   {/*   <TouchableOpacity style={ChartStyle.fab}  onPress={()=>{navigation.navigate("HOME")}}>
        <Ionicons name="home" size={20} style={{paddingLeft:8}} color="#a4a0ad" />
      </TouchableOpacity>*/}
    {/*  <View style={[UserProfile?.UserDetailContainer,{width:"100%",height:"40%"}]} >
           <View style={UserProfile?.ImageContainer}>
            <Image width={"98%"} height={"90%"} style={{objectFit:"cover",borderRadius:19,opacity:.9}} source={{uri:"https://www.shutterstock.com/image-photo/young-smiling-successful-employee-business-600nw-2358608485.jpg"}}></Image>
            <View style={UserProfile?.BlurView}>
              <View style={{display:"flex",flexDirection:"row",justifyContent:"space-between"}}><CustomText style={[UserProfile?.BlurViewText,{fontSize:20,fontWeight:"bold"}]}> Harish</CustomText><CustomText style={[UserProfile?.BlurViewText,{fontSize:10,margin:10,fontWeight:"bold"}]}>20203003</CustomText></View>
              
              <CustomText style={UserProfile?.BlurViewText}>+91 6382158436</CustomText>
              <CustomText style={UserProfile?.BlurViewText}> Supervisor</CustomText>
            </View>
            </View>
      </View>*/}
  
    
  

<View style={{position:"absolute",top:0}}>

  <CommonModal height={"90%"} isModalVisible={leaveReportmodal} Title='Leave Report' BodyComponent={<LeaveReport UserId={filteredEmployeeId || UserId?.UserId}></LeaveReport>} setIsModalVisible={setleavereportmodal}></CommonModal>
      <CommonModal    maxHeightPercentage={0.9} height={isLandscape ? "90%" : "30%"}  isModalVisible={isIndividualEsiModel} Title='ESI FILTER' BodyComponent={<EsiIndividualModalBody UserId={ filteredEmployeeId || UserId?.UserId} CurrentESIAmt={NumbertoCurrency(esipfdataOnMonth?.esi  || 0)} CurrentYearandMonth={OTpfEsiPayperiod}></EsiIndividualModalBody>} setIsModalVisible={issetIndividualEsiModel}></CommonModal>
      <CommonModal    maxHeightPercentage={0.9} height={isLandscape ? "90%" : "30%"} isModalVisible={isIndividualPFModel} Title='PF FILTER' BodyComponent={<PfIndividualModalBody UserId={ filteredEmployeeId || UserId?.UserId}  CurrentPFAmt={NumbertoCurrency(esipfdataOnMonth?.esi  || 0)} CurrentYearandMonth={OTpfEsiPayperiod}></PfIndividualModalBody>} setIsModalVisible={issetIndividualPFModel}></CommonModal>
      <CommonModal    maxHeightPercentage={0.7} isModalVisible={isIndividualOTModel} Title='OT FILTER' BodyComponent={<OTIndividualModalBody UserId={filteredEmployeeId || UserId}  CurrentOTAmt={NumbertoCurrency(OtData?.OTAMT  || 0)}  CurrentYearandMonth={OTpfEsiPayperiod}></OTIndividualModalBody>} setIsModalVisible={issetIndividualOTModel}></CommonModal>
      <CommonModal    maxHeightPercentage={0.9} height={isLandscape ? "90%" : "30%"} isModalVisible={isOpenYMEPO} Title='OT & ESI &  PF FILTER' BodyComponent={<OTESIPFFilter year={OTESIPF_Year} setepYear={setepyear} setepMonth={setepMonth} setyear={set_OTESIPF_Year} Month={OTESIPF_Month} setMonth={set_OTESIPF_Month} closeModel={issetOpenYMEPO} CurrentYearandMonth={OTpfEsiPayperiod}></OTESIPFFilter>} setIsModalVisible={issetOpenYMEPO}></CommonModal>
       <YearPicker setIsModalVisible={setyearWiseModal} isModalVisible={yearWiseModal} setSelectedYear={setYear} selectedYear={Year}></YearPicker>
       <YearPicker setIsModalVisible={setYearOpenLeaveModal} isModalVisible={openYearLeaveModal} setSelectedYear={setleaveyear} selectedYear={leaveyaer}></YearPicker>
       <CommonModal   maxHeightPercentage={0.9}  height={isLandscape ? "90%" : "50%"}  isModalVisible={isFilter_Employee} Title='Employees' BodyComponent={<EmployeeFilter admin={admin} setFilteredEmpId={setFilteredEmpId}  USER={UserId} set_tempsearch={set_tempsearch} temp={tempsearch} closeModel={issetFilter_Employee} hod={UserId?.UserId}></EmployeeFilter>} setIsModalVisible={issetFilter_Employee}></CommonModal>
       <CommonModal   maxHeightPercentage={1}  height={isLandscape ? "90%" : "90%"} isModalVisible={OPEN_MORE_SALARY} BodyComponent={<MoreSalaryDetails data={LastMonthSalary?.data} isLoading={IsLoadingMoreSalary}></MoreSalaryDetails>} setIsModalVisible={SET_OPEN_MORE_SALARY} Title='Salary Details'></CommonModal>
       </View>
     
      {
        (admin==1 && !filteredEmployeeId) ? <EmptyEmployeeCard></EmptyEmployeeCard> :
      
      
      <ScrollView alwaysBounceVertical
      showsVerticalScrollIndicator={false}
      scrollEnabled={scroll}
      style={{ padding: 1,marginTop:-9, width: "100%" , 
        scrollbarThumbVertical: 'red', // Thumb color (Android only)
         scrollbarTrackVertical: '#f0f0f0',
          // Track color (Android only)
              }}>



          <UserProfileCard  USER={ filteredEmployeeId || UserId} picture={profilepicture} openCamera={setisCameraModel} ></UserProfileCard>
       
          {/* Professional Live Status Card */}
          {/* <LiveStatusCard UserId={UserId} /> */}

          {/* Attendance Performance Overview */}
          {/* <AttendanceStatsCard 
            workedDays={workedDays} 
            otHours={OtData?.OT}
            leavesTaken={Array.isArray(CurrentMonthLeaves?.data) ? CurrentMonthLeaves.data[0]?.LT : CurrentMonthLeaves?.data?.LT}
          /> */}

          {/* Recent Activity Timeline */}
          <RecentActivityCard 
            data={recentInOut?.data} 
            onDetailPress={() => setyearWiseModal(true)} 
          />
       
       
      
        {/* Metrics Section */}
   <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent:"center", gap: 1, marginVertical: 1}}>
  




  {/* Charts Section */}
        <View style={ChartStyle.ChartContainer}>

            {/* Last Month Salary Card */}
  
  
  <TouchableOpacity
  onPress={() => SET_OPEN_MORE_SALARY(true)}
  style={[{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: screenWidth - 31,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#15b35a',
    marginVertical: 3,
    
  
    
  },tailwind`bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden`]}
>
  <View style={{ flexDirection: 'column', gap: 1, flex: 1 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{
        backgroundColor: '#5abf11',
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FontAwesome5 name="wallet" size={20} color="white" />
      </View>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#2d3436',
        flex: 1,
        marginLeft:10
      }}>
        Last Month Salary
      </Text>
      <MaterialIcons name="chevron-right" size={24} color="#95a5a6" />
    </View>

    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between',
      marginTop: 8
    }}>
      <View style={{ flexDirection: 'column', gap: 4 }}>
        <Text style={{ 
          color: '#7f8c8d', 
          fontSize: 14, 
          fontWeight: '500' 
        }}>
          Gross Salary
        </Text>
        <Text style={{ 
          color: '#038024', 
          fontSize: 16, 
          fontWeight: '700' 
        }}>
          {LastMonthgrossSalaryAmount}
        </Text>
      </View>

      <View style={{ flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
        <Text style={{ 
          color: '#7f8c8d', 
          fontSize: 14, 
          fontWeight: '500' 
        }}>
          Net Received
        </Text>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '800', 
          color: '#15b35a' 
        }}>
          {LastMonthSalaryAmount}
        </Text>
      </View>
    </View>

    {selectMonthSalary?.format && (
      <View style={{
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 8
      }}>
        <Text style={{ 
          fontSize: 12, 
          color: '#7f8c8d',
          fontWeight: '500' 
        }}>
          {String(selectMonthSalary?.format)}
        </Text>
      </View>
    )}
  </View>
</TouchableOpacity>


   <SalaryAdvanceCard amount={NumbertoCurrency(LastMonthSalary?.data?.adv)}></SalaryAdvanceCard>

   
   <View style={{flexDirection:isLandscape? "row":"column"}}>
    <LoanCard
          key={1}
          loanName={"Loan Amount"}
          data={getLoan?.data}
          amount={1000}
          interestRate={100}
          term={"feb 2024"}
          dueDate={"Jan 2024"}
          onPress={() => console.log('Loan pressed:')}
        />

           {/* Absent Card */}

           <LeaveSummaryCard 
      leaveTaken={Array.isArray(CurrentMonthLeaves?.data) ? CurrentMonthLeaves.data[0]?.LT : CurrentMonthLeaves?.data?.LT} 
      UserId={UserId}
       availableLeaves={Array.isArray(CurrentMonthLeaves?.data) ? CurrentMonthLeaves.data[0]?.LBAL : CurrentMonthLeaves?.data?.LBAL} 
        openReport={setleavereportmodal}
         attendanceStatus={ UserId?.INTIME ?   "Present" : "Absent"}
        setopenLeaveModal={setYearOpenLeaveModal}
        />
        </View>


{/* <View
  style={{
    width: '100%',
    backgroundColor: '#f8fdff',
    borderRadius: 12,
    padding: 18,
    elevation: 4,
    shadowColor: '#2ac6d1',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#2ac6d1',
    marginVertical: 10,
  }}
>
  
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
    <MaterialCommunityIcons 
      name="calendar-clock" 
      size={22} 
      color="#11899b" 
      style={{ marginRight: 10 }}
    />
    <Text style={{ 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#11899b',
    }}>
      Leave Summary
    </Text>
  </View>


  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

    <View style={{ flex: 1 }}>
      <Text style={{ 
        fontSize: 13, 
        fontWeight: '500', 
        color: '#5a6b70',
        marginBottom: 6
      }}>
        <MaterialCommunityIcons name="calendar-remove" size={14} color="#e74c3c" /> Taken
      </Text>
      <Text style={{
        fontSize: 20,
        color: typeof CurrentMonthLeaves?.data?.Leave === 'string' ? '#e74c3c' : '#e74c3c',
        fontWeight: '700',
      }}>
        {typeof CurrentMonthLeaves?.data?.Leave === 'number'
          ? CurrentMonthLeaves?.data?.Leave + ' Days'
          : CurrentMonthLeaves?.data?.Leave}
      </Text>
    </View>

  
    <View style={{ width: 1, backgroundColor: '#e0e0e0', marginHorizontal: 10 }} />

    
    <View style={{ flex: 1 }}>
      <Text style={{ 
        fontSize: 13, 
        fontWeight: '500', 
        color: '#5a6b70',
        marginBottom: 6
      }}>
        <MaterialCommunityIcons name="calendar-check" size={14} color="#2ecc71" /> Available
      </Text>
      <Text style={{
        fontSize: 20,
        color: '#2ecc71',
        fontWeight: '700',
      }}>
        {typeof AvailableLeaves === 'number'
          ? AvailableLeaves + ' Days'
          : 'N/A'}
      </Text>
    </View>
  </View>

     <View style={ChartStyle.dueDateContainer}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={ChartStyle.dueDateText}>Today Status { <Text style={{color:"#c7c92e"}}>{UserId?.INTIME ?  "Today Presented" : "-----"}</Text>}</Text>
  </View>
</View> */}
{/* ESI, PF, OT Block */}
<Animated.View style={{ opacity: animatedValue }}>
  <View style={[ChartStyle.ChartView, { justifyContent: "center", padding: 16, borderRadius: 12, backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }]}>
    {/* Header with Filter */}
    <TouchableOpacity 
      onPress={() => issetOpenYMEPO(true)} 
      style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
      }}
    >
      <Text style={[ChartStyle.MetricTitle, { fontWeight: "600", color: "#333", fontSize: 16 }]}>
        ESI, PF & OT – {esipfdataOnMonth?.PAYPERIOD}
      </Text>
      <MaterialCommunityIcons name="filter-outline" size={20} color="#6d6d70" />
    </TouchableOpacity>

    {/* Cards Row */}
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
      {/* ESI Card */}
      <TouchableOpacity 
        onPress={() => issetIndividualEsiModel(true)} 
        style={[
          ChartStyle.MiniCard, 
          { 
            backgroundColor: "#f0faf4", 
            borderLeftWidth: 4, 
            borderLeftColor: "#15b35a",
            padding: 12,
            borderRadius: 8,
            flex: 1,
          }
        ]}
      >
        <CustomText style={[ChartStyle.MiniCard_Title, { color: "#15b35a", fontWeight: "500" }]}>ESI</CustomText>
        <CustomText style={[ChartStyle.MiniCard_Value, { color: "#333", fontSize: 17, fontWeight: "600" }]}>
          {NumbertoCurrency(esipfdataOnMonth?.esi || 0)}
        </CustomText>
      </TouchableOpacity>

      {/* PF Card */}
      <TouchableOpacity 
        onPress={() => issetIndividualPFModel(true)} 
        style={[
          ChartStyle.MiniCard, 
          { 
            backgroundColor: "#e8f9fb", 
            borderLeftWidth: 4, 
            borderLeftColor: "#2ac6d1",
            padding: 12,
            borderRadius: 8,
            flex: 1,
          }
        ]}
      >
        <CustomText style={[ChartStyle.MiniCard_Title, { color: "#2ac6d1", fontWeight: "500" }]}>PF</CustomText>
        <CustomText style={[ChartStyle.MiniCard_Value, { color: "#333", fontSize: 17, fontWeight: "600" }]}>
          {NumbertoCurrency(esipfdataOnMonth?.pf || 0)}
        </CustomText>
      </TouchableOpacity>

      {/* OT Card */}
      <TouchableOpacity 
        onPress={() => issetIndividualOTModel(true)} 
        style={[
          ChartStyle.MiniCard, 
          { 
            backgroundColor: "#f5edfc", 
            borderLeftWidth: 4, 
            borderLeftColor: "#a159d9",
            padding: 12,
            borderRadius: 8,
            flex: 1,
          }
        ]}
      >
        <CustomText style={[ChartStyle.MiniCard_Title, { color: "#a159d9", fontWeight: "500" }]}>Over Time</CustomText>
        <CustomText style={[ChartStyle.MiniCard_Value, { color: "#333", fontSize: 18, fontWeight: "600" }]}>
          {OtData?.OT} Hr
        </CustomText>
        <CustomText style={[ChartStyle.MiniCard_Value, { color: "#666", fontSize: 14, marginTop: 2 }]}>
          {NumbertoCurrency(OtData?.OTAMT || 0)}
        </CustomText>
      </TouchableOpacity>
    </View>
  </View>
</Animated.View>



 

{/* Attendance Chart */}
{
  workingdatloading ? (
    <SkeletonLoader role="card" height={120} />
  ) : (
    <Animated.View style={{ opacity: animatedValue }}>
      <View style={ChartStyle.ChartView}>
        <TouchableOpacity onPress={() => setyearWiseModal(true)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <CustomText style={ChartStyle.MetricTitle}>Attendance Logs</CustomText>
          <MaterialCommunityIcons name="filter-outline" size={16} color="#6d6d70" />
        </TouchableOpacity>

           <WorkingDaysChart
             isLoading={workingdatloading}
             data={getWorkingDays?.data}
            year={Year}
             UserId={filteredEmployeeId || UserId}
             setscroll={setscroll}
           />

        <CustomText style={[ChartStyle.MetricTitle, { textAlign: "center", fontSize: 10, marginTop: 8 }]}>
          Year: {Year}
        </CustomText>
      </View>
    </Animated.View>
  )
}

{/* Loan Progress Section */}
{/* <Animated.View style={{ opacity: animatedValue }}>
  <View style={[ChartStyle.ChartView, { justifyContent: "center" }]}>
    <CustomText style={[ChartStyle.MetricTitle, { marginLeft: 10 }]}>Loan Details</CustomText>
    <LoanProgressBar data={getLoan?.data} />
  </View>
</Animated.View> */}



</View>

 
    </View>

      


        

      </ScrollView>
}

    </View>
   </ScreenRotationWrapper>
  
);
}




