import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { NumbertoCurrency } from '../../../../components/Utils/NumberToCurrency';
import WebView from 'react-native-webview';

const LoanProgressBar = ({data}) => {


const [Loandata]= data || [{}]
const TOTLOANAMT=Loandata?.TOTLOANAMT
const TOTALPAID=Loandata?.TOTALPAID   
  const totalLoanAmount = TOTLOANAMT; // Total loan amount
   const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress value
const screenWidth = Dimensions.get('window').width;
  const chartHeight = Dimensions.get('window').height * 0.3; 
  const chartWidth = screenWidth - 20;


  const htmlRadialBarContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Delius&display=swap" rel="stylesheet">
      <style>
      *{
    font-family: "Delius", cursive !important;
       font-style: normal;
      }
        .apexcharts-text, .apexcharts-legend-text, .apexcharts-title-text, .apexcharts-datalabel-label {
     font-family: "Delius", cursive !important;
    }

    /* Adjust font size of legend and labels if needed */
    .apexcharts-legend-text {
      font-size: 40px !important;
    }
    .apexcharts-title-text {
      font-size: 40px !important;
    }
    .apexcharts-datalabel-label {
      font-size: 50px !important;
    }
       

     .apexcharts-toolbar button {
          font-size: 4px !important; /* Adjust size of icons */
          padding: 10px;   /* Add padding around the icons */
          min-width: 40px; /* Set minimum width */
        }

        .apexcharts-toolbar svg {
          width: 30px !important;  /* Increase icon size */
          height: 30px !important; /* Increase icon size */
        }

        .apexcharts-legend-text {
          font-size: 16px !important;
        }

      </style>
    </head>
    <body>
      <div id="radial"></div>
      <script>
        
        var options = {
          series: [${Math.round(progress * 100)}],
          chart: {
          type: 'radialBar',
          offsetY: -20,
          sparkline: {
            enabled: true
          }
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: "#E8EFF4",
              strokeWidth: '40%',
              margin: 5, // margin is in pixels
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                color: '#d7e5f5',
                opacity: .5,
                blur: 4
              }
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                offsetY: -2,
                fontSize: '70px'
              }
            }
          }
        },
        grid: {
          padding: {
            top: -10
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            shadeIntensity: 0.4,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 53, 91]
          },
        },
        };

        var chart = new ApexCharts(document.querySelector("#radial"), options);
        chart.render();
      
      
    
      
      

    </script>
    </body>
  </html>
`;

  // Calculate the progress (percentage) TOTALPAID<TOTLOANAMT
  useEffect(() => {
    const currentProgress = TOTALPAID / TOTLOANAMT;
    setProgress(currentProgress);
  }, [TOTALPAID]);

  return (
    <View style={styles.container} >
      
     <Text style={[styles.amountText,{bottom:"10%",right:30,fontSize:12}]}>
        Paid Loan: {NumbertoCurrency(TOTALPAID || 0)} 
      </Text>
      <Text style={[styles.amountText,{bottom:"10%",left:30,fontSize:12}]}>
        Total Loan: {NumbertoCurrency(totalLoanAmount || 0)}
      </Text>
      
           <WebView
                originWhitelist={['*']}
                source={{ html:htmlRadialBarContent }}
                scalesPageToFit={true} 
                style={{ height: chartHeight , width: chartWidth - 40 }}
                allowUniversalAccessFromFileURLs={true}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                zoomable={true}
              />
     {/* <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: '#fff',
    margin:0,marginTop:-10,
  },
  header: {
    fontSize: 16,
    marginBottom: 20,
  },
  amountText: {
    fontSize: 10,
    marginBottom: 10,
    fontWeight:"bold",
    position:"absolute",
    zIndex:10,

  },
  progressText: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default LoanProgressBar;


