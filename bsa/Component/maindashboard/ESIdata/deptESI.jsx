import { Box, Card, CardHeader } from "@mui/material";
import { useEffect, useState } from "react";
import EsiDetail from "../../../components/EsiDet";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import ESIDetailedCom from "../../../components/ESIdetailCom";

const DeptESI = ({
  companyName,
  selectedYear1,
  ESIdata,
  selectedState,
  setSelectedState,
  setSelectmonths,
  selectmonths,
}) => {
  console.log(selectedState, "selectedState");
  let excelTitle = "ESI Contribution Designation wise Report"
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);

  const [filterBuyer, setFilterBuyer] = useState(companyName);

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  // FIX: sync year from parent
  // useEffect(() => {
  //   setSelectedYear(selectedYear1);
  // }, [selectedYear1]);
  const filteredData = Array.isArray(ESIdata)
    ? ESIdata.filter((row) => {
        if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
        if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
        return true;
      }).filter((row) => {
        if (!selectmonths) return true;
        return row.PAYPERIOD === selectmonths;
      })
    : [];

  const totalsByComp = filteredData.reduce((acc, emp) => {
    const code = emp.DESIGNATION || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.ESI || 0);
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
    legend: {
      enabled: false,
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

  return (
    <>
      <Card
        sx={{
          backgroundColor: "#f5f5f5",
          ml:1,
        }}
      >
        <CardHeader
          title="Designation wise"
          titleTypographyProps={{
            sx: { fontSize: ".9rem", fontWeight: 600 },
          }}
          sx={{
            p: 1,
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />
        <Box>
          <HighchartsReact highcharts={Highcharts} options={opt} />
        </Box>
        {showTable && (
          <ESIDetailedCom
            selectedYear={selectedYear1}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            ESIdata={ESIdata}
            selectedState={selectedState}
            selectmonths={selectmonths}
            setSelectmonths={setSelectmonths}
            setSelectedState={setSelectedState}
            autoFocusBuyer={true}
            excelTitle={excelTitle}
          />
        )}
      </Card>
    </>
  );
};
export default DeptESI;
