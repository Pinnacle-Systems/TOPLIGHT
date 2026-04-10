import { useState } from "react";
import { useGetEsiPf1Query, useGetMisDashboardAttDetQuery, useGetMisDashboardNewjoinQuery } from "../../../redux/service/misDashboardService";
import { useEffect } from "react";
import { Box, Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Chart from "react-apexcharts";
import EsiDetail from "../../../components/EsiDet";

import Highcharts from "highcharts";
import ESIDetailed from "../../../components/MonthESIde";
import NewjoinDetails from "../../../components/Attrition/newjoinDetail";
import AttriDetails from "../../../components/Attrition/Attritiondet";

const DeptLeft = ({
  companyName,
  selectedYear1,
  
  setSelectmonths,
  selectmonths,

}) => {
    let excelTitle = "Attrition Department wise Left List report"

  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(companyName);
   const [selectedGender, setSelectedGender] = useState("Both");

    const { data: LeftData } = useGetMisDashboardAttDetQuery({
       params: {
         filterBuyer: companyName || "",
         filterYear: selectedYear1 || "",
       },
     });
     const NewData = LeftData?.data || [];

  useEffect(() => {
    setSelectedBuyer(companyName);
  }, [companyName]);

  
  const filteredData = Array.isArray(NewData)
    ? NewData.filter((row) => {
        if (!selectmonths) return true;
        return row.PAYPERIOD === selectmonths;
      })
    : [];


  const groupdata1 = filteredData?.reduce((acc, emp) => {
    const code = emp.DEPARTMENT || "Unknown";
    if(!acc[code])
    {
        acc[code]=[]
    }
    acc[code].push(emp)

    return acc;
  }, {});
  console.log(groupdata1,"groupdata123388");
  
const chartdata = Object.entries(groupdata1).map(([dept, arr]) => ({
  dept:dept,
  count: arr.length,
}));
  const Xdata = chartdata?.map((item) => item.dept);
  const Ydata = chartdata?.map((item) => item.count);

  const options = {
    chart: {
      backgroundColor: "#f5f5f5",
      marginTop: 10,
      marginBottom: 100,
      type: "line",
      height: 250,

      borderRadius: 10,
    },

    title: {
      text: null,
    },

    accessibility: {
      point: {
        valueDescriptionFormat: "{xDescription}{separator}{value} million(s)",
      },
    },

    xAxis: {
      title: {
        text: "Department",
        style: { fontSize: "10px" },
      },
      categories: Xdata,
      labels: {
        style: { fontSize: "10px" },
      },
    },

    yAxis: {
      
      title: {
        text: "Number of Employee",
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
        let pf = Xdata[index];
        let monthName = this.x;

        return `<b>Department:</b> ${this.x} <br/>
                        <b>Left Count:</b> ${this.y} <br/>
                       `;
      },
    },
    legend: {
      enabled: false,
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

              setSearch((prev) => ({
                ...prev,
                DEPARTMENT: Month,
              }));
              
              

              setShowTable(true);
            },
          },
        },
      },
    },
    series: [
      {
        name: "Internet Users",
        data: Ydata,
        color: "var(--highcharts-color-1, #e06223)",
      },
    ],
  };
 
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
          title="Department wise Left List"
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
              <AttriDetails
                selectedBuyer={[selectedBuyer]}
                closeTable={() => setShowTable(false)}
                setSearch={setSearch}
                search={search}
                selectmonths={selectmonths}
                selectedYear={selectedYear1}
                setSelectmonths={setSelectmonths}
                autoFocusBuyer={true}
                NewData={NewData}
                selectedGender1={selectedGender} excelTitle={excelTitle}
                // setSelectedGender1={setSelectedGender}
              />
            )}
      </Card>
    </>
  );
};

export default DeptLeft;



