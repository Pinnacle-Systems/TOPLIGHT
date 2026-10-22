import {
  View, Dimensions, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Text, Image, RefreshControl
} from 'react-native';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import WebView from 'react-native-webview';
import {  MaterialCommunityIcons } from 'react-native-vector-icons';
import {
  useGetYearWiseToTSalaryQuery,
  useGetgendercountQuery,
  useGetTotalHeadCountQuery,
  useGetDepWise_gender_attenceQuery,
} from '../../store/api/DashboardApi';
import { useGet_live_userQuery } from '../../store/api/OndutyApi';
import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import CustomizeProfile_Higher_Pos from './CustomizeProfile_Higher_Pos';
import { useSelector } from 'react-redux';
import { useAppTheme } from '../../theme';

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
const buildApexHTML = (id, optionsJson, height = 300, theme) => `
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
      options.theme = options.theme || { mode: '${theme?.mode || 'light'}' };
      options.chart = options.chart || {};
      options.chart.foreColor = '${theme?.colors?.textSecondary || '#475569'}';
      const chart = new ApexCharts(document.querySelector('#${id}'), options);
      chart.render();
    } catch(e) { document.body.innerHTML = '<p style="color:red;padding:10px">Chart error: '+e.message+'</p>'; }
  </script>
</body>
</html>`;

// ── KPI Metric Card ────────────────────────────────────────────────────────────
const KPICard = ({ title, value, icon, gradient, trend, trendVal }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createKpiStyles(theme), [theme]);
  return (
  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={styles.card}>
    <View style={styles.top}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={icon} size={22} color={theme.colors.brandContrast} />
      </View>
      {trend != null && (
        <View style={[styles.badge, { backgroundColor: trend >= 0 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }]}>
          <MaterialCommunityIcons
            name={trend >= 0 ? 'trending-up' : 'trending-down'}
            size={12} color={theme.colors.brandContrast} />
          <Text style={styles.badgeTxt}> {Math.abs(trendVal)}%</Text>
        </View>
      )}
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.title}>{title}</Text>
  </LinearGradient>
  );
};
const createKpiStyles = theme => StyleSheet.create({
  card: { borderRadius: 16, padding: 16, width: (W - 48) / 2, marginBottom: 12, elevation: 4, shadowColor: theme.colors.shadow, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeTxt: { fontSize: 11, color: theme.colors.brandContrast, fontWeight: '700' },
  value: { fontSize: 22, fontWeight: '800', color: theme.colors.brandContrast, marginBottom: 2 },
  title: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500', letterSpacing: 0.3 },
});

// ── Chart Card Wrapper ─────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, height = 260, onInfo }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createChartStyles(theme), [theme]);
  return (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {onInfo && (
        <TouchableOpacity onPress={onInfo} style={styles.infoBtn}>
          <MaterialCommunityIcons name="dots-vertical" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
    <View style={{ height }}>{children}</View>
  </View>
  );
};
const createChartStyles = theme => StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14, elevation: 2, shadowColor: theme.colors.shadow, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  sub: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  infoBtn: { padding: 4 },
});

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title, icon }) => {
  const { theme } = useAppTheme();
  return (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 8 }}>
    <View style={{ backgroundColor: theme.colors.brandSoft, padding: 6, borderRadius: 10, marginRight: 8 }}>
      <MaterialCommunityIcons name={icon} size={16} color={theme.colors.brand} />
    </View>
    <Text style={{ fontSize: 15, fontWeight: '800', color: theme.colors.text, letterSpacing: 0.2 }}>{title}</Text>
  </View>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export  function TopManagement({ navigation }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createChartStyles(theme), [theme]);
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
    colors: theme.colors.chart.slice(0, 3),
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
    xaxis: { categories: salaryMonths, labels: { style: { fontSize: '10px' } } },
    yaxis: { labels: { style: { fontSize: '10px' }, formatter: (v) => v >= 100000 ? (v/100000).toFixed(1)+'L' : v.toLocaleString() } },
    tooltip: { y: { formatter: (v) => '₹' + v.toLocaleString('en-IN') } },
    legend: { show: true, position: 'top', fontSize: '11px' },
    grid: { borderColor: theme.colors.divider, strokeDashArray: 4 },
  }), 240, theme);

  // ── Chart 2: Donut — Gender Distribution ─────────────────────────────────
  const DonutChart_HTML = buildApexHTML('donut', JSON.stringify({
    series: [totalMale, totalFemale],
    chart: { type: 'donut', height: 220, animations: { animateGradually: { enabled: true, delay: 150 } } },
    colors: [theme.colors.brand, theme.colors.accent],
    labels: ['Male', 'Female'],
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '12px',
              fontWeight: 700,
              color: theme.colors.text,
              formatter: () => totalHeadcount.toString(),
            },
          },
        },
      },
    },
    dataLabels: { enabled: true, style: { fontSize: '11px' }, formatter: (val) => val.toFixed(1) + '%' },
    legend: { show: true, position: 'bottom', fontSize: '12px', offsetY: 4 },
    stroke: { width: 0 },
  }), 220, theme);

  // ── Chart 3: Bar — Department Headcount ───────────────────────────────────
  const deptNames  = headRows.slice(0, 8).map(d => d.label || d.name || d.DEP || 'Dept');
  const deptValues = headRows.slice(0, 8).map(d => Number(d.value) || 0);

  const BarChart_HTML = buildApexHTML('bar', JSON.stringify({
    series: [{ name: 'Headcount', data: deptValues.length ? deptValues : [0] }],
    chart: { type: 'bar', height: 250, toolbar: { show: false } },
    colors: [theme.colors.accent],
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '60%', distributed: false } },
    dataLabels: { enabled: true, style: { fontSize: '10px', colors: [theme.colors.brandContrast] } },
    xaxis: { categories: deptNames.length ? deptNames : ['No Data'], labels: { style: { fontSize: '9px' } } },
    yaxis: { labels: { style: { fontSize: '9px' }, maxWidth: 80 } },
    grid: { borderColor: theme.colors.divider },
    fill: { type: 'gradient', gradient: { shade: theme.isDark ? 'dark' : 'light', type: 'horizontal', gradientToColors: [theme.colors.accent] } },
  }), 250, theme);

  // ── Chart 4: RadialBar — Attendance Rate ─────────────────────────────────
  const RadialChart_HTML = buildApexHTML('radial', JSON.stringify({
    series: [Number(attendanceRate)],
    chart: { type: 'radialBar', height: 200 },
    colors: attendanceRate >= 80 ? [theme.colors.success] : attendanceRate >= 60 ? [theme.colors.warning] : [theme.colors.danger],
    plotOptions: {
      radialBar: {
        hollow: { size: '58%' },
        track: { background: theme.colors.surfaceSunken, strokeWidth: '100%', margin: 4 },
        dataLabels: { name: { fontSize: '13px', color: theme.colors.textSecondary, offsetY: -6 }, value: { fontSize: '26px', fontWeight: '800', color: theme.colors.text, formatter: (v) => v + '%' } },
      },
    },
    labels: ['Attendance'],
  }), 200, theme);

  // ── Chart 5: Present vs Absent Column Chart ───────────────────────────────
  const PresentAbsentChart_HTML = buildApexHTML('pa', JSON.stringify({
    series: [
      { name: 'Present', data: [attData?.data?.[0]?.PMALE || 0, attData?.data?.[0]?.PFEMALE || 0] },
      { name: 'Absent',  data: [attData?.data?.[0]?.AMALE  || 0, attData?.data?.[0]?.AFEMALE  || 0] },
    ],
    chart: { type: 'bar', height: 220, stacked: false, toolbar: { show: false } },
    colors: [theme.colors.success, theme.colors.danger],
    plotOptions: { bar: { borderRadius: 5, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Male', 'Female'], labels: { style: { fontSize: '12px' } } },
    yaxis: { labels: { style: { fontSize: '10px' } } },
    legend: { show: true, position: 'top', fontSize: '11px' },
    grid: { borderColor: theme.colors.divider, strokeDashArray: 4 },
  }), 220, theme);

  // ── Chart 6: Live OnDuty Heatmap (active users gauge) ────────────────────
  const OnDutyLive_HTML = buildApexHTML('live', JSON.stringify({
    series: [{ name: 'Live Users', data: liveChartData.length ? [liveChartData.length] : [0] }],
    chart: { type: 'bar', height: 120, toolbar: { show: false }, sparkline: { enabled: false } },
    colors: [theme.colors.brand],
    plotOptions: { bar: { borderRadius: 8, horizontal: false, columnWidth: '40%' } },
    dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: '800' } },
    xaxis: { categories: ['Currently Live'], labels: { style: { fontSize: '11px' } } },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { enabled: false },
  }), 120, theme);

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
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.brand]} />}
          >

            {/* ── Page Title ── */}
            <Animated.View style={{ opacity: animatedValue }}>
              <LinearGradient
                colors={[theme.colors.brandStrong, theme.colors.brand]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 18, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: theme.colors.brandContrast }}>
                    Top Management
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.brandContrast, opacity: 0.78, marginTop: 3 }}>
                    Real-time company insights • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 12 }}>
                  <MaterialCommunityIcons name="chart-areaspline" size={28} color={theme.colors.brandContrast} />
                </View>
              </LinearGradient>
            </Animated.View>

            {/* ── Live Status Card ── */}
            {/* <LiveStatusCard UserId={UserId} /> */}

            {/* ── KPI Cards (2×3 grid) ── */}
            <SectionHeader title="Key Performance Indicators" icon="speedometer" />
            <Animated.View style={{ opacity: animatedValue, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 4 }}>
              <KPICard title="Total Headcount" value={totalHeadcount.toString()} icon="account-group" gradient={[theme.colors.brandStrong, theme.colors.brand]} trend={1} trendVal={2.3} />
              <KPICard title="Today Attendance" value={`${attendanceRate}%`} icon="account-check" gradient={[theme.colors.secondary, theme.colors.success]} trend={1} trendVal={1.5} />
              <KPICard title="Male Strength" value={totalMale.toString()} icon="human-male" gradient={[theme.colors.info, theme.colors.accent]} trend={null} trendVal={0} />
              <KPICard title="Female Strength" value={totalFemale.toString()} icon="human-female" gradient={[theme.colors.accent, theme.colors.secondary]} trend={null} trendVal={0} />
              <KPICard title="Absent Today" value={totalAbsent.toString()} icon="account-remove" gradient={[theme.colors.danger, theme.colors.warning]} trend={-1} trendVal={0.8} />
              <KPICard title="OnDuty Live" value={liveCount.toString()} icon="map-marker-radius" gradient={[theme.colors.brandStrong, theme.colors.info]} trend={null} trendVal={0} />
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
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.title}>Gender Distribution</Text>
                <Text style={styles.sub}>Donut Chart</Text>
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
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.title}>Attendance Rate</Text>
                <Text style={styles.sub}>Today • Real-time Status</Text>
                <View style={{ height: 200 }}>
                  <WebView key={`attendance-radial-${attendanceRate}`} originWhitelist={['*']} source={{ html: RadialChart_HTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
                {/* Stats below radial */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8. }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.success }}>{totalPresent}</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>Present</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.danger }}>{totalAbsent}</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>Absent</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.brand }}>{totalHeadcount}</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>Total</Text>
                  </View>
                </View>
              </View>

              {/* Live OnDuty Panel */}
              <View style={[styles.card, { flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: liveCount > 0 ? theme.colors.success : theme.colors.textMuted, marginRight: 6 }} />
                  <Text style={styles.title}>Live OnDuty</Text>
                </View>
                <Text style={styles.sub}>{liveCount > 0 ? 'Users currently on duty' : 'No active sessions'}</Text>
                <View style={{ height: 120 }}>
                  <WebView key={`live-onduty-${liveCount}`} originWhitelist={['*']} source={{ html: OnDutyLive_HTML }}
                    style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled />
                </View>
                {/* Active user chips */}
                <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 4, marginTop: 8 }}>
                  {liveChartData.slice(0, 4).map((u, i) => (
                    <View key={i} style={{ backgroundColor: theme.colors.brandSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                      <Text style={{ fontSize: 10, color: theme.colors.brand, fontWeight: '600' }}>
                        {u.empname || u.UserId || `User ${i + 1}`}
                      </Text>
                    </View>
                  ))}
                  {liveChartData.length > 4 && (
                    <View style={{ backgroundColor: theme.colors.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                      <Text style={{ fontSize: 10, color: theme.colors.accent, fontWeight: '600' }}>+{liveChartData.length - 4} more</Text>
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
