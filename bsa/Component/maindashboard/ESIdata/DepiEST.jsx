import { Box, Card, CardHeader, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import EsiDetail from "../../../components/EsiDet";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import ESIDetailedCom from "../../../components/ESIdetailCom";

const DeptmentESI = ({
  companyName,
  selectedYear1,
  ESIdata,
  selectedState,
  selectmonths,
  setSelectedState,
  setSelectmonths,
}) => {
  console.log(selectedState, "selectedState");
let excelTitle = "ESI Contribution Department wise Report"
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);

  // const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [filterBuyer, setFilterBuyer] = useState(companyName);

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  // useEffect(() => {
  //   setSelectedYear(selectedYear1);
  // }, [selectedYear1]);
  const filteredData = Array.isArray(ESIdata)
    ? ESIdata.filter((row) => {
        if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
        if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
        return true;
      })
      .filter((row) => {
        if (!selectmonths) return true;
        return row.PAYPERIOD === selectmonths;
      })
    : [];

  const groupdata = filteredData?.reduce((acc, emp) => {
    const code = emp.DEPARTMENT || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.ESI || 0);

    return acc;
  }, {});

  const Chartdata = Object.entries(groupdata).map(([x, y]) => ({
    dept: x,
    esi: y,
    // percent: ((y / totalNetPay) * 100).toFixed(2),
    // color:getRandomColor()
  }));

  console.log(Chartdata, "groupdata");

  const options = {
    chart: {
      type: "column",
      marginBottom: 120,
      backgroundColor: "#f5f5f5",
      height: 300,
    },
    title: {
      text: null,
    },

    xAxis: {
      type: "category",
      labels: {
        autoRotation: [-45, -90],
        style: {
          fontSize: "8px",
          fontFamily: "Verdana, sans-serif",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "ESI",
      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      // pointFormat: "ESI:<b>{point.y} </b>",
      formatter: function () {
    return `<small>${this.point.name}</small></br><smal>ESI:${this.y.toLocaleString("en-IN")}</smal>`; 
  }
    },
    plotOptions: {
      series: {
        
        cursor: "pointer",
        point: {
          events: {
            click() {
              console.log("Clicked Dept:", this.name);
              const desg = this.name;
              setSearch((prev) => ({
                ...prev,
                DEPARTMENT: desg,
              }));
              setShowTable(true);

              // your click co
            },
          },
        },
      },
    },

    series: [
      {
        name: "Population",
        colors: [
          "#9b20d9",
          "#9215ac",
          "#861ec9",
          "#7a17e6",
          "#7010f9",
          "#691af3",
          "#6225ed",
          "#5b30e7",
          "#533be1",
          "#4c46db",
          "#4551d5",
          "#3e5ccf",
          "#3667c9",
          "#2f72c3",
          "#277dbd",
          "#1f88b7",
          "#1693b1",
          "#0a9eaa",
          "#03c69b",
          "#00f194",
        ],
        colorByPoint: true,
        groupPadding: 0,
        data: Chartdata?.map((x, y) => ({
          name: x.dept,
          y: x.esi,
        })),
        dataLabels: {
  enabled: true,
  rotation: -90,
  color: "#FFFFFF",

  inside: true,
 
  verticalAlign: "top",
  y: -20,
  style: {
    fontSize: "9px",
    
  },
  formatter: function () {
    return this.y.toLocaleString('en-IN');
  },
},

      },
    ],
  };
  return (
    <>
      <Card
        sx={{
          backgroundColor: "#f5f5f5",
          // borderRadius: 3,
          // boxShadow: 4,

          
        }}
      >
        <CardHeader
          title="Department wise"
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
          <ESIDetailedCom
            selectedYear={selectedYear1}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}
            selectmonths={selectmonths}
            ESIdata={ESIdata}
            autoFocusBuyer={true}
            excelTitle={excelTitle}
          />
        )}
      </Card>
    </>
  );
};
export default DeptmentESI;
