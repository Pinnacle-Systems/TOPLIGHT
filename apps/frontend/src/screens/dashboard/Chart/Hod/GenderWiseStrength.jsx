
import React, { useMemo } from 'react'
import { Dimensions, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme } from '../../../../theme';

function GenderWiseStrength({ data }) {
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const chartHeight = isLandscape ? 260 : Math.min(Dimensions.get('window').height * 0.3, 280);
  const chartWidth = width - 20;
  const labels = data?.map(item => `'${String(item[0]).replace(/'/g, "\\'")}'`) || [];
  const values = data?.map(item => Number(item[1]) || 0) || [];
  const hasData = values.some(value => value > 0);
  const styles = useMemo(() => createStyles(theme, chartHeight), [theme, chartHeight]);




  const linechart = `
  <!DOCTYPE html>
  <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
      <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body {
          margin: 0;
          padding: 0;
          background: ${theme.colors.surface};
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }
        #chart { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="chart" ></div>
      <script>
        document.addEventListener("DOMContentLoaded", function () {
        
        var options = {
          series: [${values}],
          chart: {
            width: ${chartWidth - 40},
            height: ${chartHeight - 24},
            foreColor: '${theme.colors.textSecondary}',
            background: '${theme.colors.surface}',
            type: 'donut',
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 600,
              animateGradually: { enabled: true, delay: 100 }
            }
        },
        labels: [${labels}],
         theme: { mode: '${theme.mode}' },
         colors: ['${theme.colors.brand}', '${theme.colors.accent}'],
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 270,
            donut: { size: '68%' }
          }
        },
        dataLabels: {
          enabled: true,
          style: { fontSize: '12px', fontWeight: 600, colors: ['${theme.colors.text}'] }
        },
        fill: {
          type: 'gradient',
        },
        legend: {
          position: 'bottom',
          fontSize: '12px',
          labels: { colors: '${theme.colors.textSecondary}' },
          markers: { width: 9, height: 9, radius: 9 },
          itemMargin: { horizontal: 10, vertical: 4 },
          formatter: function(val, opts) {
            return val + " - " + opts.w.globals.series[opts.seriesIndex]
          }
        },
        responsive: [{
          breakpoint: 490,
          options: {
            chart: {
              width: ${Math.min(chartWidth - 40, 400)},
            },
            legend: {
              position: 'left'
            }
          }
        }]
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
        });
      </script>
    </body>
  </html>
  `;
  
  






  return (
    <>
      {hasData ? (
        <WebView
          originWhitelist={['*']}
          source={{ html: linechart }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderToHardwareTextureAndroid={true}
          setSupportMultipleWindows={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="users" size={22} color={theme.colors.brand} />
          </View>
          <Text style={styles.emptyTitle}>Gender data is not available</Text>
          <Text style={styles.emptyDescription}>Employee distribution will appear here when data is available.</Text>
        </View>
      )}
    </>
  );
  
}

const createStyles = (theme, chartHeight) => StyleSheet.create({
  webView: {
    height: chartHeight - 24,
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
  emptyState: {
    minHeight: 220,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: theme.colors.surfaceSunken,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brandSoft,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: 5,
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default GenderWiseStrength
