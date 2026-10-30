import { View, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Animated, Text, Image, Alert, useWindowDimensions } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import   MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../../components/text/CustomText';
import { useGetCommonDataQuery, useGetCurrentMonthLeavesQuery, useGetLastMonthSalaryQuery, useGetMonthESIPFQuery, useGetOverTimeQuery, useGetYearWiseToTSalaryQuery, useGetInOutQuery, useGetMoreDetailsQuery } from '../../store/api/DashboardApi';
import  { UserProfileCard } from './UserProfile';
import { useSelector } from 'react-redux';
import { NumbertoCurrency } from '../../components/utils/NumberToCurrency';
import WorkingDaysChart from './chart/employee/WorkingDays';
import YearPicker from '../../components/modal/YearWiseModal';
import CameraModal from '../../components/modal/CameraModal';
import SkeletonLoader from '../../components/skeleton_loader/Skeleton';
import { LastMonthandYear, CurrentMonthandYear } from '../../components/utils/GetCurrentMonth';
import CommonModal from '../../components/modal/CommonModal';
import PfIndividualModalBody from './individual/card/PfIndividualModalBody';
import EsiIndividualModalBody from './individual/card/EsiIndividualModalBody';
import OTIndividualModalBody from './individual/card/OTIndividualModalBody';
import OTESIPFFilter from './individual/card/OTESIPFFilterBody';
import MoreSalaryDetails from './submodules/MoreSalaryDetails';
import EmployeeFilter from './chart/hod/EmployeeFilter';
import LoanCard from './card/LoanCard';
import ExpandableSearch from './FloatSearchView';
import SalarySummaryCard from './card/SalarySummaryCard';
import EsiPfOtCard from './card/EsiPfOtCard';
import { Common_Context } from '../../context/CommonContext';
import EmptyEmployeeCard from './card/TopCardEmpempty';
import LeaveSummaryCard from './card/LeaveSummeryCard';
import LeaveReport from './individual/card/LeaveReport';
import ImageResizer from 'react-native-image-resizer';
import { showMessage } from 'react-native-flash-message';
import { BASE_URL, USERS_API } from '@env';
import RNFetchBlob from 'rn-fetch-blob';
import ScreenRotationWrapper from '../../components/utils/ScreenRotateHandler';
import { useAppTheme } from '../../theme';

 const IMAGE_CONFIG = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 80,
  format: 'JPEG',
  maxFileSize: 2 * 1024 * 1024, // 2MB
};



export default function Employee({navigation,route}) {
  const { theme } = useAppTheme();
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
    borderTopColor: theme.colors.divider,
  },
  dueDateText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
    ChartContainer: {
      width: "100%",
      paddingBottom: 20,
    },
  
    ChartView: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 5,
        marginHorizontal: 12,
        backgroundColor: theme.colors.surface,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
  
    HeaderCustomText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 6,
    },
  
    metricCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginVertical: 8,
      borderLeftWidth: 6,
      borderLeftColor: theme.colors.accent,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
    MetricCard_end: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      width: '100%',
      height: 120,
      elevation: 4,
      shadowColor: theme.colors.shadow,
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
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
  
    MetricTitle_card: {
      fontSize: 15,
      fontWeight: '800',
      fontFamily: "Dosis-Bold",
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: "left",
    },
  
    MetricValue: {
      fontSize: 18,
      color: theme.colors.brand,
      fontWeight: 'bold',
    },
  
    Button: {
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.secondary,
      borderRadius: 25,
      textAlign: 'center',
      color: theme.colors.brandContrast,
      fontWeight: 'bold',
    },
  
    TopBox: {
      backgroundColor: theme.colors.brand,
    },
  
    fab: {
      position: 'absolute',
      bottom: "40%",
      right: -30,
      width: 65,
      height: 100,
      borderRadius: 30,
      backgroundColor: theme.colors.surfaceRaised,
      justifyContent: 'center',
      alignItems: "flex-start",
      elevation: 6,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      zIndex: 500,
      borderWidth: 0.6,
      borderColor: theme.colors.border,
    },
  
    MiniCard: {
      backgroundColor: theme.colors.success,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 10,
      width: 100,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
  
    MiniCard_Title: {
      fontSize: 13,
      color: theme.colors.brandContrast,
      fontWeight: "600",
      marginBottom: 4,
    },
  
    MiniCard_Value: {
      color: theme.colors.brandContrast,
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

    <View style={{ flex: 1, width: "100%", backgroundColor: theme.colors.background, overflow: 'hidden' }}>
      
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
      contentContainerStyle={{ paddingBottom: 32 }}
      style={{ flex: 1, width: "100%" }}>



          <UserProfileCard  USER={ filteredEmployeeId || UserId} picture={profilepicture} openCamera={setisCameraModel} ></UserProfileCard>
       
          {/* Professional Live Status Card */}
          {/* <LiveStatusCard UserId={UserId} /> */}

          {/* Attendance Performance Overview */}
          {/* <AttendanceStatsCard 
            workedDays={workedDays} 
            otHours={OtData?.OT}
            leavesTaken={Array.isArray(CurrentMonthLeaves?.data) ? CurrentMonthLeaves.data[0]?.LT : CurrentMonthLeaves?.data?.LT}
          /> */}

      
        {/* Main Dashboard Cards */}
        <View style={ChartStyle.ChartContainer}>
          {/* Last Month Salary Card */}
          <SalarySummaryCard
            grossSalary={LastMonthgrossSalaryAmount}
            netSalary={LastMonthSalaryAmount}
            period={selectMonthSalary?.format}
            onPress={() => SET_OPEN_MORE_SALARY(true)}
          />

          {/* Loan Card & Leave Summary Card */}
          <View style={{ width: '100%', flexDirection: isLandscape ? 'row' : 'column' }}>
            <View style={{ flex: isLandscape ? 1 : undefined, width: '100%' }}>
              <LoanCard
                key={1}
                loanName="Loan Amount"
                data={getLoan?.data}
                amount={1000}
                interestRate={100}
                term="feb 2024"
                dueDate="Jan 2024"
                onPress={() => console.log('Loan pressed:')}
              />
            </View>

            <View style={{ flex: isLandscape ? 1 : undefined, width: '100%' }}>
              <LeaveSummaryCard 
                leaveTaken={Array.isArray(CurrentMonthLeaves?.data) ? CurrentMonthLeaves.data[0]?.LT : CurrentMonthLeaves?.data?.LT} 
                UserId={UserId}
                availableLeaves={Array.isArray(CurrentMonthLeaves?.data) ? CurrentMonthLeaves.data[0]?.LBAL : CurrentMonthLeaves?.data?.LBAL} 
                openReport={setleavereportmodal}
                attendanceStatus={UserId?.INTIME ? "Present" : "Absent"}
                setopenLeaveModal={setYearOpenLeaveModal}
              />
            </View>
          </View>

          {/* ESI, PF & OT Card */}
          <EsiPfOtCard
            payperiod={esipfdataOnMonth?.PAYPERIOD || OTpfEsiPayperiod}
            esiAmount={NumbertoCurrency(esipfdataOnMonth?.esi || 0)}
            pfAmount={NumbertoCurrency(esipfdataOnMonth?.pf || 0)}
            otHours={OtData?.OT}
            otAmount={NumbertoCurrency(OtData?.OTAMT || 0)}
            onFilterPress={() => issetOpenYMEPO(true)}
            onEsiPress={() => issetIndividualEsiModel(true)}
            onPfPress={() => issetIndividualPFModel(true)}
            onOtPress={() => issetIndividualOTModel(true)}
          />

          {/* Attendance Chart */}
          {workingdatloading ? (
            <SkeletonLoader role="card" height={120} />
          ) : (
            <Animated.View style={{ opacity: animatedValue }}>
              <View style={ChartStyle.ChartView}>
                <TouchableOpacity 
                  onPress={() => setyearWiseModal(true)} 
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.brandSoft, alignItems: "center", justifyContent: "center" }}>
                      <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.colors.brand} />
                    </View>
                    <View>
                      <CustomText style={{ fontSize: 16, fontWeight: "700", color: theme.colors.text }}>Attendance Logs</CustomText>
                      <CustomText style={{ fontSize: 11, color: theme.colors.textSecondary }}>Year: {Year}</CustomText>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.brandSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 }}>
                    <MaterialCommunityIcons name="calendar-search" size={14} color={theme.colors.brand} />
                    <CustomText style={{ fontSize: 11, fontWeight: "700", color: theme.colors.brand }}>Select Year</CustomText>
                  </View>
                </TouchableOpacity>

                <WorkingDaysChart
                  isLoading={workingdatloading}
                  data={getWorkingDays?.data}
                  year={Year}
                  UserId={filteredEmployeeId || UserId}
                  setscroll={setscroll}
                />
              </View>
            </Animated.View>
          )}
        </View>

      


        

      </ScrollView>
}

    </View>
   </ScreenRotationWrapper>
  
);
}








