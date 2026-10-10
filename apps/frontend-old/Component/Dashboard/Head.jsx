import { View, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Animated, Text, Image, Alert, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../Navbar';
import WebView from 'react-native-webview';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import CustomText from '../Text/CustomText';
import { useGetAllEmployees_By_GENDER_BY_DEPARTMENTQuery, useGetCateogryToTSalaryQuery, useGetDepDataQuery, useGetDepWise_gender_attenceQuery, useGetgendercountQuery, useGetTotalHeadCountQuery, useGetTotalPAQuery, useGetYearWiseToTSalaryQuery, useToTexpensesQuery } from '../../redux/service/misDashboardService';
import FilterModel from '../FilterModal/FilterModel';
import CustomDropdownSelect from '../DropDownSelect/DropDownSelect';
import DepartMentWisalary from './Chart/Hod/DepartMentWiseSalary';
import { useSelector } from 'react-redux';
import FilterAnimation from './Chart/Utils/FilterAnim';
import { CurrentMonthandYear, LastMonthandYear } from '../Utils/getCurrentMonth';
import GenderWiseStrength from './Chart/Hod/GenderWiseStrength';
import LinearGradient from 'react-native-linear-gradient';
import { CustomNavigation } from '../Utils/NavigationRef';
import { TextOnlyDropdown } from '../../ReusableComponents/TextOnlyDropDown';
import { CustomDropdownList } from '../../ReusableComponents/CustomDropdownList';
import GenderHeadLineChart from './Chart/Hod/HeadCountChart';
import CommonModal from '../Modal/CommonModal';
import EmployeeHeadReport from './Chart/Hod/HeadCountRepot';
import Department_Gender_Attense_chart from './Chart/Hod/Department_Gender_Attense_chart';
import ScreenRotationWrapper from '../Utils/ScreenRotateHandler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LiveStatusCard from './Card/LiveStatusCard';

// ── Build ApexCharts HTML for WebView ──────────────────────────────────────────
const buildHodChart = (id, optionsJson, height = 260) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>*{font-family:'Inter',sans-serif!important;margin:0;padding:0;box-sizing:border-box;}body{background:transparent;overflow:hidden;}.apexcharts-text,.apexcharts-legend-text{font-size:11px!important;}</style>
</head>
<body>
  <div id="${id}"></div>
  <script>
    try{
      const chart=new ApexCharts(document.querySelector('#${id}'),${optionsJson});
      chart.render();
    }catch(e){document.body.innerHTML='<p style="color:red;padding:10px">'+e.message+'</p>';}
  </script>
</body>
</html>`;

export  function HeadofDepartMent({navigation}) {
 const [animatedValue] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const chartHeight = Dimensions.get('window').height * 0.3; 
  const chartWidth = screenWidth - 20;
  const {data, refetch: refetchSalary} = useGetYearWiseToTSalaryQuery(undefined, { pollingInterval: 60000, refetchOnMountOrArgChange: true })
  const [OpenHeadCountModel, setOpenHeadCountModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState()
  const [OpenPresentModal, setOpenPresntModal] = useState(false)
  const [OpenAbsentModal, setOpenAbsentModal] = useState(false)
  const [OpenCategoryWiseSalary, setOpenCategoryWiseSalary] = useState(false)
  const [cyear, setcyear] = useState()
  const [cMonth, setCMonth] = useState()
  const [visibleBottomNav, setVisibleBottomNav] = useState(false)
  const [tyear, settyear] = useState()
  const [tMonth, settMonth] = useState()
  // showChartView: 'charts' | 'details' | 'reports'
  const [showChartView, setShowChartView] = useState('charts');
  const [department_select,setdepartment_select]=useState()
  const UserId = useSelector((state => state?.UserDetails))
  const [departmentname,setdepartmentname]=useState()
  const {data: TotalHead, refetch:referesh_headcount,isLoading: TotalHeadLoading} = useGetTotalHeadCountQuery({dep:  departmentname || UserId?.DEPARTMENT}, { pollingInterval: 30000, refetchOnMountOrArgChange: true })
  const {data: getCateogryWiseSalary, isLoading: getCateogryWiseisLoading} = useGetCateogryToTSalaryQuery({params: {payperiod: cMonth && cyear ? cMonth+" "+cyear : LastMonthandYear,dep:  departmentname || UserId?.DEPARTMENT}})
  const [clickedGender,setClickedGender]=useState("")
  const [GenderWiseModel,setGenderWiseModel]=useState(false)
  const {data: getAP} = useGetTotalPAQuery({params: {USERNAME: UserId?.userName, COMPCODE: UserId?.GCOMPCODE}})
  //const {data: getToTExpenses, isLoading: getToTExpensesisLoading} = useToTexpensesQuery({params: {payperiod: tMonth && tyear ? tMonth+" "+tyear : LastMonthandYear}})
  const {data: getGenderCount, isLoading: getGenderCountLoading} = useGetgendercountQuery({params: {COMPCODE: UserId?.GCOMPCODE}}, { pollingInterval: 60000, refetchOnMountOrArgChange: true })
  const {data:department,error}=useGetDepDataQuery()
  const {data:get_gender_wise_attence, refetch: refetchAttend}=useGetDepWise_gender_attenceQuery({dep:departmentname ||  UserId?.DEPARTMENT }, { pollingInterval: 15000, refetchOnMountOrArgChange: true })
  const TotalDepartment = TotalHead?.data && TotalHead.data?.reduce((cum, acc) =>{return {value:Number(cum.value) + Number(acc.value),MALE:Number(cum.MALE) + Number(acc.MALE),FEMALE:Number(cum.FEMALE) + Number(acc.FEMALE)}}, {value:0,MALE:0,FEMALE:0})
  const apData=get_gender_wise_attence?.data?.[0]
  const {data:genderanddepartment_wise_data,isLoading:isLoadingheads}=useGetAllEmployees_By_GENDER_BY_DEPARTMENTQuery({gender:clickedGender,dep:  departmentname || UserId?.DEPARTMENT})

  // ── Pull-to-refresh ───────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchSalary(), referesh_headcount(), refetchAttend()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  // ── Report Charts (built with real data) ───────────────────────────────
  const salaryRows = Array.isArray(data?.data) ? data.data : [];
  const salaryYears = [...new Set(salaryRows.map(r => r.YEAR || r[0]))].filter(v => v != null).sort().slice(-3);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Chart R1: Salary Trend — Area Line
  const SalaryTrendHTML = buildHodChart('sal', JSON.stringify({
    series: salaryYears.map(yr => ({
      name: String(yr),
      data: months.map((_, mi) => {
        const r = salaryRows.find(row => row.YEAR === yr && Number(row.MONTH) === mi + 1);
        return r ? Number(r.SALARY) || 0 : 0;
      })
    })).length ? salaryYears.map(yr => ({
      name: String(yr),
      data: months.map((_, mi) => {
        const r = salaryRows.find(row => 
          Number(row.YEAR || row[0]) === Number(yr) && 
          (Number(row.MONTH || row[1]) === mi + 1 || (row.MONTH || row[1])?.toString()?.toLowerCase()?.startsWith(months[mi].toLowerCase()))
        );
        return r ? Number(r.SALARY || r.AMOUNT || r.value || r[2]) || 0 : 0;
      })
    })) : [{ name: 'Salary', data: Array(12).fill(0) }],
    chart: { type: 'area', height: 250, toolbar: { show: false }, animations: { enabled: true, speed: 700 } },
    colors: ['#4f46e5', '#10b981', '#f59e0b'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.02, stops: [20, 100] } },
    xaxis: { categories: months, labels: { style: { fontSize: '9px' } } },
    yaxis: { labels: { formatter: v => v >= 100000 ? (v/100000).toFixed(1)+'L' : v, style: { fontSize: '9px' } } },
    legend: { show: true, position: 'top', fontSize: '11px' },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 3 },
    tooltip: { y: { formatter: v => '₹' + v.toLocaleString('en-IN') } },
  }), 250);

  // Chart R2: Gender Strength Donut
  const headRows = Array.isArray(TotalHead?.data) ? TotalHead.data : [];
  const totalM = headRows.reduce((s,d) => s + (Number(d.MALE)||0), 0);
  const totalF = headRows.reduce((s,d) => s + (Number(d.FEMALE)||0), 0);
  const GenderDonutHTML = buildHodChart('gd', JSON.stringify({
    series: [totalM, totalF],
    chart: { type: 'donut', height: 220 },
    colors: ['#3b82f6', '#ec4899'],
    labels: ['Male', 'Female'],
    plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '12px', fontWeight: 700, formatter: () => String(totalM + totalF) } } } } },
    dataLabels: { enabled: true, formatter: v => v.toFixed(1) + '%', style: { fontSize: '10px' } },
    legend: { show: true, position: 'bottom', fontSize: '11px', offsetY: 4 },
    stroke: { width: 0 },
  }), 220);

  // Chart R3: Category-wise Salary Pie
  const salCatRows = Array.isArray(getCateogryWiseSalary?.data) ? getCateogryWiseSalary.data : [];
  const SalCatHTML = buildHodChart('sc', JSON.stringify({
    series: salCatRows.slice(0,8).map(r => Number(r.SALARY || r.AMOUNT || r[1])||0),
    chart: { type: 'pie', height: 230 },
    colors: ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'],
    labels: salCatRows.slice(0,8).map(r => r.CATEGORY || r.CAT || r.IDNAME || r[0] || 'Other'),
    dataLabels: { enabled: true, formatter: v => v.toFixed(1)+'%', style: { fontSize: '10px' } },
    legend: { show: true, position: 'bottom', fontSize: '10px', offsetY: 4 },
    stroke: { width: 1, colors: ['#fff'] },
  }), 230);

  // Chart R4: Attendance Gender Monthly Bar
  const AttHTML = buildHodChart('att', JSON.stringify({
    series: [
      { name: 'Male Present',   data: [apData?.PMALE   || 0] },
      { name: 'Female Present', data: [apData?.PFEMALE || 0] },
      { name: 'Male Absent',    data: [apData?.AMALE   || 0] },
      { name: 'Female Absent',  data: [apData?.AFEMALE || 0] },
    ],
    chart: { type: 'bar', height: 220, toolbar: { show: false } },
    colors: ['#3b82f6', '#ec4899', '#ef4444', '#f97316'],
    plotOptions: { bar: { borderRadius: 5, columnWidth: '60%' } },
    dataLabels: { enabled: true, style: { fontSize: '10px' } },
    xaxis: { categories: ['Today'], labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { style: { fontSize: '10px' } } },
    legend: { show: true, position: 'top', fontSize: '10px' },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  }), 220);

  // Chart R5: Attendance Rate Radial Gauge
  const totalHC = headRows.reduce((s,d) => s + (Number(d.value)||0), 0);
  const totalP  = (apData?.PMALE || 0) + (apData?.PFEMALE || 0);
  const attRate = totalHC > 0 ? Number(((totalP / totalHC) * 100).toFixed(1)) : 0;
  const RadialHTML = buildHodChart('rad', JSON.stringify({
    series: [attRate],
    chart: { type: 'radialBar', height: 220 },
    colors: attRate >= 80 ? ['#10b981'] : attRate >= 60 ? ['#f59e0b'] : ['#ef4444'],
    plotOptions: {
      radialBar: {
        hollow: { size: '55%' },
        track: { background: '#f1f5f9', strokeWidth: '100%', margin: 5 },
        dataLabels: {
          name: { fontSize: '12px', color: '#64748b', offsetY: -4 },
          value: { fontSize: '24px', fontWeight: '800', color: '#0f172a', formatter: v => v + '%' },
        },
      },
    },
    labels: ['Attendance'],
  }), 220);

  const ChartStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 80,
    },
    header: {
      flexDirection: 'row',
      justifyContent: "center",
      alignItems: 'center',
      marginBottom: 10,
      
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#1e293b',
    },
    metricsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 12,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      width: '100%',
      borderWidth: 1,
      borderColor: '#f1f5f9',
    },
    metricCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      width: '48%',
      borderWidth: 1,
      borderColor: '#f1f5f9',
    },
    metricTitle: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 8,
      fontWeight: '500',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1e293b',
    },
    metricSubtitle: {
      fontSize: 12,
      color: '#94a3b8',
      marginTop: 4,
    },
    chartContainer: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#f1f5f9',
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: 16,
    },
    filterButton: {
      backgroundColor: '#f1f5f9',
      padding: 8,
      borderRadius: 8,
      marginBottom:10
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 8,
    },
    genderItem: {
      alignItems: 'center',
      flex: 1,
      backgroundColor: '#f8fafc',
      padding: 12,
      borderRadius: 8,
    },
    genderIcon: {
      marginBottom: 8,
    },
    genderValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b',
    },
    genderLabel: {
      fontSize: 12,
      color: '#64748b',
      marginTop: 4,
    },
    gradientCard: {
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      overflow: 'hidden',
      position: 'relative',
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    departmentDropdown: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 8,
      padding: 5,
      marginBottom: 16,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      gap: 12,
    },
    statItem: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: 12,
      borderRadius: 8,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: 'white',
      textAlign: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: 16,
      marginTop: 8,
    },
  });

  const toggleStyles = StyleSheet.create({
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 0,
      marginHorizontal: 8,
      marginTop: 4,
      backgroundColor: '#f1f5f9',
      borderRadius: 12,
      padding: 4,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeToggle: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    toggleText: {
      fontWeight: '600',
      color: '#64748b',
      fontSize: 12,
    },
    activeToggleText: {
      color: '#4f46e5',
      fontWeight: '700',
    },
  });



  const renderMetricCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity onPress={onPress} style={[ChartStyle.metricCard, {borderLeftWidth: 4, borderLeftColor: color}]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <View>
          <Text style={ChartStyle.metricTitle}>{title}</Text>
          <Text style={ChartStyle.metricValue}>{value}</Text>
        </View>
        <View style={{backgroundColor: `${color}20`, padding: 8, borderRadius: 8}}>
          {React.cloneElement(icon, {color: color})}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGenderStats = () => (
    <View style={ChartStyle.genderContainer}>
      <View style={[ChartStyle.genderItem, {backgroundColor: '#e0e7ff'}]}>
        <Fontisto name="male" size={20} color="#4f46e5" style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.PMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Male Present</Text>
      </View>
      <View style={[ChartStyle.genderItem, {backgroundColor: '#fce7f3'}]}>
        <Fontisto name="female" size={20} color="#db2777" style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.PFEMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Female Present</Text>
      </View>
      <View style={[ChartStyle.genderItem, {backgroundColor: '#fee2e2'}]}>
        <Fontisto name="male" size={20} color="#dc2626" style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.AMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Male Absent</Text>
      </View>
      <View style={[ChartStyle.genderItem, {backgroundColor: '#ffedd5'}]}>
        <Fontisto name="female" size={20} color="#ea580c" style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.AFEMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Female Absent</Text>
      </View>
    </View>
  );

  

  

  return (
    <ScreenRotationWrapper>
        <View style={{ flex: 1, backgroundColor: '#f5f5f5', width: "100%"}}>
  {/* 3-way View Toggle: Charts / Details / Reports */}
        <View style={toggleStyles.toggleContainer}>
          <TouchableOpacity
            style={[toggleStyles.toggleButton, showChartView === 'charts' && toggleStyles.activeToggle]}
            onPress={() => setShowChartView('charts')}
          >
            <Text style={[toggleStyles.toggleText, showChartView === 'charts' && toggleStyles.activeToggleText]}>
              <FontAwesome name="bar-chart" size={13} />  Charts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[toggleStyles.toggleButton, showChartView === 'details' && toggleStyles.activeToggle]}
            onPress={() => setShowChartView('details')}
          >
            <Text style={[toggleStyles.toggleText, showChartView === 'details' && toggleStyles.activeToggleText]}>
              <FontAwesome name="list-ol" size={13} />  Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[toggleStyles.toggleButton, showChartView === 'reports' && toggleStyles.activeToggle]}
            onPress={() => setShowChartView('reports')}
          >
            <Text style={[toggleStyles.toggleText, showChartView === 'reports' && toggleStyles.activeToggleText]}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={13} />  Reports
            </Text>
          </TouchableOpacity>
        </View>
   {/* Filter Modals */}
      <View style={{position: 'absolute'}}>
         <CommonModal height={"70%"} isModalVisible={GenderWiseModel} Title='Employees' BodyComponent={<EmployeeHeadReport des={selectedDepartment} dep={UserId?.DEPARTMENT} isLoading={isLoadingheads || TotalHeadLoading || false}  gender={clickedGender} data={genderanddepartment_wise_data?.data}></EmployeeHeadReport>} setIsModalVisible={setGenderWiseModel}></CommonModal>
        <FilterModel close="direct" modalVisible={OpenHeadCountModel} setModalVisible={setOpenHeadCountModal} name="Head Count Filter">
          <CustomDropdownSelect close="direct" width={screenWidth/1.3} setCloseModal={setOpenHeadCountModal} items={TotalHead?.data} selectedValue={selectedDepartment} setSelectedValue={setSelectedDepartment} />
        </FilterModel>
        <FilterModel modalVisible={OpenCategoryWiseSalary} setModalVisible={setOpenCategoryWiseSalary} name="Category Wise Salary">
          <CustomDropdownSelect placeholder={"select Year"} isyear={true} selectedValue={cyear} setSelectedValue={setcyear} />
          <CustomDropdownSelect placeholder={"select Month"} ismonth={true} selectedValue={cMonth} setSelectedValue={setCMonth} />
        </FilterModel>
      </View>

      <ScrollView
        contentContainerStyle={ChartStyle.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
      >
        {/* Header */}
        <View style={ChartStyle.header}>
          <Text style={ChartStyle.headerTitle}><MaterialIcons name="dashboard" size={24} color="black" />Department Dashboard</Text>
        </View>

        {/* Live Status Card */}
        {/* <LiveStatusCard UserId={UserId} /> */}

        {/* Main Headcount Card */}
             {showChartView === 'charts' ? (
          // Chart View
          <LinearGradient
          colors={['#4f46e5', '#7c3aed']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={ChartStyle.gradientCard}
        >
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[ChartStyle.metricTitle, {color: 'rgba(255,255,255,0.8)'}]}>
              Department Overview
            </Text>
            <TouchableOpacity 
              onPress={() => setOpenHeadCountModal(true)}
              style={ChartStyle.filterButton}
            >
              <AntDesign name="filter" size={16} color="#9007eb" />
            </TouchableOpacity>
          </View>
          


{
  !UserId?.DEPARTMENT ? 

            <CustomDropdownList
              auto_open={false}
              selected={department_select}
              placeholder={"Select Department"}
              label={<Text style={{fontWeight:"bold", color:"white"}}> {department_select  ?? "Select Department"}</Text>}
              _label={"name"}
              onselected={(data)=>{
                setSelectedDepartment("")
                referesh_headcount()
                setdepartmentname(data?.label)
              
              }}
              _value={"id"}
              container={ChartStyle.departmentDropdown}
              labelstyle={{padding: 0, marginBottom: -10}}
              setSelected={setdepartment_select}
              options={department}
              zIndex={300}
              textColor="white"
            />

            :

            <Text style={{color:"white"}}>
             Department Of {UserId?.DEPARTMENT}
            </Text>

            }
          
       {
        selectedDepartment?.MALE ||  TotalDepartment  ? 
        <GenderHeadLineChart
         clickedGender={clickedGender}
         chnage_data={selectedDepartment} 
         showChartView={showChartView}
          setClickedGender={setClickedGender}
          setopenModal={setGenderWiseModel}
           departmentData={selectedDepartment ? {data:[{MALE:selectedDepartment?.MALE,FEMALE:selectedDepartment?.FEMALE}] } :  {data:[TotalDepartment]}}
          
         />
        : <></>
        }
         

          
          
          {/* <View style={ChartStyle.statRow}>

            <View style={ChartStyle.statItem}>
              <Text style={ChartStyle.statValue}>{selectedDepartment?.value || TotalDepartment?.value}</Text>
              <Text style={ChartStyle.statLabel}>Total</Text>
            </View>
            <View style={ChartStyle.statItem}>
              <Text style={ChartStyle.statValue}>{selectedDepartment?.MALE??TotalDepartment?.MALE}</Text>
              <Text style={ChartStyle.statLabel}>Male</Text>
            </View>
            <View style={ChartStyle.statItem}>
              <Text style={ChartStyle.statValue}>{selectedDepartment?.FEMALE??TotalDepartment?.FEMALE}</Text>
              <Text style={ChartStyle.statLabel}>Female</Text>
            </View>
            <View style={ChartStyle.statItem}>
              <Text style={ChartStyle.statValue}>
                {((selectedDepartment?.FEMALE??TotalDepartment?.FEMALE) / 
                 (selectedDepartment?.value??TotalDepartment?.value) * 100).toFixed(1)}%
              </Text>
              <Text style={ChartStyle.statLabel}>Female %</Text>
            </View>
          </View> */}
        </LinearGradient>
        ): (
        <LinearGradient 
          colors={['#4f46e5', '#7c3aed']} 
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 1}}
          style={ChartStyle.gradientCard}
        >
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[ChartStyle.metricTitle, {color: 'rgba(255,255,255,0.8)'}]}>
              Department Overview
            </Text>
            <TouchableOpacity 
              onPress={() => setOpenHeadCountModal(true)}
              style={ChartStyle.filterButton}
            >
              <AntDesign name="filter" size={16} color="#9007eb" />
            </TouchableOpacity>
          </View>
          
             {

              !UserId?.DEPARTMENT  ? 
             
            <CustomDropdownList
              auto_open={false}
              selected={department_select}
              placeholder={"Select Department"}
              label={<Text style={{fontWeight:"bold", color:"white"}}> {department_select  ?? "Select Department"}</Text>}
              _label={"name"}
              onselected={(data)=>{
                setSelectedDepartment("")
                referesh_headcount()
                setdepartmentname(data?.label)
              
              }}
              _value={"id"}
              container={ChartStyle.departmentDropdown}
              labelstyle={{padding: 0, marginBottom: -10}}
              setSelected={setdepartment_select}
              options={department}
              zIndex={300}
              textColor="white"
            />
             :
<Text style={[ChartStyle.metricValue, {color: 'white', fontSize: 21,marginBottom:5}]}>
           Department of  {
              UserId?.DEPARTMENT 
            }
          </Text>

            }
          
          <Text style={[ChartStyle.metricValue, {color: 'white', fontSize: 40}]}>
            {selectedDepartment?.value || TotalDepartment?.value}
          </Text>
          <Text style={[ChartStyle.metricSubtitle, {color: 'rgba(255,255,255,0.8)'}]}>
            Total Department Strength
          </Text>
          
          <View style={ChartStyle.statRow}>
            <View style={ChartStyle.statItem}>
              <Text style={ChartStyle.statValue}>{selectedDepartment?.MALE??TotalDepartment?.MALE}</Text>
              <Text style={ChartStyle.statLabel}>Male</Text>
            </View>
            <View style={ChartStyle.statItem}>
              <Text style={ChartStyle.statValue}>{selectedDepartment?.FEMALE??TotalDepartment?.FEMALE}</Text>
              <Text style={ChartStyle.statLabel}>Female</Text>
            </View>
            <View style={ChartStyle.statItem}>
              <Text style={ChartStyle.statValue}>
                {((selectedDepartment?.FEMALE??TotalDepartment?.FEMALE) / 
                 (selectedDepartment?.value??TotalDepartment?.value) * 100).toFixed(1)}%
              </Text>
              <Text style={ChartStyle.statLabel}>Female %</Text>
            </View>
          </View>
        </LinearGradient>) }



       

        {/* Key Metrics Section 
          setClickedGender={setClickedGender}
             setopenModal={setGenderWiseModel}
        clickedGender={clickedGender}
        */}
        
        {showChartView === 'charts' ?  <Department_Gender_Attense_chart  departmentData={{data:[{MALE_PRESENT:apData?.PMALE || 0,FEMALE_PRESENT:apData?.PFEMALE || 0,MALE_ABSENT:apData?.AMALE || 0,FEMALE_ABSENT:apData?.AFEMALE || 0}]}}
         /> :  showChartView === 'details' ? (<>
        <Text style={ChartStyle.sectionTitle}>Attendance Details</Text>
        <View style={ChartStyle.metricsContainer}>
          {renderMetricCard(
            'Total Present', 
            (apData?.PMALE || 0) + (apData?.PFEMALE || 0),
            <FontAwesome name="check-circle" size={18} color="#10b981" />,
            '#10b981',
            () => setOpenPresntModal(true)
          )}
          
          {renderMetricCard(
            'Total Absent', 
            (apData?.AMALE || 0) + (apData?.AFEMALE || 0),
            <FontAwesome name="times-circle" size={18} color="#ef4444" />,
            '#ef4444',
            () => setOpenAbsentModal(true)
          )}
          
          {renderMetricCard(
            'Male Present', 
            apData?.PMALE || 0,
            <Fontisto name="male" size={18} color="#3b82f6" />,
            '#3b82f6'
          )}
          
          {renderMetricCard(
            'Female Present', 
            apData?.PFEMALE || 0,
            <Fontisto name="female" size={18} color="#ec4899" />,
            '#ec4899'
          )}
        </View>

        {/* Gender Breakdown */}
        <View style={ChartStyle.card}>
          <Text style={ChartStyle.chartTitle}>Attendance Breakdown</Text>
          {renderGenderStats()}
        </View>
         </>) : null }

        {/* Reports Section — 5 ApexCharts via WebView */}
        {showChartView === 'reports' && (
          <>
            {/* Banner */}
            <View style={{ backgroundColor: '#1e3a8a', borderRadius: 14, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Department Reports</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>{UserId?.DEPARTMENT || 'All Departments'} • Today's Live Status</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 10 }}>
                <MaterialCommunityIcons name="chart-areaspline" size={22} color="#fff" />
              </View>
            </View>

            {/* R1: Salary Trend Area Chart */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, elevation: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>Salary Trend (Year-wise)</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>Area chart • All months</Text>
              <View style={{ height: 250 }}>
                <WebView key={`salary-trend-${salaryYears.join('-')}`} originWhitelist={['*']} source={{ html: SalaryTrendHTML }}
                  style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
              </View>
            </View>

            {/* R2 + R3 side by side: Gender Donut & Salary Category Pie */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 2 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>Gender Split</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>Donut chart</Text>
                <View style={{ height: 220 }}>
                  <WebView key={`gender-donut-${totalM}-${totalF}`} originWhitelist={['*']} source={{ html: GenderDonutHTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
              </View>
              <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 2 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>Salary by Category</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>Pie chart</Text>
                <View style={{ height: 220 }}>
                  <WebView key={`salary-cat-${salCatRows.length}`} originWhitelist={['*']} source={{ html: SalCatHTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
              </View>
            </View>

            {/* R4: Attendance Gender Bar */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, elevation: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>Attendance Breakdown</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>Grouped bar chart • Today</Text>
              <View style={{ height: 220 }}>
                <WebView originWhitelist={['*']} source={{ html: AttHTML }}
                  style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
              </View>
            </View>

            {/* R5: Attendance Rate Radial Gauge + Stats */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, elevation: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>Attendance Rate</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>Radial gauge • {LastMonthandYear}</Text>
              <View style={{ height: 220 }}>
                <WebView originWhitelist={['*']} source={{ html: RadialHTML }}
                  style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
              </View>
              {/* Stat pills below the gauge */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingHorizontal: 8 }}>
                <View style={{ alignItems: 'center', backgroundColor: '#f0fdf4', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#10b981' }}>{totalP}</Text>
                  <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Present</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: '#fef2f2', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#ef4444' }}>{(apData?.AMALE||0)+(apData?.AFEMALE||0)}</Text>
                  <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Absent</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: '#eff6ff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#3b82f6' }}>{totalHC}</Text>
                  <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Total</Text>
                </View>
              </View>
            </View>
          </>
        )}
        
        {/* Gender Distribution Chart */}
       {showChartView === 'charts' &&  <Animated.View style={{opacity: animatedValue}}>
          <View style={ChartStyle.chartContainer}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={ChartStyle.chartTitle}>Gender Distribution</Text>
              <TouchableOpacity style={ChartStyle.filterButton}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <GenderWiseStrength 
              isLoading={getGenderCountLoading} 
              data={getGenderCount?.data}  
              UserId={UserId} 
            />
          </View>
        </Animated.View> }

        {/* Salary Distribution Chart */}

              {showChartView === 'charts' &&
        <Animated.View style={{opacity: animatedValue}}>
          <View style={ChartStyle.chartContainer}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={ChartStyle.chartTitle}>Salary Distribution</Text>
              <TouchableOpacity 
                onPress={() => setOpenCategoryWiseSalary(true)}
                style={ChartStyle.filterButton}
              >
                <MaterialCommunityIcons name="filter-outline" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {OpenCategoryWiseSalary ? (
              <FilterAnimation />
            ) : (
              <>
                <DepartMentWisalary 
                  data={getCateogryWiseSalary?.data} 
                  isLoading={getCateogryWiseisLoading}
                />
                <Text style={{textAlign: 'center', color: '#64748b', marginTop: 8}}>
                  {cMonth && cyear ? `${cMonth} ${cyear}` : LastMonthandYear}
                </Text>
              </>
            )}
          </View>
        </Animated.View>
    }

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={ChartStyle.fab}
        onPress={() => CustomNavigation('HOME')}
      >
        <MaterialCommunityIcons name="home" size={24} color="white" />
      </TouchableOpacity>

      </View>
   </ScreenRotationWrapper>
  );
}