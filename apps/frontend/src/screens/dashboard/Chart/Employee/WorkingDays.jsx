import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Dimensions, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  Text,
  StyleSheet, 
  useWindowDimensions
} from 'react-native';
import WebView from 'react-native-webview';
import CommonModal from '../../../../components/Modal/CommonModal';
import AllMonth from "../Month";
import DailyInOutBody from '../_Modal_BodyComponents/DailyInOutBody';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const LOAD_TIMEOUT = 8000;

function WorkingDaysChart({ data, isLoading: GetDataLoad, UserId, year }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showDaysInOutModal, setshowDaysInOutModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState();
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Dimensions handling
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width - 30,
    height: Math.min(Dimensions.get('window').height * 0.35, 300)
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width - 30,
        height: Math.min(window.height * 0.35, 300)
      });
    });
    return () => subscription?.remove();
  }, []);

  // Prepare chart data
  const prepareChartData = useCallback(() => {
    if (!data) return { labels: [], values: [] };

    const sortedData = [...data].sort((a, b) => {
      const monthA = a[0]?.split(" ")[0] || '';
      const monthB = b[0]?.split(" ")[0] || '';
      return AllMonth.indexOf(monthA) - AllMonth.indexOf(monthB);
    });

    const labels = [];
    const values = [];

    sortedData.forEach((item) => {
      if (item && item[0]) {
        labels.push(`'${item[0].split(" ")[0].slice(0, 3)}'`);
        values.push(item[1]);
      }
    });

    return { labels, values };
  }, [data]);

  const { labels, values } = prepareChartData();
  const chartHeight = dimensions.height;
  const chartWidth = dimensions.width;
  const hasData = data && data.length > 0 && values.some(val => val !== undefined && val !== null);

  // HTML template for the chart
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
          .chart-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: white;
          }
          canvas {
            width: 100% !important;
            height: 100% !important;
          }
          .no-data-message {
            text-align: center;
            padding: 20px;
            font-size: 16px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="chart-container">
          ${hasData ? `
            <canvas id="workingDaysChart"></canvas>
          ` : `
            <div class="no-data-message">
              No working days data available
            </div>
          `}
        </div>
        ${hasData ? `
        <script>
          (function() {
            try {
              if (typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined') {
                throw new Error('Chart libraries not loaded');
              }

              const ctx = document.getElementById('workingDaysChart');
              if (!ctx) throw new Error('Canvas not found');
              
              const ctx2d = ctx.getContext('2d');
              if (!ctx2d) throw new Error('Canvas context not available');
              
              Chart.register(ChartDataLabels);
              
              new Chart(ctx2d, {
                type: 'bar',
                data: {
                  labels: [${labels}],
                  datasets: [{
                    data: [${values}],
                    backgroundColor: function(context) {
                      const value = context.dataset.data[context.dataIndex];
                      return value < 24 ? '#f5bfbf' : '#99c2ff';
                    },
                    borderColor: function(context) {
                      const value = context.dataset.data[context.dataIndex];
                      return value < 24 ? '#FF0000' : '#c8e3e8';
                    },
                    borderWidth: 1,
                    borderRadius: 10,
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  onClick: function(evt, elements) {
                    if (elements.length > 0) {
                      const label = this.data.labels[elements[0].index];
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'chartClick',
                        category: label
                      }));
                    }
                  }
                }
              });
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'chartLoaded'
              }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'chartError',
                error: error.message
              }));
            }
          })();
        </script>
        ` : ''}
      </body>
    </html>
  `;

  const handleWebViewMessage = useCallback((event) => {
    try {
      const messageData = JSON.parse(event.nativeEvent.data);
      
      switch (messageData.type) {
        case 'chartClick':
          const Month = AllMonth.find((item) => item.slice(0, 3) === messageData.category.replace(/'/g, ''));
          setSelectedMonth(Month);
          setshowDaysInOutModal(true);
          break;
          
        case 'chartLoaded':
          setIsLoading(false);
          setError(null);
          break;
          
        case 'chartError':
          setIsLoading(false);
          setError(messageData.error || 'Chart failed to load');
          break;
      }
    } catch (e) {
      console.error("Error parsing WebView message:", e);
    }
  }, []);

  // Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Loading timed out');
      }
    }, LOAD_TIMEOUT);

    return () => clearTimeout(timer);
  }, [isLoading]);

  if (GetDataLoad) {
    return (
      <View style={[styles.container, { height: chartHeight - 40, width: chartWidth - 20 }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasData && !GetDataLoad) {
    return (
      <View style={[styles.noDataContainer, { 
        height: isLandscape ? 400 : chartHeight - 40, 
        width: isLandscape ? "auto" : chartWidth - 20,
      }]}>
        <MaterialCommunityIcons name="chart-line" size={40} color="#ccc" />
        <Text style={styles.noDataText}>No working days data available</Text>
      </View>
    );
  }

  return (
    <>
      <CommonModal 
        height="70%"
        isModalVisible={showDaysInOutModal} 
        BodyComponent={
          <DailyInOutBody 
            UserId={UserId?.UserId} 
            payperiod={`${selectedMonth} ${year}`} 
            COMPCODE={UserId?.GCOMPCODE} 
          />
        } 
        setIsModalVisible={setshowDaysInOutModal} 
        Title="Days List"
      />
      
      <View style={{ 
        height: isLandscape ? 350 : chartHeight - 40, 
        width: chartWidth - 20,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden'
      }}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
           renderToHardwareTextureAndroid={true}
        domStorageEnabled={true}
          setSupportMultipleWindows={false}
            onContentProcessDidTerminate={() => webViewRef.current.reload()}
          onLoadStart={() => setIsLoading(true)}
          onError={() => setError('WebView failed to load')}
          javaScriptEnabled={true}
          startInLoadingState={true}
          onMessage={handleWebViewMessage}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setIsLoading(true);
                webViewRef.current.reload();
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  noDataText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20
  },
  errorText: {
    color: '#FF4560',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center'
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#667EEA',
    borderRadius: 5,
    minWidth: 120
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default WorkingDaysChart;

