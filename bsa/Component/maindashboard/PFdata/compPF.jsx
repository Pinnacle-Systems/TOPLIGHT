import { useState } from "react";
import { useGetEsiPf1Query } from "../../../redux/service/misDashboardService";
import { useEffect } from "react";
import { Box, Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Chart from "react-apexcharts";
import EsiDetail from "../../../components/EsiDet";

import Highcharts from "highcharts";
import ESIDetailed from "../../../components/MonthESIde";
import { math } from "@amcharts/amcharts4/core";
import PFShareDetailed from "../../../components/PF detail/EmployerpfDEt";

const CompPF = ({
  companyName,
  selectedYear1,
  PFdata,
  selectedState,
  setSelectmonths,
  selectmonths,
  setSelectedState,
}) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
let excelTitle = "PF Employer vs Employee Contribution Report"

  const [filterBuyer, setFilterBuyer] = useState(companyName);

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  const filteredData = Array.isArray(PFdata)
    ? PFdata.filter((row) => {
        if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
        if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
        return true;
      })
      .filter((row) => {
        if (!selectmonths) return true;
        return row.PAYPERIOD === selectmonths;
      })
    : [];

  //   const groupdata = filteredData?.reduce((acc, emp) => {
  //     const code = emp.PAYPERIOD || "Unknown";
  //     acc[code] = (acc[code] || 0) + (emp.EMPLOYER_CON || 0);

  //     return acc;
  //   }, {});

  const groupdata = filteredData?.reduce((acc, emp) => {
    const code = emp.PAYPERIOD || "Unknown";

    if (!acc[code]) {
      acc[code] = { employer: 0, pf: 0, total: 0 };
    }

    acc[code].employer += math.round(emp.EMPLOYER_CON) || 0;
    acc[code].pf += emp.PF || 0;
    acc[code].total = acc[code].employer + acc[code].pf;

    return acc;
  }, {});

  const chartdata = Object.entries(groupdata).map(([x, y]) => ({
    month: x,
    ...y,
  }));
  const chart1 = chartdata?.find((x) => x.month === selectmonths);

  const chartdata2 = [
    { name: "Employer", y: chart1?.employer },
    { name: "Employee", y: chart1?.pf },
  ];

  console.log(chart1, "groupdata1");
  //    const groupdata = filteredData?.reduce((acc, emp) => {
  //   const dept = Math.floor(emp.AGE) || "Unknown";
  //   const gender = (emp.GENDER || "Unknown").trim().toLowerCase();

  //   const normalizedGender =
  //     gender === "male" ? "Male" :
  //     gender === "female" ? "Female" :
  //     "Other";

  //   if (!acc[dept]) {
  //     acc[dept] = { Male: 0, Female: 0, Other: 0 };
  //   }

  //   acc[dept][normalizedGender] += emp.ESI || 0;

  //   return acc;
  // }, {});

  const chartdata1 = chartdata?.map((x) => x.contribution);
  const total_contri = chartdata1.reduce((sum, i) => sum + i, 0);
  console.log(total_contri, "groupdata1");

  const option = {
    chart: {
      backgroundColor: "#f5f5f5",
      type: "pie",
      height:175,
      custom: {},
      events: {
        render() {
          const chart = this;
          const series = chart.series[0];
          // const total = chart.options.chart.custom.total ?? 0;

          let customLabel = chart.customLabel;

          if (!customLabel) {
            customLabel = chart.customLabel = chart.renderer
              .label(
                `Total<br/><strong>${chart1?.total || ""}</strong>`,
                0,
                0,
                null,
                null,
                null,
                null,
                null,
                "center"
              )
              .css({
                color: "#000",
                textAnchor: "middle",
              })
              .add();
          } else {
            if (chart1) {
              customLabel.attr({
                text: `Total<br/><b>${chart1?.total.toLocaleString(
                  "en-IN"
                )}</b>`,
              });
            }else{
              customLabel.attr({
                text: `<b>No data</b>`,
              });

            }
          }

          const centerX = series.center[0] + chart.plotLeft;
          const centerY = series.center[1] + chart.plotTop;

          // ⭐ APPLY FINAL OFFSET HERE
          const offsetX = 0; // move right or left
          const offsetY = -20; // move up or down

          customLabel.attr({
            x: centerX + offsetX,
            y: centerY + offsetY,
          });

          customLabel.css({
            fontSize: `${series.center[2] / 12}px`,
          });
        },
      },
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    title: {
      text: null,
    },

    // tooltip: {
    //   pointFormat: "{series.name}: <b>{point.y}</b>",
    // },
    tooltip: {
      formatter() {
        return `${
          this.point.name
        } share </b><br/>PF value: ${this.point.y.toLocaleString("en-IN")}`;
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        borderRadius: 8,
        dataLabels: [
          {
            enabled: true,
            distance: 20,
            format: "{point.name}",
          },
          {
            enabled: true,
            distance: -15,
            format: "{point.percentage:.0f}%",
            style: {
              fontSize: ".7em",
            },
          },
        ],
        showInLegend: true,

        point: {
          events: {
            click: function () {
              console.log("Clicked Slice:", this.name);
              console.log("Value:", this.y);
              setShowTable(true);
            },
          },
        },
      },
    },
    series: [
      {
        name: "Employer contribution",
        colorByPoint: true,
        innerSize: "75%",
        data: chartdata2,
      },
    ],
  };

  //   const options = {
  //     chart: {
  //       backgroundColor: "#f5f5f5",
  //       marginTop: 10,
  //       marginBottom: 100,
  //       type: "line",
  //       height: 320,

  //       borderRadius: 10,
  //     },

  //     title: {
  //       text: null,
  //     },

  //     accessibility: {
  //       point: {
  //         valueDescriptionFormat: "{xDescription}{separator}{value} million(s)",
  //       },
  //     },

  //     xAxis: {
  //       title: {
  //         text: "Year",
  //         style: { fontSize: "10px" },
  //       },
  //       categories: Ydata,
  //       labels: {
  //         style: { fontSize: "10px" },
  //       },
  //     },

  //     yAxis: {

  //       title: {
  //         text: "Amount(ESI)",
  //         style: { fontSize: "10px" },
  //       },
  //       labels: {
  //         style: { fontSize: "10px" },
  //       },
  //     },

  //      tooltip: {
  //       shared: true,
  //       useHTML: true,
  //       style: { fontSize: "10px" },
  //       formatter: function () {
  //         let index = this.points[0].point.index;
  //         // let headCountValue = headCount[index];
  //         let pf = Xdata[index];
  //         let monthName = this.x;

  //         return `<b>Month:</b> ${monthName} <br/>
  //                         <b>ESI Value:</b> ${pf.toLocaleString("en-IN")} <br/>
  //                        `;
  //       },
  //     },
  //     legend: {
  //       enabled: false,
  //     },
  //     plotOptions: {
  //       series: {
  //         marker: {
  //           enabled: true,
  //           radius: 3,
  //           symbol: "circle",
  //         },
  //         dataLabels: {
  //           style: { fontSize: "10px" },
  //         },
  //         point: {
  //           events: {
  //             click: function () {
  //               const Month = this.category;

  //               // setSearch((prev) => ({
  //               //   ...prev,
  //               //   PAYPERIOD: Month,
  //               // }));
  //               setSelectmonths(Month);

  //               setShowTable(true);
  //             },
  //           },
  //         },
  //       },
  //     },
  //     series: [
  //       {
  //         name: "Internet Users",
  //         data: Xdata,
  //         color: "var(--highcharts-color-1, #2caffe)",
  //       },
  //     ],
  //   };
  //   const option = {
  //   chart: {
  //     backgroundColor: "#f5f5f5",
  //     type: "pie",
  //     height: 238,
  //     custom: {
  //       total: total_contri, // Pass total here
  //     },
  //     events: {
  //       render() {
  //         const chart = this;
  //         const series = chart.series[0];

  //         // Get total value
  //         const total = chart.options.chart.custom.total ?? 0;

  //         let customLabel = chart.customLabel;

  //         if (!customLabel) {
  //           customLabel = chart.customLabel = chart.renderer
  //             .label(
  //               `<br/><strong>${total}</strong>`,
  //               0,
  //               0,
  //               null,
  //               null,
  //               null,
  //               null,
  //               null,
  //               "center"
  //             )
  //             .css({
  //               color: "#000",
  //               textAnchor: "middle",
  //             })
  //             .add();
  //         } else {
  //           customLabel.attr({
  //             text: `Total<br/><strong>${total}</strong>`,
  //           });
  //         }

  //         const x = series.center[0] + chart.plotLeft;
  //         const y = series.center[1] + chart.plotTop;

  //         customLabel.attr({
  //           x,
  //           y,
  //         });

  //         // Dynamic font size adjust
  //         customLabel.css({
  //           fontSize: `${series.center[2] / 12}px`,
  //         });
  //       },
  //     },
  //   },

  //   series: [
  //     {
  //       name: "Registrations",
  //       colorByPoint: true,
  //       innerSize: "75%",
  //       data: chartdata?.map((x) => ({
  //         name: x.gender,
  //         y: x.contribution,
  //       })),
  //     },
  //   ],
  // };

  return (
    <>
      <Card
        sx={{
          mt: 2,
          backgroundColor: "#f5f5f5",
          // borderRadius: 3,
          // boxShadow: 4,
          //  mt:2,
        }}
      >
        <CardHeader
          title="Employer vs Employee"
          titleTypographyProps={{
            sx: { fontSize: ".9rem", fontWeight: 600 },
          }}
          sx={{
            p: 1,
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />
        <Box>
          <HighchartsReact highcharts={Highcharts} options={option} />
        </Box>
        {showTable && (
          <PFShareDetailed
            selectedYear={selectedYear1}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            setSelectmonths={setSelectmonths}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            selectedState={selectedState}
            autoFocusBuyer={true}
             PFdata={PFdata} excelTitle={excelTitle}
          />
        )}
      </Card>
    </>
  );
};

export default CompPF;
