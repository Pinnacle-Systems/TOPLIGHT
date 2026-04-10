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
import { useGetMisDashboardSalaryDetQuery, useGetsalarydelQuery, useGetsallastmonthQuery } from "../../../redux/service/misDashboardService";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";

const HomeSalary = () => {
  const theme = useTheme();
  // const {
  //   data: Salarydata,
  //   isLoading,
  //   isError,
  //   error,
  // } = useGetMisDashboardSalaryDetQuery({ params: {} });

  const [selectedmonth,setSelectedmonth]=useState("")
 

  const dispatch = useDispatch();

  const{data:lastmonth,isLoading,isError,error}=useGetsallastmonthQuery()


  // console.log(lastmonth,"lastmonth");
  

  const Year =lastmonth?.data.find((x)=>x.Year)

  useEffect(()=>{
    setSelectedmonth(Year?.month)
  },[Year])
 
 
  

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

  // const employees = Salarydata?.data || [];



  //  const totalsByComp = employees.reduce((acc, emp) => {
  //   const code = emp.COMPCODE || "Unknown";
  //   acc[code] = (acc[code] || 0) + (emp.NETPAY || 0);
  //   return acc;
  // }, {});

  // const compList = Object.entries(totalsByComp).map(
  //   ([code, total], index, arr) => {
  //     const prevTotal = index > 0 ? arr[index - 1][1] : total;
  //     const trendDir = total >= prevTotal ? "up" : "down";
  //     const color = trendDir === "up" ? "success.main" : "error.main";
  //     return { COMPCODE: code, NETPAY: total, trendDir, color };
  //   }
  // );

  const Totalvalue = lastmonth?.data.map((x) => x.netpay);
  const company = lastmonth?.data.map((x) => x.customer);

  const Sumtotal = Totalvalue?.reduce((sum, total) => sum + total);

  const options = {
    chart: {
      type: "area",
      height: 250,
      zoomType: null,
      enabled: true,
         },

    title: {
      text: null,
    },

    subtitle: {
      text: "",
      align: "left",
    },

    xAxis: {
     
      title: { text: "Company", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
      categories: company,
    },

    yAxis: {
      opposite: true,
      title: { text: "Amount", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
    },

    legend: {
      align: "left",
      verticalAlign: "bottom",
    },
    tooltip: {
  useHTML: true,
  shared: true,
  formatter: function () {
    const value = this.y.toLocaleString("en-IN");

    return `
      <b>${this.point.month || this.key}</b><br/>
      <span style="color:${this.series.color}">Netpay</span>: 
      <b>${value}</b>
    `;
  },
}
,
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          rotation: -45,
          formatter: function () {
            return this.y.toLocaleString('en-IN');
          },
        },
      },
      area: {
        marker: {
          enabled: true,
        },
        lineWidth: 1,
      },
    },

    series: [
      {
        name:  `Lastest Month Netpay`,
        data: lastmonth?.data.map((value, index) => ({
          name:value.customer,
          y: value.netpay,
          month:value.month,
        })),
        point: {
          events: {
            click: function () {
              const company = this.category;
              // console.log(this.month,"this");
              
              dispatch(
                push({
                  id: `SalaryDetail`,
                  name: `SalaryDetail`,
                  component: "SalaryIndex",
                  data: { companyName: company,Year: Year.Year,selectedmonth:this.month,autoFocusBuyer: true}
                })
              );
            },
          },
        },
      },
    ],
  };

  return ( 
    <Card
      sx={{
          borderRadius: 3,
        boxShadow: 4,
        width: "100%",

        ml: 1,
      }}
    >
      <CardHeader
        title="Salary Distribution"
        titleTypographyProps={{
          sx: { fontSize: "1rem", fontWeight: 600 },
        }}
        sx={{
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />
      <CardContent sx={{ pb: 0 }}>
        <HighchartsReact highcharts={Highcharts} options={options} />

        <Box
          sx={{
            // m: 1,
            p: 1,
            // mb: 2,
            bgcolor: "background.default",
            borderRadius: 3,
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            OverAll Distribution : {Sumtotal?.toLocaleString('en-IN')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HomeSalary;
