import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { push } from "../../../redux/features/opentabs";
import {
  Card,
  Typography,
  useTheme,
  CircularProgress,
  CardContent,
  CardHeader,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useGetMisDashboardOTWagesDetQuery, useGetMisDashboardSalaryDetQuery } from "../../../redux/service/misDashboardService";
import { Box } from "@mui/material";
import { Margin } from "@mui/icons-material";

const HomeOTWages = () => {
  const theme = useTheme();
  const {
    data: Salarydata,
    isLoading,
    isError,
    error,
  } = useGetMisDashboardOTWagesDetQuery({ params: {} });

  console.log(Salarydata,"OTWages");
  

  const dispatch = useDispatch();

  if (isLoading)
    return (
      <Card sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Card>
    );

  if (isError)
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Error: {error?.message || "Failed to load data"}
      </Typography>
    );

  const employees = Salarydata?.data || [];

  const totalsByComp = employees.reduce((acc, emp) => {
    const code = emp.COMPCODE || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.OTWAGES || 0);
    return acc;
  }, {});

  console.log(totalsByComp, "Salarydata");


  // const chartData = Object.entries(sumByCompany).map(([company, total]) => ({
  //   name: company,
  //   value: total,
  // }));


  const compList = Object.entries(totalsByComp).map(
    ([code, total], index, arr) => {
      const prevTotal = index > 0 ? arr[index - 1][1] : total;
      const trendDir = total >= prevTotal ? "up" : "down";
      const color = trendDir === "up" ? "success.main" : "error.main";
      return { COMPCODE: code, OTWAGES: total, trendDir, color };
    }
  );
  console.log(compList, "compList");

  const Totalvalue = compList?.map((x) => x.OTWAGES);
  // const company = compList?.map((x) => x.COMPCODE);

  const Sumtotal = Totalvalue?.reduce((sum, total) => sum + total);
 
  const option = {
    chart: {
        type: 'pie',
        height: 200 ,
        custom: {},
        // margin:[0,0,0,0],
        events: {
            render() {
                const chart = this,
                    series = chart.series[0];
                let customLabel = chart.options.chart.custom.label;

                if (!customLabel) {
                    customLabel = chart.options.chart.custom.label =
                        chart.renderer.label(
                            'Total<br/>' +
                              `<strong>${Sumtotal.toLocaleString()}</strong>`
                        )
                            .css({
                                color:
                                    'var(--highcharts-neutral-color-100, #000)',
                                textAnchor: 'middle',
                                fontSize:'100px',
                                
                            })
                            .add();
                }

                const x = series.center[0] + chart.plotLeft,
                    y = series.center[1] + chart.plotTop -
                    (customLabel.attr('height') / 2);

                customLabel.attr({
                    x,
                    y
                });
                // Set font size based on chart diameter
                customLabel.css({
                    fontSize: `${series.center[2] / 12}px`
                });
            }
        }
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    title: {
        text: null
    },

    tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    legend: {
        enabled: false
    },
    plotOptions: {
        series: {
            allowPointSelect: true,
            cursor: 'pointer',
            borderRadius: 3,
            dataLabels: [{
                enabled: true,
                distance: 20,
                format: '{point.name}'
            }, {
                enabled: true,
                distance: -15,
                format: '{point.y}',
                style: {
                    fontSize: '0.9em'
                }
            }],
            showInLegend: true
        }
    },
    series: [{
        name: 'OTwages',
        colorByPoint: true,
        innerSize: '75%',
        data: compList?.map((x,i)=>({
          name:x.COMPCODE,
          y:x.OTWAGES,
        }))
    }]
  }

  // Build the chart
const options={
    chart: {
      height:280,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: null
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<span style="font-size: 1.2em"><b>{point.name}</b>' +
                    '</span><br>' +
                    '<span style="opacity: 0.6">{point.percentage:.1f} ' +
                    '%</span>',
                connectorColor: 'rgba(128,128,128,0.5)'
            }
        }
    },
    series: [{
        name: 'OTWages',
        data: compList?.map((x,i)=>({
          name:x.COMPCODE,
          y:x.OTWAGES,
        }))
    }]
  }
  return (
    <Card
      sx={{
        //   m:1,
        borderRadius: 3,
        boxShadow: 4,
        mx: 1,
      }}
    >
      <CardHeader title="OT Wages Contribution" titleTypographyProps={{
            sx: { fontSize: "1rem", fontWeight: 600 },
          }}
         
          sx={{
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}/>
      <CardContent>
        <div>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        
      </CardContent>
    </Card>
  );
};

export default HomeOTWages;
