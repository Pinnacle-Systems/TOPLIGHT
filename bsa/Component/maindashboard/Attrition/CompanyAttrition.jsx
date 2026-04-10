import React, { useEffect, useState, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useContext } from "react";
import { ColorContext } from "../../global/context/ColorContext";
import {
  useGetBuyerNameQuery,
  useGetMonthQuery,
} from "../../../redux/service/commonMasters";
import { useGetFinYearQuery } from "../../../redux/service/misDashboardService";
import { useGetYFActVsPlnQuery } from "../../../redux/service/orderManagement";
import AttritionDetTable from "../../../components/AttDetTable";
import { Card, CardHeader } from "@mui/material";
import AttriDetails from "../../../components/Attrition/Attritiondet";
import { addInsightsRow } from "../../../utils/hleper";

const CompAttrition = ({
  companyName,
  selectedYear1,
  selectmonths,
  setSelectmonths,
}) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [selectedBuyer, setSelectedBuyer] = useState(companyName);
  const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [selectedGender, setSelectedGender] = useState("Both");
  let excelTitle = "Attrition Month wise Report"
  const chartRef = useRef();
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    setSelectedBuyer(companyName);
  }, [companyName]);

  useEffect(() => {
    setSelectedYear(selectedYear1);
  }, [selectedYear1]);

  const { data: fabPlVsActFull } = useGetYFActVsPlnQuery({
    params: {
      filterSupplier: selectedBuyer || "",
      filterYear: selectedYear || "",
    },
  });

  const fabPlVsActFullDt = fabPlVsActFull?.data ? fabPlVsActFull?.data : [];

  const orderCount = fabPlVsActFullDt.length;
  //   const options = {
  //     chart: {
  //       type: "column",
  //       backgroundColor: "#f5f5f5",
  //       height: 400,
  //       borderRadius: "10px",
  //       options3d: {
  //         enabled: true,
  //         alpha:1,
  //         beta: 1,
  //         depth: 40,
  //         viewDistance: 25,
  //       },
  //     //   scrollablePlotArea: {
  //     //     minWidth:
  //     //       orderCount < 10
  //     //         ? 300
  //     //         : orderCount < 20
  //     //         ? 500
  //     //         : orderCount <= 40
  //     //         ? 1500
  //     //         : orderCount <= 65
  //     //         ? 2000
  //     //         : orderCount < 85
  //     //         ? 2500
  //     //         : orderCount < 120
  //     //         ? 3000
  //     //         : orderCount < 150
  //     //         ? 3500
  //     //         : 300,
  //     //     scrollPositionX: 0,
  //     //   },
  //     },
  //     title: null,
  //     tooltip: {
  //       backgroundColor: "white",
  //       borderRadius: 10,
  //       style: {
  //         fontSize: "10px",
  //         fontFamily: "Arial, sans-serif",
  //         padding: "10px",
  //       },
  //       borderColor: "#888",
  //       borderWidth: 1,
  //       headerFormat: "<b>Age: {point.key}</b><br/>",
  //     },
  //     xAxis: {
  //       title: {
  //         text: "Month",
  //         style: {
  //           fontSize: "12px",
  //           fontWeight: "bold",
  //           color: "#374151",
  //         },
  //         margin: 25,
  //       },
  //       categories: fabPlVsActFullDt.map((x) => x.payPeriod),
  //         // const month = new Date(order.payPeriod);
  //         // const monthAbbr = month.toLocaleString("default", { month: "short" });
  //         // const year = month.getFullYear().toString().slice(-2);
  //         // return `${monthAbbr} ${year}`;

  //       labels: {
  //         rotation: -90,
  //         step: 1,
  //         style: {
  //           fontSize: "10px",
  //         },
  //       },
  //       scrollbar: {
  //         enabled: true,
  //       },
  //     },
  //     yAxis: {
  //       title: {
  //         text: "Number of Employees",
  //         style: {
  //           fontSize: "12px",
  //           fontWeight: "bold",
  //           color: "#374151",
  //         },
  //         margin: 25,
  //       },
  //       labels: {
  //         style: {
  //           fontSize: "10px",
  //         },
  //         formatter: function () {
  //           return this.value.toLocaleString();
  //         },
  //       },
  //     },
  //     plotOptions: {
  //       column: {
  //         depth: 25,
  //         pointWidth: 20,
  //         stacking: "normal",
  //         states: {
  //           hover: {
  //             pointWidth: 20,
  //           },
  //         },
  //       },
  //     },
  //     legend: {
  //       itemStyle: {
  //         fontWeight: "bold",
  //       },
  //       symbolHeight: 12,
  //       symbolWidth: 12,
  //       symbolRadius: 1,
  //     },
  //     series: [
  //       {
  //         name: "Attrition",
  //         data: fabPlVsActFullDt.map((order, index) => ({
  //           y: order.attrition,
  //           color:
  //             Highcharts.getOptions().colors[
  //               index % Highcharts.getOptions().colors.length
  //             ],
  //         })),
  //         colorByPoint: true,
  //       },
  //     ],
  //   };
 
  const sortedData = [...fabPlVsActFullDt].sort(
    (a, b) => new Date(a.payPeriod) - new Date(b.payPeriod)
  );

  const options = {
    chart: {
      type: "column",
      backgroundColor: "#f5f5f5",
      height: 350,
      borderRadius: 10,
      marginBottom: 120,
      options3d: {
        enabled: true,
        alpha: 1,
        beta: 1,
        depth: 40,
        viewDistance: 25,
      },
    },

    title: null,

    tooltip: {
      backgroundColor: "white",
      borderRadius: 10,
      style: { fontSize: "10px", padding: "10px" },
      borderColor: "#888",
      borderWidth: 1,
      headerFormat: "<b>{point.key}</b><br/>",
    },

    xAxis: {
      title: {
        text: null,
        style: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
      },

      categories: sortedData.map((x) => x.payPeriod),

      labels: {
        rotation: -90,
        step: 1,
        style: { fontSize: "10px" },
      },

      scrollbar: { enabled: true },
    },

    yAxis: {
      title: {
        text: "Number of Employees",
        style: { fontSize: "12px", fontWeight: "normal", color: "#374151" },
        margin: 25,
      },
      labels: {
        style: { fontSize: "10px" },
        formatter: function () {
          return this.value.toLocaleString();
        },
      },
    },

    plotOptions: {
      column: {
        depth: 25,
        pointWidth: 20,
        stacking: "normal",
        states: { hover: { pointWidth: 20 } },
      },
      series: {
        point: {
          events: {
            click: function () {
              const company = this.category; 
              const value = this.y;
              setSelectedGender("Both")
              setSelectmonths(this.category)
              setShowTable(true); 
            },
          },
        },
      },
    },

    legend: {
      enabled: false,
      itemStyle: { fontWeight: "bold" },
      symbolHeight: 12,
      symbolWidth: 12,
      symbolRadius: 1,
    },

    series: [
      {
        name: "Attrition",
        data: sortedData.map((order, index) => ({
          y: order.attrition,
          color:
            Highcharts.getOptions().colors[
              index % Highcharts.getOptions().colors.length
            ],
        })),
        colorByPoint: true,
      },
    ],
  };

  return (
    <Card
      sx={{
        backgroundColor: "#f5f5f5",
        ml: 1,
        mt: 2,
      }}
      //   onFilterClick={() => {
      //     setShowModel(true);
      //   }}
      //   chartRef={chartRef}
    >
      <CardHeader
        title="Month wise"
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        // containerProps={{
        //   style: {
        //     minWidth: "70%",
        //     height: "390px",
        //     borderRadius: "10px",
        //   },
        // }}
      />

      {showTable && (
        <AttriDetails
          selectedBuyer={[selectedBuyer]}
          closeTable={() => setShowTable(false)}
          setSearch={setSearch}
          search={search}
          selectmonths={selectmonths}
          selectedYear={selectedYear1}
          setSelectmonths={setSelectmonths}
          autoFocusBuyer={true} excelTitle={excelTitle}
          selectedGender1={selectedGender}
        />
      )}
    </Card>
  );
};

export default CompAttrition;
