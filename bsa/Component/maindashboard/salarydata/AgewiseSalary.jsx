import React, { useEffect, useState } from "react";
import { Box, Card, CardHeader, Chip, Stack, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import {
  useGetAgewiseEsiQuery,
  useGetMisDashboardSalaryDetQuery,
  useGetSalaryAgewiseQuery,
} from "../../../redux/service/misDashboardService";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import SunburstModule from "highcharts/modules/sunburst";
import { Center } from "@chakra-ui/react";
import SalaryDetail from "../../../components/SalaryDet";
import AgewiseSalDetail from "../../../components/AgewiseDetail";
// import AgewiseSalDetail from "../../../components/AgewiseDetail";

SunburstModule(Highcharts);

const AgeSalary = ({
  companyName,
  selectedState,
  salaryDet,
  selectmonths,
  selectedYear1,
  setSelectedState,
  setSelectmonths
}) => {
  const chartColors = ["#FFA726", "#42A5F5", "#66BB6A", "#AB47BC", "#FF7043"]; // same as chart colors
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
  const [selectedYear, setSelectedYear] = useState(selectedYear1);


  useEffect(() => {
    setSelectedYear(selectedYear1);
  }, [selectedYear1]);

  const { data: Agesalary, isLoading } = useGetAgewiseEsiQuery({
    params: {
      filterBuyer: filterBuyer,
      filterYear: selectedYear,
    },
  });

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  if (isLoading) return <div>Loading...</div>;

  // if (salaryDet1?.data?.length === 0)
  //   return (
  //     <Card sx={{ p: 2, textAlign: "center", m: 20 }}>No data available</Card>
  //   );

  const filteredData = Array.isArray(Agesalary?.data)
    ? Agesalary?.data
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
  // console.log(filteredData, "salaryDet123");

  const totalsByComp = filteredData?.reduce((acc, emp) => {
    const code = emp.SLAP || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.TOTAL_NETPAY || 0);
    return acc;
  }, {});
  const Chartdata = Object.entries(totalsByComp || {}).map(([x, y]) => ({
    Department: x,
    Netpay: y,
  }));

  const options = {
    chart: {
      type: "pie",
      backgroundColor: "#f5f5f5",
      options3d: {
        enabled: true,
        alpha: 40,
      },

      height: 250,
      borderRadius: 10,
      margin: [0, 0, 0, 0],
    },
    colors: chartColors,
    title: {
      text: "",
      align: "left",
      style: {
        color: "#000000",
        fontWeight: "normal",
      },
    },
    subtitle: {
      text: "",
      align: "left",
      style: {
        color: "#000000",
        fontWeight: "normal",
      },
    },
    plotOptions: {
      pie: {
        innerSize: 100,
        depth: 50,
         
        center: ["50%", "50%"],
        size: "100%",

        dataLabels: {
          enabled: true,
          distance: -1,
          crop: false,
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
              const dept = this.name;
              setSearch((prev) => ({
                ...prev,
                AGE: dept,
              }));
              setShowTable(true);
            },
          },
        },
      },
    },
    tooltip: {
      style: {
        color: "#374151",
        fontSize: "10px",
      },
      headerFormat: "<b> {point.key}</b><br/>",
      pointFormatter: function () {
        return `
                    <span style="color:${this.color}">\u25CF</span>
                    <span style="color: #2d2d2d;"> Total Netpay: <b>${this.y.toLocaleString(
                      "en-IN"
                    )}</b></span><br/>
                 
                `;
      },
    },
    series: [
      {
        name: "",
        data: Chartdata?.map((item, index) => ({
          name: item.Department,
          y: item.Netpay,
        })),
      },
    ],
    credits: {
      enabled: false,
    },
  };

  // Build sunburst hierarchy
  // const buildSunburst = (data) => {
  //   const result = [];

  //   const baseColors = [
  //     "#1f77b4", // blue
  //     "#ff7f0e", // orange
  //     "#2ca02c", // green
  //     "#d62728", // red
  //     "#9467bd", // purple
  //     "#8c564b", // brown
  //     "#e377c2", // pink
  //     "#7f7f7f", // gray
  //     "#bcbd22", // olive
  //     "#17becf", // cyan
  //   ];

  //   // Company level total netpay
  //   const totalCompanySalary = data.reduce(
  //     (sum, e) => sum + (e.NETPAY || 0),
  //     0
  //   );

  //   result.push({
  //     id: "root",
  //     parent: "",
  //     name: `${companyName}`,
  //     value: totalCompanySalary,
  //     total: totalCompanySalary,
  //   });

  //   const grouped = {};

  //   data.forEach((emp) => {
  //     const d = emp.DEPARTMENT || "UNKNOWN";
  //     const g = emp.GENDER || "UNKNOWN";

  //     if (!grouped[d]) grouped[d] = {};
  //     if (!grouped[d][g]) grouped[d][g] = [];

  //     grouped[d][g].push(emp);
  //   });

  //   let colorIndex = 0;
  //   Object.keys(grouped).forEach((dept) => {
  //     const deptSalary = Object.values(grouped[dept])
  //       .flat()
  //       .reduce((sum, e) => sum + (e.NETPAY || 0), 0);

  //     const deptColor = baseColors[colorIndex % baseColors.length];
  //     colorIndex++;

  //     result.push({
  //       id: dept,
  //       parent: "root",
  //       name: dept,
  //       value: deptSalary,
  //       total: deptSalary,
  //       color: deptColor,
  //     });

  //     Object.keys(grouped[dept]).forEach((gender) => {
  //       const genderSalary = grouped[dept][gender].reduce(
  //         (sum, e) => sum + (e.NETPAY || 0),
  //         0
  //       );

  //       const genderId = `${dept}-${gender}`;

  //       result.push({
  //         id: genderId,
  //         parent: dept,
  //         name: gender,
  //         value: genderSalary,
  //         dept,
  //         gender,
  //         total: genderSalary,
  //       });
  //     });
  //   });

  //   return result;
  // };

  // const sunburstData = buildSunburst(filteredData);

  // const options = {
  //   chart: { height: 410 },

  //   title: {
  //     text: "Company → Department → Gender",
  //     style: {
  //       fontSize: "16px",
  //       fontWeight: "600",
  //       color: "#000",
  //     },
  //   },

  //   series: [
  //     {
  //       type: "sunburst",
  //       data: sunburstData,
  //       allowDrillToNode: true,
  //       cursor: "pointer",
  //       borderRadius: 3,

  //       levels: [
  //         {
  //           // Company level (root)
  //           level: 0,

  //           color: "#1976d2", // optional
  //           dataLabels: {
  //             enabled: false,
  //             style: { fontSize: "12px", fontWeight: "light" },
  //           },
  //         },
  //         {
  //           // Department level
  //           level: 1,
  //           levelSize: {
  //             unit: "percentage",
  //             value: 30, // outer ring size
  //           },
  //           colorByPoint: true,
  //           dataLabels: {
  //             style: { fontSize: "", fontWeight: "bold" },
  //           },
  //         },
  //         {
  //           // Gender level
  //           level: 2,
  //           levelSize: {
  //             unit: "percentage",
  //             value: 50, // outer ring size
  //           },
  //           colorVariation: {
  //             key: "brightness",
  //             // top:15
  //           },
  //           dataLabels: {
  //             style: { fontSize: "10px", fontWeight: "bold" },
  //           },
  //         },
  //         {
  //           // Gender level
  //           level: 3,

  //           colorVariation: {
  //             key: "brightness",
  //             // top:15
  //           },
  //           dataLabels: {
  //             style: { fontSize: "8px", fontWeight: "bold" },
  //           },
  //         },
  //       ],

  //       // dataLabels: {
  //       //   format: "{point.name}",
  //       // },

  //       point: {
  //         events: {
  //           click: function () {
  //             if (this.dept && this.gender) {
  //               console.log(this.dept, this.gender, "select filter");

  //               setSelectedGender(this.gender);

  //               setSearch((prev) => ({
  //                 ...prev,
  //                 DEPARTMENT: this.dept,
  //                 GENDER: this.gender,
  //               }));
  //               setShowTable(true);
  //             }
  //           },
  //         },
  //       },
  //     },
  //   ],

  //   tooltip: {
  //     useHTML: true,
  //     formatter: function () {
  //       return `
  //       <b>${this.point.name}</b><br/>
  //       Total NetPay: ₹${this.point.total?.toLocaleString()}
  //     `;
  //     },
  //   },
  // };

  return (
    <Card
      sx={{
        backgroundColor: "#f5f5f5",
        height: 337,
        mt: 2,

        // mx:1
      }}
    >
      <CardHeader
        title="Age wise "
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />
      <HighchartsReact highcharts={Highcharts} options={options} />
      <Stack direction="row" spacing={2} sx={{ p: 1, flexWrap: "wrap" }}>
        {Chartdata?.map((age, index) => (
          <Box
            key={age.Department}
            onClick={() => {
              setSearch((prev) => ({
                ...prev,
                AGEMON: age.Department,
              }));
              setShowTable(true);
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "11px",
              "&:hover .dot": { transform: "scale(1.3)" },
            }}
          >
            <span
              className="dot"
              style={{
                height: 12,
                width: 12,
                backgroundColor: chartColors[index], 
                borderRadius: "50%",
                display: "inline-block",
                marginRight: 6,
              }}
            ></span>
            {age.Department}
          </Box>
        ))}
      </Stack>

      {showTable && (
        <AgewiseSalDetail
          selectedBuyer={[filterBuyer]}
          closeTable={() => setShowTable(false)}
          setSearch={setSearch}
          search={search}
          salaryDet1={salaryDet}
          selectedState={selectedState}
          selectmonths={selectmonths}
          setSelectedState={setSelectedState}
          setSelectmonths={setSelectmonths}
          selectedYear={selectedYear}
          autoFocusBuyer={true}
          // selectGender1={selectGender}
        />
      )}
    </Card>
  );
};

export default AgeSalary;
