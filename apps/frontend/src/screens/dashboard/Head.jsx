import { View, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Animated, Text, Image, Alert, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';

import WebView from 'react-native-webview';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { useGetAllEmployees_By_GENDER_BY_DEPARTMENTQuery, useGetCateogryToTSalaryQuery, useGetDepDataQuery, useGetDepWise_gender_attenceQuery, useGetgendercountQuery, useGetTotalHeadCountQuery, useGetTotalPAQuery, useGetYearWiseToTSalaryQuery, useToTexpensesQuery } from '../../store/api/DashboardApi';
import FilterModel from '../../components/filter_modal/FilterModel';
import CustomDropdownSelect from '../../components/dropdown_select/DropDownSelect';
import DepartMentWisalary from './chart/hod/DepartMentWiseSalary';
import { useSelector } from 'react-redux';
import FilterAnimation from './chart/anim/FilterAnim';
import { CurrentMonthandYear, LastMonthandYear } from '../../components/utils/GetCurrentMonth';
import GenderWiseStrength from './chart/hod/GenderWiseStrength';
import LinearGradient from 'react-native-linear-gradient';
import { CustomNavigation } from '../../components/utils/NavigationRef';
import { CustomDropdownList } from '../../components/reusable_components/CustomDropdownList';
import GenderHeadLineChart from './chart/hod/HeadCountChart';
import CommonModal from '../../components/modal/CommonModal';
import EmployeeHeadReport from './chart/hod/HeadCountRepot';
import Department_Gender_Attense_chart from './chart/hod/DepartmentGenderAttenseChart';
import ScreenRotationWrapper from '../../components/utils/ScreenRotateHandler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../theme';

// ── Build ApexCharts HTML for WebView ──────────────────────────────────────────
const buildHodChart = (id, optionsJson, height = 260, theme) => `
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
      const options=${optionsJson};
      options.theme = options.theme || { mode: '${theme?.mode || 'light'}' };
      options.chart = options.chart || {};
      options.chart.foreColor = '${theme?.colors?.textSecondary || '#475569'}';
      const chart=new ApexCharts(document.querySelector('#${id}'),options);
      chart.render();
    }catch(e){document.body.innerHTML='<p style="color:red;padding:10px">'+e.message+'</p>';}
  </script>
</body>
</html>`;

export  function HeadofDepartMent({navigation}) {
 const { theme } = useAppTheme();
 const [animatedValue] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const {data, refetch: refetchSalary} = useGetYearWiseToTSalaryQuery(undefined, { pollingInterval: 60000, refetchOnMountOrArgChange: true })
  const [OpenHeadCountModel, setOpenHeadCountModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState()
  const [OpenPresentModal, setOpenPresntModal] = useState(false)
  const [OpenCategoryWiseSalary, setOpenCategoryWiseSalary] = useState(false)
  const [cyear, setcyear] = useState()
  const [cMonth, setCMonth] = useState()
  // showChartView: 'charts' | 'details' | 'reports'
  const [showChartView, setShowChartView] = useState('charts');
  const [department_select,setdepartment_select]=useState()
  const UserId = useSelector((state => state?.UserDetails))
  const [departmentname,setdepartmentname]=useState()
  const {data: TotalHead, refetch:referesh_headcount,isLoading: TotalHeadLoading} = useGetTotalHeadCountQuery({dep:  departmentname || UserId?.DEPARTMENT}, { pollingInterval: 30000, refetchOnMountOrArgChange: true })
  const {data: getCateogryWiseSalary, isLoading: getCateogryWiseisLoading} = useGetCateogryToTSalaryQuery({params: {payperiod: cMonth && cyear ? cMonth+" "+cyear : LastMonthandYear,dep:  departmentname || UserId?.DEPARTMENT}})
  const [clickedGender,setClickedGender]=useState("")
  const [GenderWiseModel,setGenderWiseModel]=useState(false)
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
    colors: theme.colors.chart.slice(0, 3),
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.02, stops: [20, 100] } },
    xaxis: { categories: months, labels: { style: { fontSize: '9px' } } },
    yaxis: { labels: { formatter: v => v >= 100000 ? (v/100000).toFixed(1)+'L' : v, style: { fontSize: '9px' } } },
    legend: { show: true, position: 'top', fontSize: '11px' },
    grid: { borderColor: theme.colors.divider, strokeDashArray: 3 },
    tooltip: { y: { formatter: v => '₹' + v.toLocaleString('en-IN') } },
  }), 250, theme);

  // Chart R2: Gender Strength Donut
  const headRows = Array.isArray(TotalHead?.data) ? TotalHead.data : [];
  const totalM = headRows.reduce((s,d) => s + (Number(d.MALE)||0), 0);
  const totalF = headRows.reduce((s,d) => s + (Number(d.FEMALE)||0), 0);
  const GenderDonutHTML = buildHodChart('gd', JSON.stringify({
    series: [totalM, totalF],
    chart: { type: 'donut', height: 220 },
    colors: [theme.colors.brand, theme.colors.accent],
    labels: ['Male', 'Female'],
    plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '12px', fontWeight: 700, formatter: () => String(totalM + totalF) } } } } },
    dataLabels: { enabled: true, formatter: v => v.toFixed(1) + '%', style: { fontSize: '10px' } },
    legend: { show: true, position: 'bottom', fontSize: '11px', offsetY: 4 },
    stroke: { width: 0 },
  }), 220, theme);

  // Chart R3: Category-wise Salary Pie
  const salCatRows = Array.isArray(getCateogryWiseSalary?.data) ? getCateogryWiseSalary.data : [];
  const SalCatHTML = buildHodChart('sc', JSON.stringify({
    series: salCatRows.slice(0,8).map(r => Number(r.SALARY || r.AMOUNT || r[1])||0),
    chart: { type: 'pie', height: 230 },
    colors: theme.colors.chart,
    labels: salCatRows.slice(0,8).map(r => r.CATEGORY || r.CAT || r.IDNAME || r[0] || 'Other'),
    dataLabels: { enabled: true, formatter: v => v.toFixed(1)+'%', style: { fontSize: '10px' } },
    legend: { show: true, position: 'bottom', fontSize: '10px', offsetY: 4 },
    stroke: { width: 1, colors: [theme.colors.surface] },
  }), 230, theme);

  // Chart R4: Attendance Gender Monthly Bar
  const AttHTML = buildHodChart('att', JSON.stringify({
    series: [
      { name: 'Male Present',   data: [apData?.PMALE   || 0] },
      { name: 'Female Present', data: [apData?.PFEMALE || 0] },
      { name: 'Male Absent',    data: [apData?.AMALE   || 0] },
      { name: 'Female Absent',  data: [apData?.AFEMALE || 0] },
    ],
    chart: { type: 'bar', height: 220, toolbar: { show: false } },
    colors: [theme.colors.brand, theme.colors.accent, theme.colors.danger, theme.colors.warning],
    plotOptions: { bar: { borderRadius: 5, columnWidth: '60%' } },
    dataLabels: { enabled: true, style: { fontSize: '10px' } },
    xaxis: { categories: ['Today'], labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { style: { fontSize: '10px' } } },
    legend: { show: true, position: 'top', fontSize: '10px' },
    grid: { borderColor: theme.colors.divider, strokeDashArray: 4 },
  }), 220, theme);

  // Chart R5: Attendance Rate Radial Gauge
  const totalHC = headRows.reduce((s,d) => s + (Number(d.value)||0), 0);
  const totalP  = (apData?.PMALE || 0) + (apData?.PFEMALE || 0);
  const attRate = totalHC > 0 ? Number(((totalP / totalHC) * 100).toFixed(1)) : 0;
  const RadialHTML = buildHodChart('rad', JSON.stringify({
    series: [attRate],
    chart: { type: 'radialBar', height: 220 },
    colors: attRate >= 80 ? [theme.colors.success] : attRate >= 60 ? [theme.colors.warning] : [theme.colors.danger],
    plotOptions: {
      radialBar: {
        hollow: { size: '55%' },
        track: { background: theme.colors.surfaceSunken, strokeWidth: '100%', margin: 5 },
        dataLabels: {
          name: { fontSize: '12px', color: theme.colors.textSecondary, offsetY: -4 },
          value: { fontSize: '24px', fontWeight: '800', color: theme.colors.text, formatter: v => v + '%' },
        },
      },
    },
    labels: ['Attendance'],
  }), 220, theme);

  const ChartStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 80,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 2,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerIcon: {
      width: 42,
      height: 42,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: theme.colors.brandSoft,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    headerCopy: {
      flex: 1,
    },
    headerSubtitle: {
      marginTop: 3,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    metricsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 12,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    metricCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      width: '48%',
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    metricTitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      fontWeight: '500',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
    },
    metricSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    chartContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    filterButton: {
      backgroundColor: theme.colors.surfaceSunken,
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
      backgroundColor: theme.colors.surfaceSunken,
      padding: 12,
      borderRadius: 8,
    },
    genderIcon: {
      marginBottom: 8,
    },
    genderValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    genderLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.brand,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: theme.colors.shadow,
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
      color: theme.colors.brandContrast,
      textAlign: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.brandContrast,
      opacity: 0.8,
      textAlign: 'center',
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
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
      backgroundColor: theme.colors.surfaceSunken,
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
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    toggleText: {
      fontWeight: '600',
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    activeToggleText: {
      color: theme.colors.brand,
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
      <View style={[ChartStyle.genderItem, {backgroundColor: theme.colors.brandSoft}]}>
        <Fontisto name="male" size={20} color={theme.colors.brand} style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.PMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Male Present</Text>
      </View>
      <View style={[ChartStyle.genderItem, {backgroundColor: theme.colors.accentSoft}]}>
        <Fontisto name="female" size={20} color={theme.colors.accent} style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.PFEMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Female Present</Text>
      </View>
      <View style={[ChartStyle.genderItem, {backgroundColor: theme.colors.dangerSoft}]}>
        <Fontisto name="male" size={20} color={theme.colors.danger} style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.AMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Male Absent</Text>
      </View>
      <View style={[ChartStyle.genderItem, {backgroundColor: theme.colors.warningSoft}]}>
        <Fontisto name="female" size={20} color={theme.colors.warning} style={ChartStyle.genderIcon} />
        <Text style={ChartStyle.genderValue}>{apData?.AFEMALE || 0}</Text>
        <Text style={ChartStyle.genderLabel}>Female Absent</Text>
      </View>
    </View>
  );

  

  

  return (
    <ScreenRotationWrapper>
        <View style={{ flex: 1, backgroundColor: theme.colors.background, width: "100%"}}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.brand]} />}
      >
        {/* Header */}
        <View style={ChartStyle.header}>
          <View style={ChartStyle.headerIcon}>
            <MaterialIcons name="dashboard" size={21} color={theme.colors.brand} />
          </View>
          <View style={ChartStyle.headerCopy}>
            <Text style={ChartStyle.headerTitle}>Department Dashboard</Text>
            <Text style={ChartStyle.headerSubtitle}>
              {UserId?.DEPARTMENT || 'Company-wide'} overview and insights
            </Text>
          </View>
        </View>

        {/* Live Status Card */}
        {/* <LiveStatusCard UserId={UserId} /> */}

        {/* Main Headcount Card */}
             {showChartView === 'charts' ? (
          // Chart View
          <LinearGradient
            colors={[
              theme.colors.brandStrong,
              theme.colors.accent,
            ]}
            start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={ChartStyle.gradientCard}
        >
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[ChartStyle.metricTitle, {color: theme.colors.brandContrast, opacity: 0.8}]}>
              Department Overview
            </Text>
            <TouchableOpacity 
              onPress={() => setOpenHeadCountModal(true)}
              style={ChartStyle.filterButton}
            >
              <AntDesign name="filter" size={16} color={theme.colors.brand} />
            </TouchableOpacity>
          </View>
          


{
  !UserId?.DEPARTMENT ? 

            <CustomDropdownList
              auto_open={false}
              selected={department_select}
              placeholder={"Select Department"}
              label={<Text style={{fontWeight:"bold", color:theme.colors.brandContrast}}> {department_select  ?? "Select Department"}</Text>}
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
              textColor={theme.colors.brandContrast}
            />

            :

            <Text style={{color:theme.colors.brandContrast}}>
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
          colors={[
            theme.colors.brandStrong,
            theme.colors.accent,
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={ChartStyle.gradientCard}
        >
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[ChartStyle.metricTitle, {color: theme.colors.brandContrast, opacity: 0.8}]}>
              Department Overview
            </Text>
            <TouchableOpacity 
              onPress={() => setOpenHeadCountModal(true)}
              style={ChartStyle.filterButton}
            >
              <AntDesign name="filter" size={16} color={theme.colors.brand} />
            </TouchableOpacity>
          </View>
          
             {

              !UserId?.DEPARTMENT  ? 
             
            <CustomDropdownList
              auto_open={false}
              selected={department_select}
              placeholder={"Select Department"}
              label={<Text style={{fontWeight:"bold", color:theme.colors.brandContrast}}> {department_select  ?? "Select Department"}</Text>}
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
              textColor={theme.colors.brandContrast}
            />
             :
<Text style={[ChartStyle.metricValue, {color: theme.colors.brandContrast, fontSize: 21,marginBottom:5}]}>
           Department of  {
              UserId?.DEPARTMENT 
            }
          </Text>

            }
          
          <Text style={[ChartStyle.metricValue, {color: theme.colors.brandContrast, fontSize: 40}]}>
            {selectedDepartment?.value || TotalDepartment?.value}
          </Text>
          <Text style={[ChartStyle.metricSubtitle, {color: theme.colors.brandContrast, opacity: 0.8}]}>
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
            <FontAwesome name="check-circle" size={18} color={theme.colors.success} />,
            theme.colors.success,
          )}
          
          {renderMetricCard(
            'Total Absent', 
            (apData?.AMALE || 0) + (apData?.AFEMALE || 0),
            <FontAwesome name="times-circle" size={18} color={theme.colors.danger} />,
            theme.colors.danger
          )}
          
          {renderMetricCard(
            'Male Present', 
            apData?.PMALE || 0,
            <Fontisto name="male" size={18} color={theme.colors.brand} />,
            theme.colors.brand
          )}
          
          {renderMetricCard(
            'Female Present', 
            apData?.PFEMALE || 0,
            <Fontisto name="female" size={18} color={theme.colors.accent} />,
            theme.colors.accent
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
            <View style={{ backgroundColor: theme.colors.brandStrong, borderRadius: 14, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: theme.colors.brandContrast, fontSize: 16, fontWeight: '800' }}>Department Reports</Text>
                <Text style={{ color: theme.colors.brandContrast, opacity: 0.75, fontSize: 11, marginTop: 2 }}>{UserId?.DEPARTMENT || 'All Departments'} • Today's Live Status</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 10 }}>
                <MaterialCommunityIcons name="chart-areaspline" size={22} color={theme.colors.brandContrast} />
              </View>
            </View>

            {/* R1: Salary Trend Area Chart */}
            <View style={[ChartStyle.card, { padding: 14, marginBottom: 12 }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 2 }}>Salary Trend (Year-wise)</Text>
              <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 10 }}>Area chart • All months</Text>
              <View style={{ height: 250 }}>
                <WebView key={`salary-trend-${salaryYears.join('-')}`} originWhitelist={['*']} source={{ html: SalaryTrendHTML }}
                  style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
              </View>
            </View>

            {/* R2 + R3 side by side: Gender Donut & Salary Category Pie */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={[ChartStyle.card, { flex: 1, padding: 12, marginBottom: 0 }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.text, marginBottom: 2 }}>Gender Split</Text>
                <Text style={{ fontSize: 10, color: theme.colors.textMuted, marginBottom: 8 }}>Donut chart</Text>
                <View style={{ height: 220 }}>
                  <WebView key={`gender-donut-${totalM}-${totalF}`} originWhitelist={['*']} source={{ html: GenderDonutHTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
              </View>
              <View style={[ChartStyle.card, { flex: 1, padding: 12, marginBottom: 0 }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.text, marginBottom: 2 }}>Salary by Category</Text>
                <Text style={{ fontSize: 10, color: theme.colors.textMuted, marginBottom: 8 }}>Pie chart</Text>
                <View style={{ height: 220 }}>
                  <WebView key={`salary-cat-${salCatRows.length}`} originWhitelist={['*']} source={{ html: SalCatHTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
              </View>
            </View>

            {/* R4: Attendance Gender Bar */}
            <View style={[ChartStyle.card, { padding: 14, marginBottom: 12 }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 2 }}>Attendance Breakdown</Text>
              <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 10 }}>Grouped bar chart • Today</Text>
              <View style={{ height: 220 }}>
                <WebView originWhitelist={['*']} source={{ html: AttHTML }}
                  style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
              </View>
            </View>

            {/* R5: Attendance Rate Radial Gauge + Stats */}
            <View style={[ChartStyle.card, { padding: 14, marginBottom: 12 }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 2 }}>Attendance Rate</Text>
              <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 6 }}>Radial gauge • {LastMonthandYear}</Text>
              <View style={{ height: 220 }}>
                <WebView originWhitelist={['*']} source={{ html: RadialHTML }}
                  style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
              </View>
              {/* Stat pills below the gauge */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingHorizontal: 8 }}>
                <View style={{ alignItems: 'center', backgroundColor: theme.colors.successSoft, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.success }}>{totalP}</Text>
                  <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>Present</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: theme.colors.dangerSoft, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.danger }}>{(apData?.AMALE||0)+(apData?.AFEMALE||0)}</Text>
                  <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>Absent</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: theme.colors.brandSoft, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.brand }}>{totalHC}</Text>
                  <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>Total</Text>
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
                <MaterialCommunityIcons name="dots-vertical" size={20} color={theme.colors.textSecondary} />
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
                <MaterialCommunityIcons name="filter-outline" size={20} color={theme.colors.textSecondary} />
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
                <Text style={{textAlign: 'center', color: theme.colors.textSecondary, marginTop: 8}}>
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
        <MaterialCommunityIcons name="home" size={24} color={theme.colors.brandContrast} />
      </TouchableOpacity>

      </View>
   </ScreenRotationWrapper>
  );
}
