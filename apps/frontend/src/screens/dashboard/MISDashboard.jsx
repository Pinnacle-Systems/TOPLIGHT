import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Dimensions, RefreshControl, Modal, Animated
} from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import WebView from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import {
    useGetYearlyCompQuery,
    useGetMisDashboardSalaryDetQuery,
    useGetMisDashboardEsiDetQuery,
    useGetMisDashboardPfDetQuery,
    useGetMisDashboardOTWagesDetQuery,
    useGetMisDashboardRetDetTableQuery,
    useGetDepWise_gender_attenceQuery,
    useGetStateWiseHeadCountQuery,
    useGetYearWiseToTSalaryQuery,
    useGetTotalHeadCountQuery,
    useGetAgewiseEsiQuery,
} from '../../store/api/dashboardApi';
import { useGet_live_userQuery } from '../../store/api/OndutyApi';
import { useSelector } from 'react-redux';

const W = Dimensions.get('window').width;

// ─────────────────────────────────────────────────────────────────────────────
// buildApexHTML
// Key fix: DOMContentLoaded ensures ApexCharts renders after the DOM is ready.
// Height is applied to both <html>, <body> AND the container div.
// ─────────────────────────────────────────────────────────────────────────────
const buildApexHTML = (id, optionsJson, height = 300) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: ${height}px; background: transparent; overflow: hidden; }
    #${id} { width: 100%; height: ${height}px; }
  </style>
</head>
<body>
  <div id="${id}"></div>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      try {
        var options = ${optionsJson};
        options.chart = options.chart || {};
        options.chart.height = ${height};
        options.chart.width  = '100%';
        options.chart.background = 'transparent';
        options.chart.toolbar = { show: false };
        var chart = new ApexCharts(document.getElementById('${id}'), options);
        chart.render();
      } catch (e) {
        document.body.innerHTML =
          '<p style="color:red;font-size:12px;padding:8px">Chart error: ' + e.message + '</p>';
      }
    });
  </script>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// ChartBox
// ─────────────────────────────────────────────────────────────────────────────
const ChartBox = ({ id, options, height = 280 }) => (
    <View style={{ height, width: '100%' }}>
        <WebView
            key={id}
            originWhitelist={['*']}
            source={{ html: buildApexHTML(id, JSON.stringify(options), height) }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            scrollEnabled={false}
            javaScriptEnabled
            nestedScrollEnabled={false}
        />
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────
const Section = ({ title, icon, color, children, onDetail }) => (
    <View style={S.section}>
        <View style={S.sectionHeader}>
            <View style={[S.iconBox, { backgroundColor: `${color}18` }]}>
                <Icon name={icon} size={20} color={color} />
            </View>
            <Text style={S.sectionTitle}>{title.toUpperCase()}</Text>
            {onDetail && (
                <TouchableOpacity onPress={onDetail} style={S.detailBtn}>
                    <Icon name="chevron-right" size={24} color="#94a3b8" />
                </TouchableOpacity>
            )}
        </View>
        <View style={S.sectionContent}>{children}</View>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// KPI card
// ─────────────────────────────────────────────────────────────────────────────
const KPI = ({ label, value, icon, color, bgColor }) => (
    <View style={[S.kpiCard, { backgroundColor: '#fff' }]}>
        <View style={[S.kpiIcon, { backgroundColor: bgColor }]}>
            <Icon name={icon} size={22} color={color} />
        </View>
        <Text style={S.kpiVal}>{value}</Text>
        <Text style={S.kpiLab}>{label}</Text>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Empty chart placeholder — shown instead of a blank chart area
// ─────────────────────────────────────────────────────────────────────────────
const EmptyChart = ({ label = 'No data available', height = 120 }) => (
    <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="chart-bar" size={28} color="#cbd5e1" />
        <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>{label}</Text>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const MISDashboard = () => {
    const fade = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing]     = useState(false);
    const [detailModule, setDetailModule] = useState(null);

    const UserId = useSelector((state) => state?.UserDetails);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: compStrength, refetch: refStrength } = useGetYearlyCompQuery({ params: {} });
    const { data: salLastMonth, refetch: refSal }      = useGetMisDashboardSalaryDetQuery({ params: {} });
    const { data: esiLastMonth, refetch: refEsi }      = useGetMisDashboardEsiDetQuery({ params: {} });
    const { data: pfLastMonth,  refetch: refPf }       = useGetMisDashboardPfDetQuery({ params: {} });
    const { data: otWages,      refetch: refOt }       = useGetMisDashboardOTWagesDetQuery({ params: {} });
    const { data: attrition,    refetch: refAttr }     = useGetMisDashboardRetDetTableQuery({ params: {} });
    const { data: attend,       refetch: refAtt }      = useGetDepWise_gender_attenceQuery({ dep: '' });
    const { data: region,       refetch: refReg }      = useGetStateWiseHeadCountQuery({ params: {} });
    const { data: salaryTrend,  refetch: refTrend }    = useGetYearWiseToTSalaryQuery();
    const { data: headData,     refetch: refHead }     = useGetTotalHeadCountQuery({ dep: '' });
    const { data: ageSalary,    refetch: refAge }      = useGetAgewiseEsiQuery({
        params: { filterBuyer: '', filterYear: new Date().getFullYear() },
    });
    const { data: liveUsers, refetch: refLive } = useGet_live_userQuery(undefined, {
        pollingInterval: 5000,
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.allSettled([
            refStrength(), refSal(), refEsi(), refPf(), refOt(),
            refAttr(), refAtt(), refReg(), refTrend(), refLive(), refHead(), refAge(),
        ]);
        setRefreshing(false);
    }, [refStrength, refSal, refEsi, refPf, refOt, refAttr, refAtt, refReg, refTrend, refLive, refHead, refAge]);

    useEffect(() => {
        Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─────────────────────────────────────────────────────────────────────────
    // DATA PREP — keyed to actual backend response maps:
    //
    //  getLastSalarydet      → { customer, month, Year, netpay, headCount }
    //  getESIlastmonth       → { customer, month, Year, esi, headCount }
    //  getPFlastmonth        → { customer, month, Year, pf, headCount }
    //  getYearlyComp         → { customer, male, female, total }
    //  getYearWiseToTSalary  → result.rows raw → mapped as { YEAR, salary }
    //  getDepWise_gender_attence → single row { TOTAL,TMALE,TFEMALE,PTOTAL,PMALE,PFEMALE,ATOTAL,AMALE,AFEMALE }
    //  getStateWiseHeadCount → { COMPCODE, STATE, MALE, FEMALE, TOTAL }
    //  getAgewiseEsi         → { SLAP, PAYCAT, FINYR, TOTAL_NETPAY, TOTAL_ESI, TOTAL_PF, HEADCOUNT }
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Attendance KPIs
    const ap           = attend?.data?.[0] ?? {};
    const totalPresent = (ap.PMALE ?? 0) + (ap.PFEMALE ?? 0);
    const totalAbsent  = (ap.AMALE ?? 0) + (ap.AFEMALE ?? 0);
    const liveCount    = liveUsers?.data?.length ?? 0;

    // 2. Strength data — getYearlyComp keys are lowercase
    const strengthData = compStrength?.data ?? [];
    const totalStrength = strengthData.reduce((s, x) => s + Number(x.total ?? 0), 0);

    // 3. Annual salary trend — getYearWiseToTSalary maps raw rows to { YEAR, salary }
    //    But the query returns result directly (no .rows map in controller).
    //    Controller: result.rows.map → but returns raw `result` object, not mapped array.
    //    We handle both: mapped array of objects, or raw rows array of arrays.
    const rawTrend   = salaryTrend?.data;
    const salaryRows = Array.isArray(rawTrend)
        ? rawTrend
        : (rawTrend?.rows ?? []);

    const finYears = [...new Set(
        salaryRows.map(r => r?.YEAR ?? r?.FINYEAR ?? r?.[0]).filter(Boolean)
    )].sort().slice(-6);

    const revenueChartOptions = {
        series: [{
            name: 'Total Salary',
            data: finYears.map(yr => {
                const row = salaryRows.find(r =>
                    String(r?.YEAR ?? r?.FINYEAR ?? r?.[0]) === String(yr)
                );
                return row ? Number(row?.salary ?? row?.SALARY ?? row?.[1]) || 0 : 0;
            }),
        }],
        chart:  { type: 'area', animations: { enabled: true } },
        colors: ['#3b82f6'],
        stroke: { curve: 'smooth', width: 2 },
        fill:   { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
        xaxis:  { categories: finYears, labels: { style: { fontSize: '9px', colors: '#94a3b8' } } },
        yaxis:  {
            labels: {
                formatter: (v) => v >= 100000 ? (v / 100000).toFixed(1) + 'L' : String(v),
                style: { fontSize: '9px', colors: '#94a3b8' },
            },
        },
        grid:   { borderColor: 'rgba(255,255,255,0.05)' },
        legend: { show: false },
        dataLabels: { enabled: false },
    };

    // 4. Gender chart — keys: customer, male, female
    const genderChartOptions = {
        series: [
            { name: 'Male',   data: strengthData.map(x => Number(x.male   ?? 0)) },
            { name: 'Female', data: strengthData.map(x => Number(x.female ?? 0)) },
        ],
        chart: { type: 'bar', stacked: true },
        plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 } },
        colors: ['#3b82f6', '#ec4899'],
        xaxis:  { categories: strengthData.map(x => x.customer ?? '') },
        legend: { position: 'bottom', labels: { colors: '#64748b' } },
        dataLabels: { enabled: false },
    };

    // 5. Salary area — keys: customer, netpay (lowercase from backend map)
    const salData = salLastMonth?.data ?? [];
    const salaryAreaOptions = {
        series: [{ name: 'Net Pay', data: salData.map(x => Number(x.netpay ?? 0)) }],
        chart:  { type: 'area' },
        colors: ['#3b82f6'],
        stroke: { curve: 'smooth', width: 2 },
        fill:   { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
        xaxis:  { categories: salData.map(x => x.customer ?? '') },
        dataLabels: { enabled: false },
    };

    // 6. ESI donut — key: esi (lowercase). Employer ESI = 4.75/1.75 * employee
    const esiData      = esiLastMonth?.data ?? [];
    const totalEsi     = esiData.reduce((s, x) => s + Number(x.esi ?? 0), 0);
    const totalEsiEmpr = Math.round(totalEsi * (4.75 / 1.75));

    const esiDonutOptions = {
        series: [totalEsiEmpr, totalEsi],
        labels: ['Employer (4.75%)', 'Employee (1.75%)'],
        chart:  { type: 'donut', sparkline: { enabled: true } },
        colors: ['#10b981', '#34d399'],
        legend: { show: false },
    };

    // 7. PF donut — key: pf (lowercase). Employer PF = same 12% as employee
    const pfData    = pfLastMonth?.data ?? [];
    const totalPf   = pfData.reduce((s, x) => s + Number(x.pf ?? 0), 0);

    const pfDonutOptions = {
        series: [totalPf, totalPf],
        labels: ['Employer (12%)', 'Employee (12%)'],
        chart:  { type: 'donut', sparkline: { enabled: true } },
        colors: ['#3b82f6', '#60a5fa'],
        legend: { show: false },
    };

    // 8. Attrition line — keys: customer, headCount (lowercase from backend map)
    const attrData = attrition?.data ?? [];
    const attritionOptions = {
        series: [{ name: 'Headcount', data: attrData.map(x => Number(x.headCount ?? 0)) }],
        chart:  { type: 'line' },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#ef4444'],
        xaxis:  { categories: attrData.map(x => x.customer ?? x.month ?? '') },
        dataLabels: { enabled: false },
    };

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <View style={tw`flex-1 bg-slate-50`}>
            <Animated.View style={[tw`flex-1`, { opacity: fade }]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* ── HEADER ─────────────────────────────────────────── */}
                    <LinearGradient colors={['#0f172a', '#1e293b']} style={S.header}>
                        <View style={tw`flex-row justify-between items-center mb-6`}>
                            <View>
                                <Text style={S.welcome}>Executive Intelligence</Text>
                                <Text style={S.userName}>{UserId?.userName ?? 'Executive'}</Text>
                            </View>
                            <TouchableOpacity style={S.profileBtn}>
                                <Icon name="account-circle" size={32} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={S.revenueCard}>
                            <View style={tw`flex-row justify-between items-center mb-2`}>
                                <Text style={S.revTitle}>ANNUAL PAYOUT TRENDS</Text>
                                <View style={S.liveBadge}>
                                    <View style={S.liveDot} />
                                    <Text style={S.liveTxt}>REAL-TIME</Text>
                                </View>
                            </View>
                            {finYears.length > 0
                                ? <ChartBox id="revenueMain" options={revenueChartOptions} height={160} />
                                : <EmptyChart label="No trend data" height={160} />
                            }
                        </View>
                    </LinearGradient>

                    <View style={S.content}>
                        {/* ── KPI STRIP ──────────────────────────────────── */}
                        <View style={tw`flex-row flex-wrap justify-between mt-[-40px] mb-4`}>
                            <KPI label="OnDuty Live"  value={liveCount}     icon="map-marker-radius" color="#3b82f6" bgColor="#dbeafe" />
                            <KPI label="Present"      value={totalPresent}  icon="account-check"     color="#10b981" bgColor="#dcfce7" />
                            <KPI label="Absent"       value={totalAbsent}   icon="account-remove"    color="#ef4444" bgColor="#fee2e2" />
                            <KPI label="Total Staff"  value={totalStrength} icon="account-group"     color="#f59e0b" bgColor="#fef3c7" />
                        </View>

                        {/* ── SALARY ─────────────────────────────────────── */}
                        <Section title="Salary Distribution" icon="currency-usd" color="#3b82f6"
                            onDetail={() => setDetailModule('salary')}>
                            {salData.length > 0
                                ? <ChartBox id="salaryArea" options={salaryAreaOptions} height={220} />
                                : <EmptyChart label="No salary data" />
                            }
                        </Section>

                        {/* ── WORKFORCE DEMOGRAPHICS ──────────────────────── */}
                        <Section title="Workforce Demographics" icon="account-group" color="#ec4899"
                            onDetail={() => setDetailModule('headcount')}>
                            {strengthData.length > 0
                                ? <ChartBox id="genderStrength" options={genderChartOptions} height={220} />
                                : <EmptyChart label="No headcount data" />
                            }
                        </Section>

                        {/* ── STATUTORY CONTRIBUTIONS ─────────────────────── */}
                        <Section title="Statutory Contributions" icon="shield-check" color="#10b981"
                            onDetail={() => setDetailModule('insurance')}>
                            <View style={tw`flex-row justify-between`}>
                                <View style={{ width: '48%' }}>
                                    <Text style={S.tinyTitle}>ESI Breakdown</Text>
                                    {totalEsi > 0
                                        ? <ChartBox id="esiDonut" options={esiDonutOptions} height={130} />
                                        : <EmptyChart label="No ESI data" height={130} />
                                    }
                                </View>
                                <View style={{ width: '48%' }}>
                                    <Text style={S.tinyTitle}>PF Breakdown</Text>
                                    {totalPf > 0
                                        ? <ChartBox id="pfDonut" options={pfDonutOptions} height={130} />
                                        : <EmptyChart label="No PF data" height={130} />
                                    }
                                </View>
                            </View>
                        </Section>

                        {/* ── ATTRITION ──────────────────────────────────── */}
                        <Section title="Attrition Insights" icon="account-arrow-left" color="#ef4444"
                            onDetail={() => setDetailModule('attrition')}>
                            {attrData.length > 0
                                ? <ChartBox id="attritionLine" options={attritionOptions} height={220} />
                                : <EmptyChart label="No attrition data" />
                            }
                        </Section>
                    </View>
                </ScrollView>
            </Animated.View>

            <DrillDownModal
                module={detailModule}
                onClose={() => setDetailModule(null)}
                data={{ compStrength, salLastMonth, esiLastMonth, pfLastMonth, otWages, attrition, attend, region, ageSalary }}
            />
        </View>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DRILL-DOWN MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DrillDownModal = ({ module, onClose, data }) => {
    if (!module) return null;

    const titles = {
        salary:    'Salary Deep Analysis',
        headcount: 'Headcount & Demographics',
        insurance: 'ESI / PF Breakdown',
        attrition: 'Attrition & Retention',
    };

    // Prep data using correct backend key names
    const ageRows   = data.ageSalary?.data ?? [];
    const regionRows = data.region?.data ?? [];
    const esiRows   = data.esiLastMonth?.data ?? [];
    const pfRows    = data.pfLastMonth?.data ?? [];
    const salRows   = data.salLastMonth?.data ?? [];
    const attrRows  = data.attrition?.data ?? [];
    const strRows   = data.compStrength?.data ?? [];

    return (
        <Modal visible animationType="slide" transparent={false} onRequestClose={onClose}>
            <View style={tw`flex-1 bg-white`}>
                <LinearGradient colors={['#1e293b', '#0f172a']} style={S.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={S.closeBtn}>
                        <Icon name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={S.modalTitle}>{titles[module] ?? 'Details'}</Text>
                </LinearGradient>

                <ScrollView contentContainerStyle={tw`p-4`}>

                    {/* ── SALARY ────────────────────────────────────────── */}
                    {module === 'salary' && (
                        <>
                            <DetailSection title="Agewise Salary Distribution">
                                {/* SLAP & TOTAL_NETPAY are correct keys from getAgewiseEsi */}
                                {ageRows.length > 0
                                    ? <ChartBox id="ageSalaryDrill" height={300} options={{
                                        series: ageRows.map(x => Number(x.TOTAL_NETPAY ?? 0)),
                                        labels: ageRows.map(x => String(x.SLAP ?? '')),
                                        chart:  { type: 'polarArea' },
                                        colors: ['#FFA726','#42A5F5','#66BB6A','#AB47BC','#FF7043'],
                                        legend: { position: 'bottom' },
                                    }} />
                                    : <EmptyChart height={300} />
                                }
                            </DetailSection>

                            <DetailSection title="Company-wise Net Pay">
                                {/* customer & netpay are correct keys from getLastSalarydet */}
                                {salRows.length > 0
                                    ? <ChartBox id="compSalDrill" height={260} options={{
                                        series: [{ name: 'Net Pay', data: salRows.map(x => Number(x.netpay ?? 0)) }],
                                        chart:  { type: 'bar' },
                                        colors: ['#3b82f6'],
                                        plotOptions: { bar: { borderRadius: 6, distributed: true } },
                                        xaxis:  { categories: salRows.map(x => x.customer ?? '') },
                                        legend: { show: false },
                                        dataLabels: { enabled: false },
                                    }} />
                                    : <EmptyChart height={260} />
                                }
                            </DetailSection>
                        </>
                    )}

                    {/* ── HEADCOUNT ─────────────────────────────────────── */}
                    {module === 'headcount' && (
                        <>
                            <DetailSection title="Gender per Company">
                                {/* customer, male, female are correct keys from getYearlyComp */}
                                {strRows.length > 0
                                    ? <ChartBox id="deptHeadDrill" height={300} options={{
                                        series: [
                                            { name: 'Male',   data: strRows.map(x => Number(x.male   ?? 0)) },
                                            { name: 'Female', data: strRows.map(x => Number(x.female ?? 0)) },
                                        ],
                                        chart: { type: 'bar', stacked: true },
                                        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
                                        colors: ['#3b82f6','#ec4899'],
                                        xaxis:  { categories: strRows.map(x => x.customer ?? '') },
                                        legend: { position: 'bottom' },
                                        dataLabels: { enabled: false },
                                    }} />
                                    : <EmptyChart height={300} />
                                }
                            </DetailSection>

                            <DetailSection title="Region-wise Distribution">
                                {/* STATE & TOTAL are correct keys from getStateWiseHeadCount */}
                                {regionRows.length > 0
                                    ? <ChartBox id="regHeadDrill" height={280} options={{
                                        series: regionRows.map(x => Number(x.TOTAL ?? 0)),
                                        labels: regionRows.map(x => String(x.STATE ?? '')),
                                        chart:  { type: 'donut' },
                                        colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'],
                                        legend: { position: 'bottom' },
                                    }} />
                                    : <EmptyChart height={280} />
                                }
                            </DetailSection>
                        </>
                    )}

                    {/* ── INSURANCE ─────────────────────────────────────── */}
                    {module === 'insurance' && (
                        <>
                            <DetailSection title="ESI per Company">
                                {/* customer & esi are correct keys from getESIlastmonth */}
                                {esiRows.length > 0
                                    ? <ChartBox id="esiBarDrill" height={250} options={{
                                        series: [{ name: 'ESI', data: esiRows.map(x => Number(x.esi ?? 0)) }],
                                        chart:  { type: 'bar' },
                                        colors: ['#10b981'],
                                        plotOptions: { bar: { borderRadius: 6, distributed: true } },
                                        xaxis:  { categories: esiRows.map(x => x.customer ?? '') },
                                        legend: { show: false },
                                        dataLabels: { enabled: false },
                                    }} />
                                    : <EmptyChart height={250} />
                                }
                            </DetailSection>

                            <DetailSection title="PF per Company">
                                {/* customer & pf are correct keys from getPFlastmonth */}
                                {pfRows.length > 0
                                    ? <ChartBox id="pfBarDrill" height={250} options={{
                                        series: [{ name: 'PF', data: pfRows.map(x => Number(x.pf ?? 0)) }],
                                        chart:  { type: 'bar' },
                                        colors: ['#3b82f6'],
                                        plotOptions: { bar: { borderRadius: 6, distributed: true } },
                                        xaxis:  { categories: pfRows.map(x => x.customer ?? '') },
                                        legend: { show: false },
                                        dataLabels: { enabled: false },
                                    }} />
                                    : <EmptyChart height={250} />
                                }
                            </DetailSection>
                        </>
                    )}

                    {/* ── ATTRITION ─────────────────────────────────────── */}
                    {module === 'attrition' && (
                        <DetailSection title="Headcount Trend">
                            {/* customer & headCount are correct keys from getLastSalarydet */}
                            {attrRows.length > 0
                                ? <ChartBox id="deptLeftDrill" height={300} options={{
                                    series: [{ name: 'Headcount', data: attrRows.map(x => Number(x.headCount ?? 0)) }],
                                    chart:  { type: 'bar' },
                                    plotOptions: { bar: { borderRadius: 8, distributed: true } },
                                    colors: ['#ef4444'],
                                    xaxis:  { categories: attrRows.map(x => x.customer ?? x.month ?? '') },
                                    legend: { show: false },
                                    dataLabels: { enabled: false },
                                }} />
                                : <EmptyChart height={300} />
                            }
                        </DetailSection>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const DetailSection = ({ title, children }) => (
    <View style={tw`mb-8`}>
        <Text style={tw`text-base font-bold text-slate-800 mb-4 px-2`}>{title}</Text>
        <View style={tw`bg-slate-50 rounded-3xl p-2`}>{children}</View>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    header:         { padding: 24, paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    welcome:        { fontSize: 13, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.5 },
    userName:       { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
    profileBtn:     { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    revenueCard:    { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 15, marginTop: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    revTitle:       { fontSize: 10, fontWeight: '800', color: '#fff', opacity: 0.6, letterSpacing: 1 },
    liveBadge:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    liveDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', marginRight: 6 },
    liveTxt:        { fontSize: 10, color: '#ef4444', fontWeight: '900' },
    content:        { padding: 16 },
    kpiCard:        { width: (W - 48) / 2, padding: 16, borderRadius: 24, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
    kpiIcon:        { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    kpiVal:         { fontSize: 22, fontWeight: '900', color: '#0f172a' },
    kpiLab:         { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
    section:        { backgroundColor: '#fff', borderRadius: 32, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.02 },
    sectionHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBox:        { padding: 10, borderRadius: 14, marginRight: 15 },
    sectionTitle:   { fontSize: 12, fontWeight: '900', color: '#1e293b', flex: 1, letterSpacing: 1 },
    sectionContent: { minHeight: 120 },
    tinyTitle:      { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 },
    detailBtn:      { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 12 },
    modalHeader:    { padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    modalTitle:     { color: '#fff', fontSize: 18, fontWeight: '900', marginLeft: 20 },
    closeBtn:       { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
});

export default MISDashboard;





