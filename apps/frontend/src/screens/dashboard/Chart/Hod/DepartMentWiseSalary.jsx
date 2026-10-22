import React, { useMemo, useEffect, useState } from 'react'
import { Dimensions, View, ActivityIndicator, StyleSheet, Modal, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview'
import CustomText from '../../../../components/text/CustomText';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../../../theme';

function DepartMentWisalary({data,setscroll,isLoading:GetDataLoad}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
    
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const screenWidth = Dimensions.get('window').width;

 const { width, height } = useWindowDimensions()
    const isLandscape = width > height; 

  const chartViewHeight = isLandscape ? 420 : Math.min(height * 0.46, 380);
  const chartWidth =width;
   // const landscapeHeight = Dimensions.get('window').width * 0.8;
  //const landscapeWidth = Dimensions.get('window').height * 0.8;
  var label=[];
  var value=[];


  if(data?.length>0){
    data?.forEach((data)=>{
        label.push(`'${data[0]}'`)
        value.push(data[1])

    })

  }

   


  
  


 






  const funnel=` <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
       <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: "Open Sans", sans-serif !important; }
          html, body {
            width: 100%;
            height: ${chartViewHeight}px;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: ${theme.colors.surface};
          }
          #chart { width: 100%; height: ${chartViewHeight}px; }
          #chart .apexcharts-canvas { width: 100% !important; height: ${chartViewHeight}px !important; }
          .apexcharts-xaxis-label, .apexcharts-yaxis-label, .apexcharts-text, .apexcharts-tooltip-text {
            font-family: "Open Sans", sans-serif !important;
          }
        </style>
      </head>
      <body>
        <div id="chart"></div>
        <script>
      
        var options = {
          series: [{
          data: [${value || []}]
        }],
          chart: {
            type: 'line',
            height: ${isModalVisible ? height + 500 : chartViewHeight},
            background: '${theme.colors.surface}',
            foreColor: '${theme.colors.textSecondary}',
            parentHeightOffset: 0,
            redrawOnParentResize: true,
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 500 },
        },
        plotOptions: {
          bar: {
            horizontal:false,
             borderRadius: 4,
              columnWidth: '50%', // Adjust bar width
              dataLabels: {
                position: 'top',
                padding:'40px'
              }
          }
        },
        dataLabels: {
          enabled: false,
          style: {
            fontSize: '10px',
            colors: ['${theme.colors.text}']
          },
        },
        stroke: {
          curve: 'smooth',
          width: 3,
          lineCap: 'round'
        },
        markers: {
          size: 4,
          strokeWidth: 0,
          hover: { size: 6 }
        },
        xaxis: {
          categories:  [${label || []}],
          axisBorder: { color: '${theme.colors.borderSubtle}' },
          axisTicks: { color: '${theme.colors.borderSubtle}' },
          labels: {
            style: { colors: '${theme.colors.textSecondary}', fontSize: '10px' },
            trim: true,
            rotate: -35
          }
        },
        yaxis: {
          axisTicks: {
            show: true
          },
          labels: {
            style: { colors: '${theme.colors.textSecondary}', fontSize: '10px' },
            formatter: function(val) { return '₹' + Number(val).toLocaleString('en-IN'); }
          }
        },
       tooltip: {
          theme: '${theme.mode}',
          y: {
            formatter: function(val) {
              return "₹" + val.toLocaleString('en-IN');
            }
          }
        },
        grid: {
          borderColor: '${theme.colors.divider}',
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
          padding: { left: 8, right: 8, top: 8, bottom: 8 }
        },
        colors: ['${theme.colors.brand}']
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
      
    
      </script>
      </body>
    </html>
`



    



  return (<>
 {/* <TouchableOpacity 
          onPress={() => setIsModalVisible(true)}
          style={styles.fullscreenButton}
        >
          <MaterialIcons name="fullscreen" size={24} color={theme.colors.brand} />
        </TouchableOpacity> */}
    <WebView
    originWhitelist={['*']}
    source={{ html:funnel }}
    style={{ height: chartViewHeight, width: chartWidth - 70, backgroundColor: theme.colors.surface }}
    onLoadStart={() => setIsLoading(true)}
    onLoadEnd={() => setIsLoading(false)}
    onError={() => setIsLoading(false)}
  />
  <Modal
        visible={isModalVisible}
        transparent={false}
        animationType="slide"
        supportedOrientations={['landscape']}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>Department Salary (Landscape View)</CustomText>
            <TouchableOpacity 
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.brandContrast} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.landscapeContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: funnel }}
              style={styles.landscapeWebView}
              javaScriptEnabled={true}
              scalesPageToFit={true}
              automaticallyAdjustContentInsets={false}
            />
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
        </View>
      )}

      </>
  )
}

const createStyles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 10,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  fullscreenButton: {
    position: 'absolute',
    top: 10,
    right:"57%",
    zIndex: 1,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.brand,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.brandContrast,
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.scrim,
  },
  landscapeContainer: {
    flex: 1,
    width: '100%',
  },
  landscapeWebView: {
    flex: 1,
     width:Dimensions.get('window').width+10,
    transform: [{scale: 1 },{ rotate: '90deg'}],
    marginLeft:"43%"
  },
});


export default DepartMentWisalary
