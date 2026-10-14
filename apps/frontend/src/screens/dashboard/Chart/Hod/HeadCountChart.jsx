import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import WebView from 'react-native-webview';
import { useAppTheme } from '../../../../theme';

const DepartmentGenderChart = ({ departmentData,setClickedGender,setopenModal,chnage_data }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const processData =useCallback((data) => {

   
   
    
    try {
      return data?.data?.reduce((acc, cur) => ({
        male: acc.male + (parseInt(cur.MALE)) || 0,
        female: acc.female + (parseInt(cur.FEMALE)) || 0
      }), { male: 0, female: 0 });
    } catch (error) {
      console.error('Error processing chart data:', error);
      return { male: 0, female: 0 };
    }
  },[departmentData?.data,chnage_data])

 

  const { male, female } = departmentData?.data ? processData(departmentData) : { male: 112, female: 90 };
  const total = male + female;
  const malePercentage = total > 0 ? Math.round((male / total) * 100) : 0;
  const femalePercentage = total > 0 ? Math.round((female / total) * 100) : 0;


//   useEffect(()=>{
// Alert.alert("dfdf",JSON?.stringify())
//   },[chnage_data])
  const handleTooltipClick = (data) => {
    setClickedGender(String(data?.label)?.split(" ")[0].toUpperCase())
    setopenModal(true)
  };

  const htmlContent = useMemo(()=>{
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 95%;
            background-color: ${theme.colors.surface};
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .chart-container {
            width: 100%;
            height: 100%;
            position: relative;
          }
          .chart-center-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-family: Arial, sans-serif;
          }
          .total-count {
            font-size: 24px;
            font-weight: bold;
            color: ${theme.colors.text};
          }
          .total-label {
            font-size: 14px;
            color: ${theme.colors.textSecondary};
          }
          canvas {
            width: 100% !important;
            height: 100% !important;
          }
        </style>
      </head>
      <body>
        <div class="chart-container">
          <canvas id="departmentChart"></canvas>
          <div class="chart-center-text">
            <div class="total-count">${total}</div>
            <div class="total-label">Total Employees</div>
          </div>
        </div>
        <script>
          const ctx = document.getElementById('departmentChart');
          
          // Chart configuration
          Chart.defaults.font.family = 'Arial, sans-serif';
          Chart.defaults.animation.duration = 1500;
          Chart.defaults.elements.arc.borderWidth = 0;
          
          const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Male (${malePercentage}%)', 'Female (${femalePercentage}%)'],
              datasets: [{
                data: [${male}, ${female}],
                backgroundColor: [
                  '${theme.colors.brand}',
                  '${theme.colors.accent}'
                ],
                hoverBackgroundColor: [
                  '${theme.colors.brandStrong}',
                  '${theme.colors.accent}'
                ],
                borderWidth: 0,
                cutout: '70%'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '${theme.colors.textSecondary}',
                    font: {
                      size: 12,
                      weight: '600'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8
                  }
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: '${theme.colors.surfaceRaised}',
                  titleColor: '${theme.colors.text}',
                  bodyColor: '${theme.colors.text}',
                  borderColor: '${theme.colors.border}',
                  borderWidth: 1,
                  padding: 12,
                  cornerRadius: 8,
                  displayColors: false,
                  callbacks: {
                    label: function(context) {
                      return \`\${context.label}: \${context.raw} employees\`;
                    },
                    title: function() {
                      return '';  // Remove title
                    }
                  }
                }
              },
              animation: {
                animateScale: true,
                animateRotate: true
              },
              onClick: function(evt, elements) {
                if (elements.length > 0) {
                  const index = elements[0].index;
                  const label = this.data.labels[index];
                  const value = this.data.datasets[0].data[index];
                  
                  // Send data to React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'tooltipClick',
                    data: {
                      label: label,
                      value: value
                    }
                  }));
                }
              },
              cutout: '70%',
              rotation: -90,
              circumference: 360,
              radius: '100%'
            }
          });
        </script>
      </body>
    </html>
  `},[chnage_data?.label, theme])

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={[styles.chart, { backgroundColor: theme.colors.surface }]}
        javaScriptEnabled={true}
      renderToHardwareTextureAndroid={true}
        domStorageEnabled={true}
          setSupportMultipleWindows={false}
        scalesPageToFit={true}
        mixedContentMode="always"
        injectedJavaScript={`
          const meta = document.createElement('meta'); 
          meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'); 
          meta.setAttribute('name', 'viewport'); 
          document.getElementsByTagName('head')[0].appendChild(meta);
          true;
        `}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'tooltipClick') {
              handleTooltipClick(message.data);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }}
      />
    </View>
  );
};

const createStyles = theme => StyleSheet.create({
  container: {
    height: 320,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  chart: {
    flex: 1,
  },
});

export default React.memo(DepartmentGenderChart);
