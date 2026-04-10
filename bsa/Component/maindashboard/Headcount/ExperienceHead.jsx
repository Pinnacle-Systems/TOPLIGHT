import { useEffect, useState } from "react";
import { useGetMisDashboardOrdersInHandQuery } from "../../../redux/service/misDashboardService";
import { Box, Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { useGetOverAllSupplierContributionQuery } from "../../../redux/service/poData";
import HeadDetailedCom from "../../../components/Headcount/HeadDetail";
import ExpHeadDetail from "../../../components/Headcount/Expdetail";

const ExperienceHead = ({ companyName, selectedState, HeadData }) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
let excelTitle ="Experience Wise HeadCount Report"
  const [filterBuyer, setFilterBuyer] = useState(companyName);

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);
  const { data: Expdata } = useGetOverAllSupplierContributionQuery({
    filterBuyer: filterBuyer,
  });

  //   const filteredData = Array.isArray(Expdata?.data)
  //     ? Expdata?.data.filter((row) => {
  //         if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
  //         if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
  //         return true;
  //       })
  //     : [];

  //   const totalsByComp = filteredData.reduce((acc, emp) => {
  //     const code = emp.SLAP || "Unknown";
  //     acc[code] = (acc[code] || 0) + (emp.VAL || 0);
  //     return acc;
  //   }, {});

  //   const Chartdata = Object.entries(totalsByComp).map(([x, y]) => ({
  //     Agerange: x,
  //     Headcount: y,
  //   }));

  const xdata = Expdata?.data.map((x) => x.supplier);
  const ydata = Expdata?.data.map((x) => x.poQty);

  console.log(Expdata, "Expdata");
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
      height: 305,
      options3d: {
        enabled: true,
        alpha: 7,
        beta: 7,
        depth: 50,
        viewDistance: 25,
      },
      marginBottom: 50,
      backgroundColor: "#FFFFFF",
      borderRadius: "10px",
    },
    title: null,
    legend: { enabled: false },
    tooltip: {
      headerFormat:
        '<b><span style="color: #2d2d2d;">Experience: {point.key}</span></b><br/>',
      pointFormat: `
                <span style="color: {point.color}; font-size: 12px;">\u25CF</span> 
                Employees: <span style="color: #2d2d2d;"><b>{point.y}</b></span>`,
      style: { fontSize: "10px", color: "black" },
    },
    xAxis: {
      categories: xdata,
      labels: { style: { fontSize: "10px", color: "#6B7280" } },
      title: {
        text: "Experience",
        style: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
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
      series: {
        point: {
          events: {
            click: function () {
              console.log("Clicked:", this.category, this.y);
              setSearch((prev) => ({
                ...prev,
                EXP: this.category,
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
        data: ydata,
        dataLabels: {
          enabled: true,
          style: { fontSize: "10px", color: "#333" },
        },
      },
    ],
  };

  return (
    <>
      <Card
        sx={{
          backgroundColor: "#f5f5f5",
          height: 330,
          marginTop: 1
        }}
      >
        <CardHeader
          title="Experience wise HeadCount"
          titleTypographyProps={{
            sx: { fontSize: ".9rem", fontWeight: 600 },
          }}
          sx={{
            p: 1,
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />
        <Box>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </Box>

        {showTable && (
          <ExpHeadDetail
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search} excelTitle={excelTitle}
            HeadData={HeadData}
          />
        )}
      </Card>
    </>
  );
};
export default ExperienceHead;
