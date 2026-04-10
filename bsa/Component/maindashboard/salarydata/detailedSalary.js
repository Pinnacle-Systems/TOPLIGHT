import React, { useEffect, useState } from "react";
import { Card, CardHeader, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { useGetMisDashboardSalaryDetQuery } from "../../../redux/service/misDashboardService";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import SunburstModule from "highcharts/modules/sunburst";
import { Center } from "@chakra-ui/react";
import SalaryDetail from "../../../components/SalaryDet";
import SortedBarChart from "../../MisDashboard/BloodGroupDistribution/SortedBarChart";
import SortedBarChart1 from "./designchart";

SunburstModule(Highcharts);

const SunburstChart = ({
  companyName,
  selectedState,
  salaryDet,
  selectmonths,
  setSelectedState,
  setSelectmonths,
  selectedYear1,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  const [filterBuyer, setFilterBuyer] = useState(companyName);
  let excelTitle = "Salary Distribution Department wise Report"
  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  // if (salaryDet?.length === 0)
  //   return (
  //     <Card sx={{ p: 2, textAlign: "center", m: 20 }}>No data available</Card>
  //   );

  const filteredData = Array.isArray(salaryDet)
    ? salaryDet
      .filter((row) => {
        if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
        if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
        return true;
      })
      .filter((row) => {
        if (!selectmonths) return true;
        return row.PAYPERIOD === selectmonths;
      })
    : [];

  const totalsByComp = filteredData.reduce((acc, emp) => {
    const code = emp.DEPARTMENT || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.NETPAY || 0);
    return acc;
  }, {});
  const Chartdata = Object.entries(totalsByComp).map(([x, y]) => ({
    Department: x,
    Netpay: y,
  }));

  const Xdata = Chartdata?.map((x) => x.Department);
  const Ydata = Chartdata?.map((x) => x.Netpay);

  const sortchartdata = Chartdata?.sort((a, b) => b.Netpay - a.Netpay);

  const colorArray = [
    "#8A37DE",
    "#005E72",
    "#E5181C",
    "#056028",
    "#1F2937",
    "#F44F5E",
    "#E55A89",
    "#D863B1",
    "#CA6CD8",
    "#B57BED",
    "#8D95EB",
    "#62ACEA",
    "#4BC3E6",
  ];

  const options = {
    chart: {
      type: "column",
      height: 350,
      options3d: {
        enabled: true,
        alpha: 7,
        beta: 7,
        depth: 50,
        viewDistance: 25,
      },
      marginBottom: 150,
      marginLeft: 30,
      backgroundColor: "#f5f5f5",
      borderRadius: "10px",
    },
    title: null,
    legend: { enabled: false },
    tooltip: {
      formatter: function () {
        return `<b>${this.key}</b><br/>Netpay: <b>${this.y.toLocaleString(
          "en-IN"
        )}</b>`;
      },
    },
    xAxis: {
      categories: Xdata,
      labels: { style: { fontSize: "10px", color: "#6B7280" }, rotation: 90 },
      title: {
        text: null,
        style: { fontSize: "12px", fontWeight: "bold", color: "#374151", },
        margin: 30,
      },
    },
    yAxis: {
      title: {
        text: "No of Employees",
        style: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
        margin: 25,
      },
      labels: { style: { fontSize: "10px", color: "#6B7280" } },
    },
    plotOptions: {
      column: { depth: 25, colorByPoint: true, borderRadius: 5 },
      dataLabels: {
        enabled: true,
        distance: -1,
        formatter: function () {
          return `${this.point.y.toLocaleString("en-IN")}`;
        },
        style: {
          color: "#000000",
          fontWeight: "normal",
        },

      },
      series: {
        dataLabels: {
          // rotation:90,
          enabled: true,
          distance: -2,
          formatter: function () {
            return `${this.point.y.toLocaleString("en-IN")}`;
          },
          style: {
            color: "#000000",
            fontWeight: "normal",
          },
        },
        point: {
          events: {
            click: function () {
              console.log("Clicked:", this.category, this.y);
              setSearch((prev) => ({
                ...prev,
                DEPARTMENT: this.category,
              }));

              setShowTable(true);
              // You can call any function here:
              // handleClick(this.category, this.y)
            },
          },
        },
      },
    },
    colors: colorArray,
    series: [
      {
        name: "",
        data: Ydata,
        dataLabels: {
          enabled: true,
          style: { fontSize: "10px", color: "#333" },
        },
      },
    ],
  };

  return (
    <Card
      sx={{
        backgroundColor: "#f5f5f5",
        // borderRadius: 3,
        // boxShadow: 4,

        ml: 1,
      }}
    >
      <CardHeader
        title="Department wise "
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />
      <HighchartsReact highcharts={Highcharts} options={options} />
      {/* <SortedBarChart1 topItems={sortchartdata} setSearch={setSearch} setShowTable={setShowTable} selectedState={selectedState} /> */}

      {showTable && (
        <SalaryDetail
          selectedBuyer={[filterBuyer]}
          closeTable={() => setShowTable(false)}
          setSearch={setSearch}
          search={search}
          salaryDet={salaryDet}
          selectedState={selectedState}
          selectmonths={selectmonths}
          setSelectedState={setSelectedState}
          setSelectmonths={setSelectmonths}
          selectedYear={selectedYear1}
          autoFocusBuyer={true}
          excelTitle={excelTitle}
        // selectGender1={selectGender}
        />
      )}
    </Card>
  );
};

export default SunburstChart;
