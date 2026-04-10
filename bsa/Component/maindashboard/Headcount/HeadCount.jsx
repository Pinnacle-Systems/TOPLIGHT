import { useTheme } from "@emotion/react";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch } from "react-redux";
import { Box, Card, CardHeader, Grid, Typography } from "@mui/material";
import { push } from "../../../redux/features/opentabs";
import { useGetYearlyCompERPQuery } from "../../../redux/service/misDashboardServiceERP";
import { params } from "node-oracledb/src/execObj.lib";
import { useGetYearlyCompQuery } from "../../../redux/service/misDashboardService";

const HeadCount = () => {
  const dispatch = useDispatch();
  const [detailedpage, setDetailedpage] = useState(false);
  const theme = useTheme();
  const [chartData, setChartData] = useState({ male: [], female: [] });
 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const { data: result } = useGetYearlyCompQuery({ params: {} });
  // console.log(result, "result");
;

  const categories = result?.data.map((item) => item.customer);
  
  const totalvalue = result?.data.map((item) => item.total);
  const headcount = totalvalue?.reduce((sum, val) => sum + val, 0);

  const options = {
    chart: {
      type: "bar",
      animations: { enabled: true, easing: "easeinout", speed: 800 },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const company = categories[config.dataPointIndex];
          // console.log(company,"compamnu");
          
          dispatch(
            push({
              id: `Headcount`,
              name: `Headcount`,
              component: "DetailedHeadcount",
              data: { companyName: company },
            })
          );
        },
      },
    },

    tooltip: {
  y: {
    formatter: function (value) {
      return value.toLocaleString();   // format number with commas
    }
  },
  x: {
    formatter: function (value) {
      return value; // category (company name)
    }
  }
},

    grid: {
      padding: {
        bottom: -35,
        top: 0,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        distributed: true,
        barHeight: "100%",
        columnWidth: "55%",
      },
    },
    colors: [
      "#F44F5E",
      "#E55A89",
      "#D863B1",
      "#CA6CD8",
      "#B57BED",
      "#8D95EB",
      "#62ACEA",
      "#4BC3E6",
    ],
    dataLabels: {
      enabled: false,
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex];
      },
    },
    xaxis: {
      categories: categories,
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "",
      data: totalvalue,
    },
  ];

  return (
    <>
      <Card
        sx={{
          
          borderRadius: 3,
          boxShadow: 4,
                 }}
      >
        <CardHeader
          title="Employee Strength as on date"
          titleTypographyProps={{
            sx: { fontSize: "1rem", fontWeight: 600 },
          }}
          // action={
          //   <IconButton
          //     size="small"
          //     aria-label="settings"
          //     sx={{ color: "text.secondary" }}
          //   >
          //     <DotsVertical />
          //   </IconButton>
          // }
          sx={{
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />
        <Box sx={{ "& .apexcharts-bar-area:hover": { cursor: "pointer" } }}>
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={250}
          />
        </Box>

        <Box
          sx={{
            m: 1,
            p: 1,
            // mb: 2,
            bgcolor: "background.default",
            borderRadius: 3,
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            OverAll Head Count : {headcount?.toLocaleString('en-IN')}
          </Typography>
        </Box>
      </Card>
    </>
  );
};

export default HeadCount;
