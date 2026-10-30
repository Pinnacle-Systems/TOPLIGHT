import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert } from 'react-native';
import WebView from 'react-native-webview';
import { useAppTheme } from '../../../../theme';

const Department_Gender_Attense_chart = ({ departmentData, setClickedGender, setopenModal }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const webViewRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  const processData = useCallback((data) => {
    if (!data || !data.data) {
      return {
        malePresent: 0,
        femalePresent: 0,
        maleAbsent: 0,
        femaleAbsent: 0
      };
    }
    
    try {
      return data.data.reduce((acc, cur) => ({
        malePresent: acc.malePresent + (parseInt(cur.MALE_PRESENT) || 0),
        femalePresent: acc.femalePresent + (parseInt(cur.FEMALE_PRESENT) || 0),
        maleAbsent: acc.maleAbsent + (parseInt(cur.MALE_ABSENT) || 0),
        femaleAbsent: acc.femaleAbsent + (parseInt(cur.FEMALE_ABSENT) || 0)
      }), { 
        malePresent: 0, 
        femalePresent: 0,
        maleAbsent: 0,
        femaleAbsent: 0
      });
    } catch (error) {
      console.error('Error processing chart data:', error);
      setError('Failed to process attendance data');
      return {
        malePresent: 0,
        femalePresent: 0,
        maleAbsent: 0,
        femaleAbsent: 0
      };
    }
  }, []);

  const processedData = React.useMemo(() => {
    return departmentData ? processData(departmentData) : { 
      malePresent: 80, 
      femalePresent: 65,
      maleAbsent: 32,
      femaleAbsent: 25
    };
  }, [departmentData, processData]);

  const { 
    malePresent, 
    femalePresent, 
    maleAbsent, 
    femaleAbsent 
  } = processedData;


  const handleBarClick = useCallback((data) => {
    try {
      const genderStatus = String(data?.label)?.split(" ");
      if (genderStatus.length === 2) {
        setClickedGender(`${genderStatus[0].toUpperCase()}_${genderStatus[1].toUpperCase()}`);
        setopenModal(true);
      }
    } catch (error) {
      console.error('Error handling bar click:', error);
    }
  }, [setClickedGender, setopenModal]);

  // Memoize the HTML content to prevent unnecessary regenerations
  const htmlContent = React.useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
        
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: ${theme.colors.surface};
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }
          .chart-container {
            width: 100%;
            height: 100%;
            position: relative;
            padding: 10px;
          }
          canvas {
            width: 100% !important;
            height: 100% !important;
          }
          .error-message {
            color: ${theme.colors.danger};
            text-align: center;
            padding: 20px;
            font-size: 14px;
          }
          .loading-message {
            color: ${theme.colors.textSecondary};
            text-align: center;
            padding: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="chart-container">
          <canvas id="departmentChart"></canvas>
          <div id="errorMessage" class="error-message" style="display: none;"></div>
          <div id="loadingMessage" class="loading-message">Loading chart...</div>
        </div>
        <script>
          (function() {
            try {
              document.addEventListener("DOMContentLoaded", function() {
                document.getElementById('loadingMessage').style.display = 'none';
                
                const ctx = document.getElementById('departmentChart');
                if (!ctx) {
                  throw new Error('Canvas element not found');
                }
                
                const ctx2d = ctx.getContext('2d');
                if (!ctx2d) {
                  throw new Error('Canvas context not available');
                }
                
                // Chart configuration
                Chart.defaults.font.family = 'Arial, sans-serif';
                Chart.defaults.animation.duration = 1500;
                
                const chart = new Chart(ctx2d, {
                  type: 'bar',
                  data: {
                    labels: ['Male Present', 'Female Present', 'Male Absent', 'Female Absent'],
                    datasets: [{
                      label: 'Employees',
                      data: [${malePresent}, ${femalePresent}, ${maleAbsent}, ${femaleAbsent}],
                      backgroundColor: [
                        '${theme.colors.brand}',
                        '${theme.colors.accent}',
                        '${theme.colors.brandStrong}',
                        '${theme.colors.accentSoft}'
                      ],
                      borderColor: [
                        '${theme.colors.brand}',
                        '${theme.colors.accent}',
                        '${theme.colors.brandStrong}',
                        '${theme.colors.accent}'
                      ],
                      borderWidth: 1,
                      borderRadius: 4,
                      barPercentage: 0.6,
                      categoryPercentage: 0.8
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
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
                            return '';
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false,
                          color: '${theme.colors.divider}'
                        },
                        ticks: {
                          color: '${theme.colors.textSecondary}',
                          font: {
                            weight: '500'
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                          drawBorder: false
                        },
                        ticks: {
                          color: '${theme.colors.textSecondary}',
                          font: {
                            weight: '500'
                          }
                        }
                      }
                    },
                    onClick: function(evt, elements) {
                      if (elements.length > 0) {
                        const index = elements[0].index;
                        const label = this.data.labels[index];
                        const value = this.data.datasets[0].data[index];
                        
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'barClick',
                          data: {
                            label: label,
                            value: value
                          }
                        }));
                      }
                    }
                  }
                });
                
                // Notify React Native that chart loaded successfully
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'chartLoaded',
                  status: 'success'
                }));
              });
            } catch (error) {
              document.getElementById('loadingMessage').style.display = 'none';
              const errorElement = document.getElementById('errorMessage');
              errorElement.style.display = 'block';
              errorElement.innerText = 'Chart failed to load: ' + error.message;
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'chartError',
                error: error.message
              }));
            }
          })();
        </script>
      </body>
    </html>
  `, [malePresent, femalePresent, maleAbsent, femaleAbsent, theme]);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'barClick':
          handleBarClick(message.data);
          break;
          
        case 'chartLoaded':
          setIsLoading(false);
          setError(null);
          setShowRetryPrompt(false);
          if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
          break;
          
        case 'chartError':
          setIsLoading(false);
          setError(message.error || 'Failed to load chart');
          setShowRetryPrompt(true);
          if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      setError('Invalid data received from chart');
      setShowRetryPrompt(true);
    }
  }, [handleBarClick]);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setShowRetryPrompt(false);
    setRetryCount(prev => prev + 1);
    
    // Auto-retry up to 3 times
    if (retryCount < 2) {
      retryTimeoutRef.current = setTimeout(() => {
        handleRetry();
      }, 3000);
    }
  }, [retryCount]);

  return (
    <View style={styles.container}>
      <WebView
        key={`webview-${retryCount}`} // Simplified key to only track retries
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={[styles.chart, { backgroundColor: theme.colors.surface }]}
        javaScriptEnabled={true}
        renderToHardwareTextureAndroid={true}
        domStorageEnabled={true}
         setSupportMultipleWindows={false}
        onContentProcessDidTerminate={() => webViewRef.current.reload()}
        scalesPageToFit={true}
        mixedContentMode="always"
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        onLoadStart={() => {
          setIsLoading(true);
          setError(null);
        }}
        onLoadEnd={() => {
          // Timeout fallback in case chartLoaded message doesn't come
          loadingTimeoutRef.current = setTimeout(() => {
            if (isLoading) {
              setIsLoading(false);
              setError('Chart loading timed out');
              setShowRetryPrompt(true);
            }
          }, 5000);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`WebView error: ${nativeEvent.description}`);
          setIsLoading(false);
          setShowRetryPrompt(true);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`HTTP error: ${nativeEvent.statusCode}`);
          setIsLoading(false);
          setShowRetryPrompt(true);
        }}
        onMessage={handleWebViewMessage}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.brand} />
            <Text style={styles.loadingText}>Loading chart...</Text>
          </View>
        )}
      />
      
      {(isLoading || error || showRetryPrompt) && (
        <View style={styles.overlay}>
          {isLoading && !error && !showRetryPrompt && (
            <ActivityIndicator size="large" color={theme.colors.brand} />
          )}
          
          {(error || showRetryPrompt) && (
            <View style={styles.retryPrompt}>
              <Text style={styles.errorText}>
                {error || 'Chart failed to load'}
              </Text>
              <TouchableOpacity
                onPress={handleRetry}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>
                  {retryCount > 0 ? 'Try Again' : 'Retry'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.retryCountText}>
                {retryCount > 0 ? `Attempt ${retryCount + 1} of 3` : ''}
              </Text>
            </View>
          )}
        </View>
      )}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.scrim,
  },
  retryPrompt: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    elevation: 3,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.brand,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    color: theme.colors.brandContrast,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryCountText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

export default React.memo(Department_Gender_Attense_chart);
