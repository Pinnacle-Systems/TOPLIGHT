import React, { useState } from 'react'
import { Alert, Dimensions } from 'react-native';
import WebView from 'react-native-webview'
import CustomText from '../../../Text/CustomText';

function  ToTExpenses({data,setscroll,isLoading:GetDataLoad}) {
const [isLoading, setIsLoading] = useState(false);
const screenWidth = Dimensions.get('window').width;
  const chartHeight = Dimensions.get('window').height * 0.3; 
  const chartWidth = screenWidth - 20;

  var label=[];
  var value=[];


  if(data?.length>0){
    data?.forEach((data)=>{
        label.push(`'${data[1]}'`)
        value.push(Number(data[0]))

    })

  }






  const htmlRadialBarContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
      <style>
        * {
          font-family: "Open Sans", sans-serif !important;
          font-size: 25px !important;
        }

        body {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        #Biechart {
          max-width: 100%;
          width: 100%;
        }

        .apexcharts-legend-text {
          font-size: 25px !important;
        }

        .apexcharts-datalabel-label {
          font-size: 18px !important;
        }
      </style>
    </head>
    <body>
      <div id="Biechart"></div>
      <script>
        // Ensure data is defined, otherwise set to default
         // If data is available, use it; otherwise default to 0

        // Ensure the label always shows
        var options = {
          series: [${value || []}],  // Using the fallback value if data is missing
          chart: {
            type: 'donut',
            width: '100%',
            height: 600,
             toolbar: {
              show: true, // Ensures that the toolbar is always visible
            },
          },
          labels: [${label || []}],  // Label will always show as "Salaries"
          legend: {
            position: 'bottom',
             labels: {
              fontSize: '24px',  // Set font size for legend labels
            }
          },
          plotOptions: {
            pie: {
              donut: {
                size: '55%' // size of the donut hole
              }
            }
          },
          dataLabels: {
            style: {
              fontSize: '25px'
            }
          },
          tooltip: {
          enabled: true,
            style: {
              fontSize: '16px'
            }
          }
        };

        var chart = new ApexCharts(document.querySelector("#Biechart"), options);
        chart.render().then(() => {
  chart._tooltip?.show({
    seriesIndex: 0,
    dataPointIndex: 0
  });

    
});
      </script>
    </body>
  </html>
`;





    



  return (
    <WebView
    originWhitelist={['*']}
    source={{ html:htmlRadialBarContent }}
    style={{ height: chartHeight-40, width: chartWidth - 40,padding:0}}
    onLoadStart={() => setIsLoading(true)}
    onLoadEnd={() => setIsLoading(false)}
    onError={() => setIsLoading(false)}
  />
  )
}

export default ToTExpenses