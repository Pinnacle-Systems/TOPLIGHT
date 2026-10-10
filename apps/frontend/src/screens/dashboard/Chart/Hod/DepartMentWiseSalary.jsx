import React, { useEffect, useState } from 'react'
import { Dimensions, View, ActivityIndicator, StyleSheet, Modal, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview'
import CustomText from '../../../../components/Text/CustomText';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';

function DepartMentWisalary({data,setscroll,isLoading:GetDataLoad}) {
    
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const screenWidth = Dimensions.get('window').width;

 const { width, height } = useWindowDimensions()
    const isLandscape = width > height; 

  const chartHeight = isLandscape ? 1200 : Dimensions.get('window').height ; 

  const originalhieht=chartHeight*0.3
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
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
       <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
        <style>
      * {
        font-family: "Open Sans", sans-serif !important;
        font-style: normal;
        font-size:20px !important;
        ${isLandscape ? "height:100%;" : ""}
        

      }
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
           height: "${ isModalVisible ? chartHeight+500 :  (chartHeight/2)+(chartHeight/3.5)}",
           
           
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
          style: {
            fontSize: '12px',
            colors: ['#000']
          },
        },
        xaxis: {
          categories:  [${label || []}],
          
        },
        grid: {
          xaxis: {
            lines: {
              show: true
            }
          }
        },
        yaxis: {
          axisTicks: {
            show: true
          }
        },
       tooltip: {
          theme: 'light',
          y: {
            formatter: function(val) {
              return "₹" + val.toLocaleString('en-IN');
            }
          }
        },
           grid: {
          borderColor: '#e0e0e0',
          strokeDashArray: 4
        },
        colors: ['#3B82F6']
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
          <MaterialIcons name="fullscreen" size={24} color="#3B82F6" />
        </TouchableOpacity> */}
    <WebView
    originWhitelist={['*']}
    source={{ html:funnel }}
    style={{ height: originalhieht, width: chartWidth - 70 }}
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
              <MaterialIcons name="close" size={24} color="#fff" />
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
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 10,
    shadowColor: '#000',
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
    backgroundColor: '#fff',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3B82F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
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

