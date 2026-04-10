// import React, { useMemo } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Box,
//   Card,
//   CardHeader,
//   CardContent,
//   CircularProgress,
//   IconButton,
//   Button,
//   Typography,
//   ButtonGroupButtonContext,
// } from "@mui/material";
// import Highcharts from "highcharts";
// // import { useGetPfDetQuery } from "../../redux/service/misDashboardService";
// import {
//   useGetEsilastmonthQuery,
//   useGetMisDashboardEsiDetQuery,
//   useGetMisDashboardPfDetQuery,
// } from "../../../redux/service/misDashboardService";
// import DotsVertical from "mdi-material-ui/DotsVertical";
// import { useTheme } from "@emotion/react";
// import { useDispatch } from "react-redux";
// import { push } from "../../../redux/features/opentabs";
// import { theme } from "highcharts";
// import HighchartsReact from "highcharts-react-official";

// const HomeESI = () => {
//   const theme = useTheme();
//   const dispatch = useDispatch();

//   const { data: ESIdata, isLoading, isError } = useGetEsilastmonthQuery();

//   const { chartData1, chartvalue, chartcount, month, year } = useMemo(() => {
//     if (!ESIdata?.data) return {};

//     return {
//       chartData1: ESIdata.data.map((e) => e.customer),
//       chartvalue: ESIdata.data.map((e) => e.esi),
//       chartcount: ESIdata.data.map((e) => e.headCount),
//       month: ESIdata.data[0], // first object has month
//       year: ESIdata.data.map((e) => e.Year),
//     };
//   }, [ESIdata]);

//   const colors = useMemo(() => {
//     if (!chartData1) return [];
//     return chartData1.map(
//       () => "#" + Math.floor(Math.random() * 16777215).toString(16)
//     );
//   }, [chartData1]);

//   const formattedData1 = useMemo(() => {
//     if (!chartData1) return [];
//     return chartData1.map((name, i) => ({
//       name,
//       y: chartvalue[i],
//       color: colors[i],
//       headCount: chartcount[i],
//       Year: year[i],
//     }));
//   }, [chartData1, chartvalue, chartcount, colors, year]);

//   const formattedData = ESIdata?.data.map((item, i) => ({
//     name: item.customer,
//     y: item.esi,
//     color: colors[i],
//     headCount: item.headCount,
//     Year: year[i],
//   }));

//   console.log(formattedData, "formattedData");

// const totalvalue = ESIdata?.data.map((item) => item.pf);
//   const headcount = totalvalue?.reduce((sum, val) => sum + val, 0);

//   const options = useMemo(() => {
//     if (!formattedData) return {};

//     return {
//       chart: {
//         plotBackgroundColor: null,
//         plotBorderWidth: 0,
//         plotShadow: false,
//       },
//       title: {
//         text: `ESI<br>shares of<br>${month?.month}`,
//         align: "center",
//         verticalAlign: "middle",
//         y: -20,
//         style: { fontSize: "1.1em" },
//       },
//       tooltip: {
//         formatter: function () {
//           return `
//             <b>${this.point.name}</b><br/>
//             ESI Share: <b>${this.point.percentage.toFixed(1)}%</b><br/>
//             Amount: <b>${this.point.y}</b><br/>
//             Head Count: <b>${this.point.headCount}</b>
//           `;
//         },
//       },
//       plotOptions: {
//         pie: {
//           dataLabels: {
//             enabled: true,
//             distance: -50,
//             style: { fontWeight: "bold", color: "white" },
//           },
//           startAngle: -90,
//           endAngle: 90,
//           center: ["50%", "50%"],
//           size: "110%",
//           point: {
//             events: {
//               click: function () {
//                 dispatch(
//                   push({
//                     id: "EmployeeDetail",
//                     name: "EmployeeDetail",
//                     component: "DetailedDashBoard",
//                     data: { companyName: this.name, Year: this.Year },
//                   })
//                 );
//               },
//             },
//           },
//         },
//       },
//       series: [
//         {
//           type: "pie",
//           name: "ESI share",
//           innerSize: "50%",
//           data: formattedData,
//         },
//       ],
//     };
//   }, [formattedData, month, dispatch]);

//   if (isLoading) return <CircularProgress />;
//   if (isError) return <div>Error loading ESIdata</div>;
//   if (!chartData1?.length) return <div>No data found</div>;

//   return (
//     <Card>
//       <CardHeader title="ESI Contribution" />
//       <CardContent>
//         <div style={{ height: "280px" }}>
//           <HighchartsReact highcharts={Highcharts} options={options} />
//         </div>

//           <Box
//             sx={{
//               bgcolor: "background.default",
//               borderRadius: 3,
//               textAlign: "center",
//               border: `1px solid ${theme.palette.divider}`,
//               mt: 2,
//               p: 1,
//             }}
//           >
//             <Typography variant="h6" sx={{ fontWeight: 600 }}>
//               OverAll Contribution : {headcount}
//             </Typography>
//           </Box>

//       </CardContent>
//     </Card>
//   );
// };

// export default HomeESI;

import React from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useTheme } from "@emotion/react";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { useGetEsilastmonthQuery } from "../../../redux/service/misDashboardService";

const HomeESI = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { data: ESIdata, isLoading, isError } = useGetEsilastmonthQuery();

  // console.log(ESIdata,"ESIdata");
  

  if (isLoading) return <CircularProgress />;
  if (isError) return <div>Error loading data</div>;
  if (!ESIdata?.data?.length) return <div>No data found</div>;

  const chartData1 = ESIdata.data.map((e) => e.customer);

  // const month = ESIdata.data[0]?.month;
  const year = ESIdata.data.map((e) => e.Year);

  const colors = chartData1.map(
    () => "#" + Math.floor(Math.random() * 16777215).toString(16)
  );

  const formattedData = ESIdata.data.map((item, i) => ({
    name: item.customer,
    y: item.esi,
    color: colors[i],
    headCount: item.headCount,
    Year: year[i],
    month:item.month
    
  }));

  // console.log(formattedData,"formattedData");
  

  const totalESI = ESIdata.data
    .map((x) => Number(x.esi ?? 0))
    .reduce((a, b) => a + b, 0);

  const options = {
    chart: {
      height:250,
      plotBackgroundColor: null,
      plotBorderWidth: 0,
      plotShadow: true,
      spacing: [0, 0, 0, 0],     
    },
    title: {
      text: `ESI<br>shares of<br>Latest month`,
      align: "center",
      verticalAlign: "middle",
      y:70,
      style: { fontSize: ".9em" },
    },
    tooltip: {
      formatter: function () {
        return `
          <b>${this.point.name}</b><br/>
          ESI Share: <b>${this.point.percentage.toFixed(1)}%</b><br/>
          Amount: <b>${this.point.y.toLocaleString("en-IN")}</b><br/>
          Head Count: <b>${this.point.headCount}</b><br/>
          Month: <b>${this.point.month}</b>
        `;
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          distance: -50,
          style: { fontWeight: "bold", color: "white" },
        },
        startAngle: -90,
        endAngle: 90,
        center: ["50%", "90%"],
        size: "180%",
        innerSize: "60%",
        point: {
          events: {
            click: function () {
              // console.log(this.month,"thismontyh");
              
              dispatch(
                push({
                  id: "ESIDetail",
                  name: "ESIDetail",
                  component: "DetailedDashBoard",
                  data: { companyName: this.name, Year: this.Year ,autoFocusBuyer: true,selectedmonth:this.month},
                })
              );
            },
          },
        },
      },
    },
    series: [
      {
        type: "pie",
        name: "ESI share",
        innerSize: "50%",
        data: formattedData,
      },
    ],
  };

  return (
    <Card
      sx={{
        // m:1,
        borderRadius: 3,
        boxShadow: 4,
        width: "100%",
        maxWidth: 1000,
        //   mx: 1,
      }}
    >
      <CardHeader
        title="ESI Contribution"
        titleTypographyProps={{
          sx: { fontSize: "1rem", fontWeight: 600,  },
        }}
        sx={{
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          // pb: 1,
        }}
      />
      <CardContent>
        <Box>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </Box>
        <Box
          sx={{
            bgcolor: "background.default",
            borderRadius: 3,
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
            // mt: 2,
            p: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            OverAll Contribution : {totalESI.toLocaleString('en-IN')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HomeESI;
