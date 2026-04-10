import { Card, CardHeader } from "@mui/material";
import { useGetMisDashboardOTWagesDetQuery } from "../../../redux/service/misDashboardService";
import { useEffect, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import Variwide from "highcharts/modules/variwide";
import SalaryDetail from "../../../components/SalaryDet";
import OTWagesDetail from "../../../components/OTWagessalary";

Variwide(Highcharts);

const OTwagessalary = ({
  selectedYear1,
  companyName,
  selectedState,
  // salaryDet,
  selectmonths,
  setSelectedState,
  setSelectmonths,
}) => {
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

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  const {
    data: Salarydata,
    isLoading,
    isError,
    error,
  } = useGetMisDashboardOTWagesDetQuery({
    params: {
      filterBuyer: filterBuyer,
      filterYear: selectedYear,
    },
  });

  // if (Salarydata?.data?.length === 0)
  //   return (
  //     <Card sx={{ p: 2, textAlign: "center", m: 20 }}>No data available</Card>
  //   );

  const salaryDet = Salarydata?.data || [];
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

  // console.log(filteredData,"Salarydata147");
  const totalsByComp = filteredData.reduce((acc, emp) => {
    const code = emp.DEPARTMENT || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.OTWAGES || 0);

    return acc;
  }, {});

  const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  const totalNetPay = Object.values(totalsByComp).reduce((a, b) => a + b, 0);

  const Chartdata = Object.entries(totalsByComp).map(([x, y]) => ({
    Department: x,
    Netpay: y,
    percent: ((y / totalNetPay) * 100).toFixed(2),
    color: getRandomColor(),
  }));

  const Filterchartdata = Chartdata?.filter((item) => item.percent > 0);

  const categories = Chartdata?.map((item) => item.Department);
  const seriesData = Chartdata?.map((item) => item.Netpay);

  const options = {
    chart: {
      marginBottom: 125,
      backgroundColor: "#f5f5f5",
      scrollablePlotArea: { minWidth: 300 },
      // marginTop: 10,
      type: "line",
      height: 320,
      // borderRadius: 10,
    },

    xAxis: {
      categories: categories,
      title: { text: "Department", style: { fontSize: "10px" } },
      labels: { style: { fontSize: "10px" }, rotation: -35 },
    },

    yAxis: {
      min: 0,
      title: { text: "OTwages Netpay", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
    },

    tooltip: {
      shared: true,
      style: { fontSize: "10px" },
      formatter: function () {
        let tooltip = `<b>${this.x}</b><br/>`;
        const index = this.points[0].point.index;
        tooltip += `<b>OTNetpay:</b> ${seriesData[index]}`;
        return tooltip;
      },
    },

    plotOptions: {
      series: {
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
        },
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

        point: {
          events: {
            click: function () {
              const companyName = this.category;
              // console.log("Clicked:", companyName);
              setSearch((prev) => ({
                ...prev,
                DEPARTMENT: companyName,
              }));
              setShowTable(true);
            },
          },
        },
      },
    },

    title: null,

    series: [
      {
        name: "OTWages",
        data: seriesData,
        color: "#FF0000",
        marker: {
          fillColor: "#FF0000",
          lineWidth: 2,
          lineColor: "#000000",
        },
      },
    ],
  };

  const option = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 350,
      marginBottom: 0,
      marginTop: 0,
    },
    title: {
      text: null,
      style: { fontSize: "16px", fontWeight: "600" },
    },
    // subtitle: {
    //   text: "Click on a slice for details",
    //   style: { fontSize: "13px", color: "#888" },
    // },
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

    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        borderRadius: 1,
        dataLabels: {
          enabled: true,
          distance: 2,
          // format: "{point.name} </br>{point.percentage:.1f}%",
          style: {
            fontSize: "10px",
            textOutline: "none",
          },
        },
        point: {
          events: {
            click: function () {
              console.log("Clicked:", this.name, "Value:", this.y);
              setSearch((prev) => ({
                ...prev,
                DEPARTMENT: this.name,
              }));

              setShowTable(true);
            },
          },
        },
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
    series: [
      {
        name: "Departments",
        colorByPoint: true,
        data: Chartdata?.map((item, i) => ({
          name: item.Department,
          y: item.Netpay,
        })),
      },
    ],
    drilldown: {
      series: [],
    },
  };
  // console.log(options,"options");
  return (
    <>
      <Card
        sx={{
          backgroundColor: "#f5f5f5",
          // borderRadius: 3,
          // boxShadow: 4,
          // mt: 2,
        }}
      >
        <CardHeader
          title="Overtime Wages "
          titleTypographyProps={{
            sx: { fontSize: ".9rem", fontWeight: 600 },
          }}
          sx={{
            p: 1,
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />

        <HighchartsReact highcharts={Highcharts} options={option} />

        {showTable && (
          <OTWagesDetail
            salaryDet={salaryDet}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            selectedYear={selectedYear}
            setSelectedState={setSelectedState}
            selectedState={selectedState}
            setSelectmonths={setSelectmonths}
            selectmonths={selectmonths}
            autoFocusBuyer={true}
            // selectGender1={selectGender}
          />
        )}
      </Card>
    </>
  );
};

export default OTwagessalary;
