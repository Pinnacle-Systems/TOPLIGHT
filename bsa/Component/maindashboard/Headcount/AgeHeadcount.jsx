import { useEffect, useState } from "react";
import { useGetMisDashboardOrdersInHandQuery } from "../../../redux/service/misDashboardService";
import { Box, Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import HeadDetailedCom from "../../../components/Headcount/HeadDetail";

const AgeHead = ({ companyName, selectedState, HeadData }) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  let excelTitle = "Age wise HeadCount Report"
  const [filterBuyer, setFilterBuyer] = useState(companyName);

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);
  const { data: Agedata } = useGetMisDashboardOrdersInHandQuery({
    params: { filterBuyer: filterBuyer },
  });

  const filteredData = Array.isArray(Agedata?.data)
    ? Agedata?.data.filter((row) => {
      if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
      if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
      return true;
    })
    : [];

  const totalsByComp = filteredData.reduce((acc, emp) => {
    const code = emp.SLAP || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.VAL || 0);
    return acc;
  }, {});

  const Chartdata = Object.entries(totalsByComp).map(([x, y]) => ({
    Agerange: x,
    Headcount: y,
  }));

  console.log(Chartdata, "Agedata");

  const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 270,
      marginBottom: 0,
      marginTop: 0
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
      pointFormat:
        "<b>{point.name}</b> : {point.y} Employees <br/>({point.percentage:.1f}%)",
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
          distance: -35,
          format: "{point.name} </br>{point.percentage:.1f}%",
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
                AGE: this.name,
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
          name: item.Agerange,
          y: item.Headcount,
        })),
      },
    ],
    drilldown: {
      series: [],
    },
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
          title="Age wise HeadCount"
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
          <HeadDetailedCom
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            HeadData={HeadData} excelTitle={excelTitle}
          />
        )}


      </Card>
    </>
  );
};
export default AgeHead;
