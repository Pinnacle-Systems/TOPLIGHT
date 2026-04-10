import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Dimensions,
    StyleSheet, RefreshControl, Animated, ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import tw from 'twrnc';
import {
    useGetMisDashboardQuery,
    useGetYearlyCompQuery,
    useGetMisDashboardOrdersInHandQuery
} from '../../redux/service/misDashboardService';
import ScreenRotationWrapper from '../Utils/ScreenRotateHandler';

const { width } = Dimensions.get('window');

// ── Chart HTML Builder ─────────────────────────────────────────────────────────
const buildChartHTML = (id, optionsJson, height = 280) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Roboto', sans-serif !important; margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; overflow: hidden; padding: 10px; }
    #chart { width: 100%; }
    .apexcharts-text, .apexcharts-legend-text { font-size: 12px !important; }
  </style>
</head>
<body>
  <div id="${id}"></div>
  <script>
    try {
      const chart = new ApexCharts(document.querySelector('#${id}'), ${optionsJson});
      chart.render();
    } catch(e) { document.body.innerHTML = '<p style="color:red">'+e.message+'</p>'; }
  </script>
</body>
</html>`;

// ── Helper: Format Currency ──
const formatValue = (val) => {
    const n = Number(val) || 0;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
};

// ── KPI Card Component ──
const StatCard = ({ title, value, icon, color, gradient }) => (
    <LinearGradient
        colors={gradient || ['#ffffff', '#f8fafc']}
        style={[styles.statCard, tw`shadow-sm`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={tw`flex-row justify-between items-start`}>
            <View style={[tw`p-2 rounded-lg`, { backgroundColor: `${color}20` }]}>
                <Icon name={icon} size={22} color={color} />
            </View>
        </View>
        <Text style={[tw`text-2xl font-bold mt-3`, { color: '#1e293b' }]}>{value}</Text>
        <Text style={tw`text-xs text-gray-500 font-medium uppercase tracking-wider`}>{title}</Text>
    </LinearGradient>
);

const StandardDashboard = () => {
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    // ── Data Fetching ──
    const { data: mainData, refetch: refetchMain, isLoading: isMainLoading } = useGetMisDashboardQuery({ params: {} });
    const { data: trendData, refetch: refetchTrend, isLoading: isTrendLoading } = useGetYearlyCompQuery({ params: {} });
    const { data: insuranceData, refetch: refetchIns } = useGetMisDashboardOrdersInHandQuery({ params: {} });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchMain(), refetchTrend(), refetchIns()]);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    }, []);

    if (isMainLoading || isTrendLoading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={tw`mt-4 font-medium text-gray-500`}>Generating Insights...</Text>
            </View>
        );
    }

    const d = mainData?.data || {};
    
    // Aggregates for Insurance
    const urgentIns = insuranceData?.data?.filter(i => i.dueDays < 30)?.length || 0;

    // ── Chart 1: Staff vs Non-Staff Headcount ──
    const headcountChart = buildChartHTML('hc', JSON.stringify({
        series: [Number(d.totalTurnOver) || 0, Number(d.totalTurnOver1) || 0],
        chart: { type: 'donut', height: 260 },
        labels: ['Staff', 'Non-Staff'],
        colors: ['#3b82f6', '#10b981'],
        plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', formatter: () => (Number(d.totalTurnOver || 0) + Number(d.totalTurnOver1 || 0)).toString() } } } } },
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' }
    }));

    // ── Chart 2: Staff vs Non-Staff Salary & Benefits (Grouped Bar) ──
    const comparativeChart = buildChartHTML('comp', JSON.stringify({
        series: [
            { name: 'Staff', data: [Number(d.topCustomers) || 0, Number(d.loss01) || 0, Number(d.loss11) || 0] },
            { name: 'Non-Staff', data: [Number(d.newCustomers) || 0, Number(d.loss) || 0, Number(d.loss1) || 0] }
        ],
        chart: { type: 'bar', height: 280, toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        xaxis: { categories: ['Net Pay', 'PF', 'ESI'] },
        colors: ['#3b82f6', '#10b981'],
        dataLabels: { enabled: false },
        yaxis: { labels: { formatter: (v) => formatValue(v) } },
        tooltip: { y: { formatter: (v) => formatValue(v) } }
    }));

    // ── Chart 3: Headcount Trend ──
    const trendRows = trendData?.data || [];
    const trendChart = buildChartHTML('trend', JSON.stringify({
        series: [{ name: 'Headcount', data: trendRows.map(r => r.total || r.value || 0) }],
        chart: { type: 'area', height: 260, toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
        xaxis: { categories: trendRows.map(r => r.customer || r.category || 'N/A') },
        colors: ['#6366f1'],
        dataLabels: { enabled: false },
        grid: { borderColor: '#f1f5f9' }
    }));

    return (
        <ScreenRotationWrapper>
            <ScrollView
                style={tw`flex-1 bg-gray-50`}
                contentContainerStyle={tw`p-4 pb-12`}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#3b82f6" />}
            >
                {/* Header Section */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={tw`mb-6`}>
                        <Text style={tw`text-2xl font-extrabold text-gray-900`}>Company Dashboard</Text>
                        <Text style={tw`text-sm text-gray-500 font-medium`}>Real-time Operational Performance</Text>
                    </View>

                    {/* Top KPI Row */}
                    <View style={tw`flex-row flex-wrap justify-between mb-2`}>
                        <StatCard 
                            title="Total Workforce" 
                            value={(Number(d.totalTurnOver || 0) + Number(d.totalTurnOver1 || 0)).toString()} 
                            icon="account-group" 
                            color="#3b82f6" 
                        />
                        <StatCard 
                            title="Net Payable" 
                            value={formatValue(Number(d.topCustomers || 0) + Number(d.newCustomers || 0))} 
                            icon="cash-multiple" 
                            color="#10b981" 
                        />
                    </View>
                    <View style={tw`flex-row flex-wrap justify-between mb-6`}>
                        <StatCard 
                            title="Leavers Today" 
                            value={(Number(d.profit || 0) + Number(d.profit1 || 0)).toString()} 
                            icon="account-minus" 
                            color="#ef4444" 
                        />
                        <StatCard 
                            title="Insurance Alerts" 
                            value={urgentIns.toString()} 
                            icon="shield-alert" 
                            color="#f59e0b" 
                        />
                    </View>

                    {/* Section: workforce Distribution */}
                    <View style={styles.sectionCard}>
                        <View style={tw`flex-row items-center mb-4`}>
                            <Icon name="chart-pie" size={18} color="#475569" style={tw`mr-2`} />
                            <Text style={tw`text-base font-bold text-gray-700`}>Workforce Distribution</Text>
                        </View>
                        <View style={{ height: 260 }}>
                            <WebView originWhitelist={['*']} source={{ html: headcountChart }} style={tw`bg-transparent`} scrollEnabled={false} />
                        </View>
                        <View style={tw`flex-row justify-around border-t border-gray-100 pt-4 mt-2`}>
                            <View style={tw`items-center`}>
                                <Text style={tw`text-lg font-bold text-blue-600`}>{d.totalTurnOver}</Text>
                                <Text style={tw`text-xs text-gray-400`}>Staff</Text>
                            </View>
                            <View style={tw`items-center`}>
                                <Text style={tw`text-lg font-bold text-green-600`}>{d.totalTurnOver1}</Text>
                                <Text style={tw`text-xs text-gray-400`}>Non-Staff</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section: Comparative Analysis */}
                    <View style={styles.sectionCard}>
                        <View style={tw`flex-row items-center mb-4`}>
                            <Icon name="chart-bar" size={18} color="#475569" style={tw`mr-2`} />
                            <Text style={tw`text-base font-bold text-gray-700`}>Financial Comparative (Staff vs Non-Staff)</Text>
                        </View>
                        <View style={{ height: 300 }}>
                            <WebView originWhitelist={['*']} source={{ html: comparativeChart }} style={tw`bg-transparent`} scrollEnabled={false} />
                        </View>
                    </View>

                    {/* Section: Turnover / Exit */}
                    <View style={tw`flex-row gap-4 mb-6`}>
                        <View style={[styles.sectionCard, tw`flex-1 mb-0`]}>
                             <Text style={tw`text-sm font-bold text-gray-600 mb-2`}>Leavers (Staff)</Text>
                             <Text style={tw`text-2xl font-black text-red-500`}>{d.profit || 0}</Text>
                             <Text style={tw`text-xs text-gray-400 mt-1`}>This Period</Text>
                        </View>
                        <View style={[styles.sectionCard, tw`flex-1 mb-0`]}>
                             <Text style={tw`text-sm font-bold text-gray-600 mb-2`}>Leavers (Non-Staff)</Text>
                             <Text style={tw`text-2xl font-black text-orange-500`}>{d.profit1 || 0}</Text>
                             <Text style={tw`text-xs text-gray-400 mt-1`}>This Period</Text>
                        </View>
                    </View>

                    {/* Section: Headcount Trend */}
                    <View style={styles.sectionCard}>
                        <View style={tw`flex-row items-center mb-4`}>
                            <Icon name="chart-line" size={18} color="#475569" style={tw`mr-2`} />
                            <Text style={tw`text-base font-bold text-gray-700`}>Strength Trend (Across Companies)</Text>
                        </View>
                        <View style={{ height: 260 }}>
                            <WebView originWhitelist={['*']} source={{ html: trendChart }} style={tw`bg-transparent`} scrollEnabled={false} />
                        </View>
                    </View>

                </Animated.View>
            </ScrollView>
        </ScreenRotationWrapper>
    );
};

const styles = StyleSheet.create({
    statCard: {
        width: (width - 40) / 2,
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    }
});

export default StandardDashboard;
