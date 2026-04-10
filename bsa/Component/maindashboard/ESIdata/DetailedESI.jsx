import { useState } from "react";
import { useGetEsiPf1Query } from "../../../redux/service/misDashboardService";
import { useEffect } from "react";
import { Box, Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import EsiDetail from "../../../components/EsiDet";
import ESIDetailed from "../../../components/MonthESIde";
import SalaryDetail from "../../../components/SalaryDet";

const DetailedESI = ({
  companyName,
  selectedYear1,
  ESIdata,
  selectedState,
  setSelectmonths,
  selectmonths,
  setSelectedState,
}) => {
  // console.log("ESIdata", ESIdata);
  // console.log(companyName,selectedYear1, "selectedYear1");
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  let excelTitle = "ESI Employee Contribution Report"

  // const [selectedYear, setSelectedYear] = useState(selectedYear1);
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
      })
    : [];

  const groupdata = filteredData?.reduce((acc, emp) => {
    const code = emp.PAYPERIOD || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.ESI || 0);

    return acc;
  }, {});

  const Chartdata = Object.entries(groupdata).map(([x, y]) => ({
    month: x,
    esi: y,
    // percent: ((y / totalNetPay) * 100).toFixed(2),
    // color:getRandomColor()
  }));

  // console.log(Chartdata,"ESIyeardata");
  const pfData = Chartdata?.map((item) => item.esi);
  const headCount = Chartdata?.map((item) => item.month);

  const options = {
    chart: {
      backgroundColor: "#f5f5f5",
      marginTop: 10,
      marginBottom: 100,
      type: "line",
      height: 250,

      borderRadius: 10,
    },
    xAxis: {
      categories: headCount,
      title: {
        text: "Month",
        style: { fontSize: "10px" },
      },
      labels: {
        style: {
          fontSize: "10px",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Amount (ESI)",
        style: { fontSize: "10px" },
      },
      labels: {
        style: { fontSize: "10px" },
      },
    },
    tooltip: {
      shared: true,
      useHTML: true,
      style: { fontSize: "10px" },
      formatter: function () {
        let index = this.points[0].point.index;
        // let headCountValue = headCount[index];
        let pf = pfData[index];
        let monthName = this.x;

        return `<b>Month:</b> ${monthName} <br/>
                        <b>ESI Value:</b> ${pf.toLocaleString("en-IN")} <br/>
                       `;
      },
    },
    plotOptions: {
      series: {
        marker: {
          enabled: true,
          radius: 3,
          symbol: "circle",
        },
        dataLabels: {
          style: { fontSize: "10px" },
        },
        point: {
          events: {
            click: function () {
              const Month = this.category;

              // setSearch((prev) => ({
              //   ...prev,
              //   PAYPERIOD: Month,
              // }));
              setSelectmonths(Month);

              setShowTable(true);
            },
          },
        },
      },
    },
    title: {
      text: null,
    },
    legend: {
      itemStyle: { fontSize: "10px" },
    },
    series: [
      {
        name: "ESI",
        data: pfData,
        color: "#FF5733",
      },
    ],
  };

  return (
    <>
      <Card
        sx={{
          mt: 2,
          ml: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <CardHeader
          title="Employee Contribution"
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
          <ESIDetailed
            selectedYear={selectedYear1}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            ESIdata={ESIdata}
            selectedState={selectedState}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}
            autoFocusBuyer={true} excelTitle={excelTitle}
          />
        )}
      </Card>
    </>
  );
};

export default DetailedESI;
