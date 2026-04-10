import React, { useEffect, useState } from "react";
import { Card, CardHeader, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import SunburstModule from "highcharts/modules/sunburst";

import SalaryDetail from "../../../components/SalaryDet";
import DesignationwiseDetails from "../../../components/DesignationwiseDetail";

// SunburstModule(Highcharts);

const DesignationSalary = ({ companyName, selectedState, salaryDet,selectmonths,selectedYear1,setSelectedState,setSelectmonths }) => {
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
  const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [filterBuyer, setFilterBuyer] = useState(companyName);
  let excelTitle = "Salary Distribution Designation wise Report"
  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);
  useEffect(() => {
      setSelectedYear(selectedYear1);
    }, [selectedYear1]);

  // if (salaryDet?.data?.length === 0)
  //   return (
  //     <Card sx={{ p: 2, textAlign: "center", m: 20 }}>No data available</Card>
  //   );

  const filteredData = Array.isArray(salaryDet)
    ? salaryDet.filter((row) => {
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
    const code = emp.DESIGNATION || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.NETPAY || 0);
    return acc;
  }, {});
  const Chartdata = Object.entries(totalsByComp).map(([x, y]) => ({
    Department: x,
    Netpay: y,
  }));

  const categories = Chartdata?.map((item) => item.Department);
  const seriesData = Chartdata?.map((item) => item.Netpay);

  const opt = {
    chart: {
      backgroundColor: "#f5f5f5",
      type: "area",
      height: 350,
      zoomType: "x",
      //  marginLeft: 100,    // Adjust Y-axis spacing
    marginBottom: 100, 
    },

    title: {
      text: null,
      align: "center",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },

    xAxis: {
      categories: categories,
      title: { text: "Designation" },
      labels: { style: { fontSize: "8px" } },
    },

    yAxis: {
      title: { text: "Netpay" },
      labels: {
        formatter: function () {
          return (this.value / 1000000).toFixed(0); // Round off millions
        },
      },
    },

    tooltip: {
      formatter: function () {
        return `<b>${this.key}</b><br/>Netpay: <b>${this.y.toLocaleString(
          "en-IN"
        )}</b>`;
      },
    },
    legend:{
enabled:false
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return this.y.toLocaleString("en-IN");
          },
          style: { fontSize: "10px", fontWeight: "bold" },
        },
        marker: { enabled: false },
      },
    },

    series: [
      {
        name: "Netpay",
        data: Chartdata.map((x) => Number(x.Netpay)),
         point: {
                  events: {
                    click: function () {
                      const company = this.category;
                      // dispatch(
                      //   push({
                      //     id: `SalaryDetail`,
                      //     name: `SalaryDetail`,
                      //     component: "SunburstChart",
                      //     data: { companyName: company },
                      //   })
                      // );

                      setSearch((prev) => ({
                ...prev,
                DESIGNATION: company,
              }));
              setShowTable(true);
                    },
                  },
                },


      },
    ],
  };

  // console.log(opt, "opt");

  return (
    <Card
      sx={{
         backgroundColor: "#f5f5f5",
         ml:1
      
      }}
    >
       <CardHeader
              title="Designation wise "
              titleTypographyProps={{
                sx: { fontSize: ".9rem", fontWeight: 600 },
              }}
              sx={{
                p: 1,
                borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
              }}
            />
      <HighchartsReact highcharts={Highcharts} options={opt} />

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

export default DesignationSalary;
