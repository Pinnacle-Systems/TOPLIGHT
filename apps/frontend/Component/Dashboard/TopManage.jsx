import {
  View, Dimensions, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Text, Image, RefreshControl
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../Navbar';
import WebView from 'react-native-webview';
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from 'react-native-vector-icons';
import CustomText from '../Text/CustomText';
import {
  useGetYearWiseToTSalaryQuery,
  useGetgendercountQuery,
  useGetTotalHeadCountQuery,
  useGetDepWise_gender_attenceQuery,
} from '../../redux/service/misDashboardService';
import { useGet_live_userQuery } from '../../redux/service/Onduty';
import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import { UserProfileCard } from './UserProfile';
import CustomizeProfile_Higher_Pos from './CustomizeProfile_Higher_Pos';
import FilterModel from '../FilterModal/FilterModel';
import CustomDropdownSelect from '../DropDownSelect/DropDownSelect';
import { useSelector } from 'react-redux';
import { LastMonthandYear } from '../Utils/getCurrentMonth';
// import LiveStatusCard from './Card/LiveStatusCard';

// ── Helpers ────────────────────────────────────────────────────────────────────
const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

const fmt = (n) => {
  const num = Number(n) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

// ── ApexCharts HTML builder ────────────────────────────────────────────────────
const buildApexHTML = (id, optionsJson, height = 300) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Inter', sans-serif !important; margin:0; padding:0; box-sizing:border-box; }
    body { background: transparent; overflow: hidden; }
    #chart { width:100%; }
    .apexcharts-text, .apexcharts-legend-text { font-size:11px !important; }
  </style>
</head>
<body>
  <div id="${id}"></div>
  <script>
    try {
      const options = ${optionsJson};
      const chart = new ApexCharts(document.querySelector('#${id}'), options);
      chart.render();
    } catch(e) { document.body.innerHTML = '<p style="color:red;padding:10px">Chart error: '+e.message+'</p>'; }
  </script>
</body>
</html>`;

// ── KPI Metric Card ────────────────────────────────────────────────────────────
const KPICard = ({ title, value, icon, gradient, trend, trendVal }) => (
  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={kpi.card}>
    <View style={kpi.top}>
      <View style={kpi.iconBox}>
        <MaterialCommunityIcons name={icon} size={22} color="#fff" />
      </View>
      {trend != null && (
        <View style={[kpi.badge, { backgroundColor: trend >= 0 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }]}>
          <MaterialCommunityIcons
            name={trend >= 0 ? 'trending-up' : 'trending-down'}
            size={12} color="#fff" />
          <Text style={kpi.badgeTxt}> {Math.abs(trendVal)}%</Text>
        </View>
      )}
    </View>
    <Text style={kpi.value}>{value}</Text>
    <Text style={kpi.title}>{title}</Text>
  </LinearGradient>
);
const kpi = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, width: (W - 48) / 2, marginBottom: 12, elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeTxt: { fontSize: 11, color: '#fff', fontWeight: '700' },
  value: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 2 },
  title: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500', letterSpacing: 0.3 },
});

// ── Chart Card Wrapper ─────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, height = 260, onInfo }) => (
  <View style={cc.card}>
    <View style={cc.header}>
      <View style={{ flex: 1 }}>
        <Text style={cc.title}>{title}</Text>
        {subtitle ? <Text style={cc.sub}>{subtitle}</Text> : null}
      </View>
      {onInfo && (
        <TouchableOpacity onPress={onInfo} style={cc.infoBtn}>
          <MaterialCommunityIcons name="dots-vertical" size={18} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
    <View style={{ height }}>{children}</View>
  </View>
);
const cc = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#64748b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  sub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  infoBtn: { padding: 4 },
});

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title, icon }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 8 }}>
    <View style={{ backgroundColor: '#1e3a8a15', padding: 6, borderRadius: 10, marginRight: 8 }}>
      <MaterialCommunityIcons name={icon} size={16} color="#1e3a8a" />
    </View>
    <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a', letterSpacing: 0.2 }}>{title}</Text>
  </View>
);

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export  function TopManagement({ navigation }) {
  const [animatedValue] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const UserId = useSelector((state) => state?.UserDetails);

  // ── Data Queries ─────────────────────────────────────────────────────────
  const { data: salaryData, refetch: refetchSalary }         = useGetYearWiseToTSalaryQuery(undefined, { pollingInterval: 60000, refetchOnMountOrArgChange: true });
  const { data: genderData, refetch: refetchGender }         = useGetgendercountQuery({ params: { COMPCODE: UserId?.GCOMPCODE } }, { pollingInterval: 60000, refetchOnMountOrArgChange: true });
  const { data: headData, refetch: refetchHead }             = useGetTotalHeadCountQuery({ dep: '' }, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const { data: attData, refetch: refetchAtt }               = useGetDepWise_gender_attenceQuery({ dep: '' }, { pollingInterval: 15000, refetchOnMountOrArgChange: true });
  const { data: liveUsers, refetch: refetchLive }            = useGet_live_userQuery(undefined, { pollingInterval: 10000, refetchOnMountOrArgChange: true });

  // ── Pull-to-refresh ──────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchSalary(), refetchGender(), refetchHead(), refetchAtt(), refetchLive()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // ── Derived KPI values ───────────────────────────────────────────────────
  const headRows = Array.isArray(headData?.data) ? headData.data : [];
  const totalHeadcount = headRows.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const totalMale      = headRows.reduce((s, d) => s + (Number(d.MALE) || 0), 0);
  const totalFemale    = headRows.reduce((s, d) => s + (Number(d.FEMALE) || 0), 0);
  const totalPresent   = (attData?.data?.[0]?.PMALE || 0) + (attData?.data?.[0]?.PFEMALE || 0);
  const totalAbsent    = (attData?.data?.[0]?.AMALE || 0) + (attData?.data?.[0]?.AFEMALE || 0);
  const attendanceRate = totalHeadcount > 0 ? ((totalPresent / totalHeadcount) * 100).toFixed(1) : 0;
  const liveChartData = Array.isArray(liveUsers?.data) ? liveUsers.data : [];
  const liveCount      = liveChartData.length;

  // ── Salary Year-wise data ────────────────────────────────────────────────
  const salaryRows  = Array.isArray(salaryData?.data) ? salaryData.data : [];
  const salaryYears = [...new Set(salaryRows.map(r => r.YEAR || r[0]))].filter(Boolean).sort().slice(-3);
  const salaryMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── Chart 1: Revenue Area Line Chart (Year-wise salary trend) ────────────
  const areaChartSeries = salaryYears.map((yr, i) => ({
    name: String(yr),
    data: salaryMonths.map((_, mi) => {
      const row = salaryRows.find(r => 
        Number(r.YEAR || r[0]) === Number(yr) && 
        (Number(r.MONTH || r[1]) === mi + 1 || (r.MONTH || r[1])?.toString()?.toLowerCase()?.startsWith(salaryMonths[mi].toLowerCase()))
      );
      return row ? Number(row.SALARY || row.AMOUNT || row.value || row[2]) || 0 : 0;
    }),
  }));

  const AreaChart_HTML = buildApexHTML('area', JSON.stringify({
    series: areaChartSeries.length ? areaChartSeries : [{ name: 'Salary', data: [0,0,0,0,0,0,0,0,0,0,0,0] }],
    chart: { type: 'area', height: 240, toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: ['#3b82f6', '#8b5cf6', '#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
    xaxis: { categories: salaryMonths, labels: { style: { fontSize: '10px' } } },
    yaxis: { labels: { style: { fontSize: '10px' }, formatter: (v) => v >= 100000 ? (v/100000).toFixed(1)+'L' : v.toLocaleString() } },
    tooltip: { y: { formatter: (v) => '₹' + v.toLocaleString('en-IN') } },
    legend: { show: true, position: 'top', fontSize: '11px' },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  }), 240);

  // ── Chart 2: Donut — Gender Distribution ─────────────────────────────────
  const DonutChart_HTML = buildApexHTML('donut', JSON.stringify({
    series: [totalMale, totalFemale],
    chart: { type: 'donut', height: 220, animations: { animateGradually: { enabled: true, delay: 150 } } },
    colors: ['#3b82f6', '#ec4899'],
    labels: ['Male', 'Female'],
    plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, showAlways: true, label: 'Total', fontSize: '12px', fontWeight: 700, color: '#0f172a', formatter: () => totalHeadcount.toString() } } } } },
    dataLabels: { enabled: true, style: { fontSize: '11px' }, formatter: (val) => val.toFixed(1) + '%' },
    legend: { show: true, position: 'bottom', fontSize: '12px', offsetY: 4 },
    stroke: { width: 0 },
  }), 220);

  // ── Chart 3: Bar — Department Headcount ───────────────────────────────────
  const deptNames  = headRows.slice(0, 8).map(d => d.label || d.name || d.DEP || 'Dept');
  const deptValues = headRows.slice(0, 8).map(d => Number(d.value) || 0);

  const BarChart_HTML = buildApexHTML('bar', JSON.stringify({
    series: [{ name: 'Headcount', data: deptValues.length ? deptValues : [0] }],
    chart: { type: 'bar', height: 250, toolbar: { show: false } },
    colors: ['#6366f1'],
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '60%', distributed: false } },
    dataLabels: { enabled: true, style: { fontSize: '10px', colors: ['#fff'] } },
    xaxis: { categories: deptNames.length ? deptNames : ['No Data'], labels: { style: { fontSize: '9px' } } },
    yaxis: { labels: { style: { fontSize: '9px' }, maxWidth: 80 } },
    grid: { borderColor: '#f1f5f9' },
    fill: { type: 'gradient', gradient: { shade: 'light', type: 'horizontal', gradientToColors: ['#8b5cf6'] } },
  }), 250);

  // ── Chart 4: RadialBar — Attendance Rate ─────────────────────────────────
  const RadialChart_HTML = buildApexHTML('radial', JSON.stringify({
    series: [Number(attendanceRate)],
    chart: { type: 'radialBar', height: 200 },
    colors: attendanceRate >= 80 ? ['#10b981'] : attendanceRate >= 60 ? ['#f59e0b'] : ['#ef4444'],
    plotOptions: {
      radialBar: {
        hollow: { size: '58%' },
        track: { background: '#f1f5f9', strokeWidth: '100%', margin: 4 },
        dataLabels: { name: { fontSize: '13px', color: '#64748b', offsetY: -6 }, value: { fontSize: '26px', fontWeight: '800', color: '#0f172a', formatter: (v) => v + '%' } },
      },
    },
    labels: ['Attendance'],
  }), 200);

  // ── Chart 5: Present vs Absent Column Chart ───────────────────────────────
  const PresentAbsentChart_HTML = buildApexHTML('pa', JSON.stringify({
    series: [
      { name: 'Present', data: [attData?.data?.[0]?.PMALE || 0, attData?.data?.[0]?.PFEMALE || 0] },
      { name: 'Absent',  data: [attData?.data?.[0]?.AMALE  || 0, attData?.data?.[0]?.AFEMALE  || 0] },
    ],
    chart: { type: 'bar', height: 220, stacked: false, toolbar: { show: false } },
    colors: ['#10b981', '#ef4444'],
    plotOptions: { bar: { borderRadius: 5, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Male', 'Female'], labels: { style: { fontSize: '12px' } } },
    yaxis: { labels: { style: { fontSize: '10px' } } },
    legend: { show: true, position: 'top', fontSize: '11px' },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  }), 220);

  // ── Chart 6: Live OnDuty Heatmap (active users gauge) ────────────────────
  const OnDutyLive_HTML = buildApexHTML('live', JSON.stringify({
    series: [{ name: 'Live Users', data: liveChartData.length ? [liveChartData.length] : [0] }],
    chart: { type: 'bar', height: 120, toolbar: { show: false }, sparkline: { enabled: false } },
    colors: ['#3b82f6'],
    plotOptions: { bar: { borderRadius: 8, horizontal: false, columnWidth: '40%' } },
    dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: '800' } },
    xaxis: { categories: ['Currently Live'], labels: { style: { fontSize: '11px' } } },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { enabled: false },
  }), 120);

  return (
    <>
      <View style={{ position: 'absolute' }}>
        {/* Modals placeholder */}
      </View>

      <PagerView style={{ flex: 1, height: '100%', width: '100%' }} initialPage={0}>

        {/*═══════════════════════════════════════════════════════
            PAGE 1 — KPI Overview + Charts
        ═══════════════════════════════════════════════════════*/}
        <View style={{ flex: 1 }} key="1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: '#f8fafc' }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
          >

            {/* ── Page Title ── */}
            <Animated.View style={{ opacity: animatedValue }}>
              <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 18, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff' }}>
                    Top Management
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>
                    Real-time company insights • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 12 }}>
                  <MaterialCommunityIcons name="chart-areaspline" size={28} color="#fff" />
                </View>
              </LinearGradient>
            </Animated.View>

            {/* ── Live Status Card ── */}
            {/* <LiveStatusCard UserId={UserId} /> */}

            {/* ── KPI Cards (2×3 grid) ── */}
            <SectionHeader title="Key Performance Indicators" icon="speedometer" />
            <Animated.View style={{ opacity: animatedValue, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 4 }}>
              <KPICard title="Total Headcount" value={totalHeadcount.toString()} icon="account-group" gradient={['#1e3a8a','#3b82f6']} trend={1} trendVal={2.3} />
              <KPICard title="Today Attendance" value={`${attendanceRate}%`} icon="account-check" gradient={['#065f46','#10b981']} trend={1} trendVal={1.5} />
              <KPICard title="Male Strength" value={totalMale.toString()} icon="human-male" gradient={['#1e40af','#6366f1']} trend={null} trendVal={0} />
              <KPICard title="Female Strength" value={totalFemale.toString()} icon="human-female" gradient={['#831843','#ec4899']} trend={null} trendVal={0} />
              <KPICard title="Absent Today" value={totalAbsent.toString()} icon="account-remove" gradient={['#7f1d1d','#ef4444']} trend={-1} trendVal={0.8} />
              <KPICard title="OnDuty Live" value={liveCount.toString()} icon="map-marker-radius" gradient={['#1e3799','#0652dd']} trend={null} trendVal={0} />
            </Animated.View>

            {/* ── Salary Trend Chart ── */}
            <SectionHeader title="Salary Trend Analysis" icon="chart-timeline-variant" />
            <ChartCard title="Year-wise Salary Comparison" subtitle="Area chart • All months" onInfo={null}>
              <WebView key={`salary-trend-${salaryYears.join('-')}`}
                originWhitelist={['*']}
                source={{ html: AreaChart_HTML }}
                style={{ flex: 1 }}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                scrollEnabled={false}
                javaScriptEnabled
              />
            </ChartCard>

            {/* ── Gender Distribution ── */}
            <SectionHeader title="Workforce Overview" icon="account-multiple" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[cc.card, { flex: 1 }]}>
                <Text style={cc.title}>Gender Distribution</Text>
                <Text style={cc.sub}>Donut Chart</Text>
                <View style={{ height: 220 }}>
                  <WebView key={`gender-donut-${totalMale}-${totalFemale}`} originWhitelist={['*']} source={{ html: DonutChart_HTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
              </View>
            </View>

            {/* ── Attendance Bar Chart ── */}
            <SectionHeader title="Attendance Analysis" icon="calendar-check" />
            <ChartCard title="Present vs Absent" subtitle="Gender-wise breakdown">
              <WebView key={`pa-breakdown-${totalPresent}-${totalAbsent}`} originWhitelist={['*']} source={{ html: PresentAbsentChart_HTML }}
                style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
            </ChartCard>

            {/* ── Attendance Rate Radial ── */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[cc.card, { flex: 1 }]}>
                <Text style={cc.title}>Attendance Rate</Text>
                <Text style={cc.sub}>Today • Real-time Status</Text>
                <View style={{ height: 200 }}>
                  <WebView key={`attendance-radial-${attendanceRate}`} originWhitelist={['*']} source={{ html: RadialChart_HTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
                {/* Stats below radial */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8. }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#10b981' }}>{totalPresent}</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>Present</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#ef4444' }}>{totalAbsent}</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>Absent</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#3b82f6' }}>{totalHeadcount}</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>Total</Text>
                  </View>
                </View>
              </View>

              {/* Live OnDuty Panel */}
              <View style={[cc.card, { flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: liveCount > 0 ? '#10b981' : '#94a3b8', marginRight: 6 }} />
                  <Text style={cc.title}>Live OnDuty</Text>
                </View>
                <Text style={cc.sub}>{liveCount > 0 ? 'Users currently on duty' : 'No active sessions'}</Text>
                <View style={{ height: 120 }}>
                  <WebView key={`live-onduty-${liveCount}`} originWhitelist={['*']} source={{ html: OnDutyLive_HTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
                {/* Active user chips */}
                <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 4, marginTop: 8 }}>
                  {liveChartData.slice(0, 4).map((u, i) => (
                    <View key={i} style={{ backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                      <Text style={{ fontSize: 10, color: '#1d4ed8', fontWeight: '600' }}>
                        {u.empname || u.UserId || `User ${i + 1}`}
                      </Text>
                    </View>
                  ))}
                  {liveChartData.length > 4 && (
                    <View style={{ backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                      <Text style={{ fontSize: 10, color: '#6366f1', fontWeight: '600' }}>+{liveChartData.length - 4} more</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ── Department Headcount Horizontal Bar ── */}
            <SectionHeader title="Department Headcount" icon="office-building-outline" />
            <ChartCard title="Department-wise Strength" subtitle="Horizontal bar chart" height={270}>
              <WebView key={`dept-strength-${deptValues.length}-${deptValues[0] || ''}`} originWhitelist={['*']} source={{ html: BarChart_HTML }}
                style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
            </ChartCard>

          </ScrollView>
        </View>

        {/*═══════════════════════════════════════════════════════
            PAGE 2 — Profile / Settings
        ═══════════════════════════════════════════════════════*/}
        <View style={{ flex: 1, justifyContent: 'flex-start', padding: 7 }} key="2">
          <CustomizeProfile_Higher_Pos />
        </View>

      </PagerView>
    </>
  );
}
