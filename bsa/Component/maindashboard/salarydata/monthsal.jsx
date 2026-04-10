import { Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState } from "react";
import PfDetail from "../../../components/PfDet";
import Highcharts from "highcharts";
import PFDetailedCom from "../../../components/PF detail/pfDetail";
import SalaryDetail from "../../../components/SalaryDet";

const Monthsalary=({ companyName, selectedYear1, salaryDet, selectedState,selectmonths,setSelectedState,setSelectmonths })=>{
const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  let excelTitle = "Salary Distribution Month wise Report"
  const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [filterBuyer, setFilterBuyer] = useState(companyName);

  //     const { data: PFyeardata } = useGetEsiPfQuery(
  //         {params: {
  //             filterSupplier: filterBuyer ,
  //             filterYear: selectedYear ,
  //         }},

  //     );
  //     console.log(PFyeardata, "PFyeardata")
  //    const pfData = PFyeardata?.data.map((item) => item.esi);
  //     const headCount = PFyeardata?.data.map((item) => item.headCount);

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  
  useEffect(() => {
    setSelectedYear(selectedYear1);
  }, [selectedYear1]);

  const filteredData = Array.isArray(salaryDet)
    ? salaryDet.filter((row) => {
        if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
        if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
        return true;
      })
    : [];

  const groupdata = filteredData?.reduce((acc, emp) => {
    const code = emp.PAYPERIOD || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.NETPAY || 0);

    return acc;
  }, {});

  const Chartdata = Object.entries(groupdata).map(([x, y]) => ({
    month: x,
    netpay: y,
    // percent: ((y / totalNetPay) * 100).toFixed(2),
    // color:getRandomColor()
  }));
  const Netpay = Chartdata?.map((item) => item.netpay);
  const Month = Chartdata?.map((item) => item.month);

const options = {
    chart: {
      marginBottom: 125,
      backgroundColor: "#f5f5f5",
      scrollablePlotArea: { minWidth: 300 },
      // marginTop: 10,
      type: "line",
      height: 300,
      // borderRadius: 10,
    },

    xAxis: {
      categories: Month,
      title: { text: "month"    , style: { fontSize: "10px" } },
      labels: { style: { fontSize: "10px" },},
    },

    yAxis: {
      min: 0,
      title: { text: "Netpay", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
    },

    tooltip: {
      shared: true,
      style: { fontSize: "10px" , },
      formatter: function () {
        let tooltip = `<b>${this.x}</b><br/>`;
        const index = this.points[0].point.index;
        tooltip += `<b>Netpay:</b> ${Netpay[index].toLocaleString("en-IN")}`;
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
          distance: -25,
          formatter: function () {
            return `${this.point.y.toLocaleString("en-IN")}`;
          },
          style: {
            color: "#000000",
            fontWeight: "normal",
            rotation: -35 
          },
        },

        point: {
          events: {
            click: function () {
              const companyName = this.category;
              console.log("Clicked:", companyName);
            //   setSearch((prev) => ({
            //     ...prev,
            //     DEPARTMENT: companyName,
            //   }));
            setSelectmonths(companyName)
              setShowTable(true);
            },
          },
        },
      },
    },

    title: null,
    legend:{
        enabled:false
    },

    series: [
      {
        name: "Netpay",
        data: Netpay,
        color: "#FF0000",
        marker: {
          fillColor: "#FF0000",
          lineWidth: 2,
          lineColor: "#000000",
        },
      },
    ],
  };

return<>
<Card
        sx={{
          mt: 2,
          
          backgroundColor: "#f5f5f5",
        }}
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
        <HighchartsReact highcharts={Highcharts} options={options} />

        {showTable && (
        <SalaryDetail
          selectedBuyer={[filterBuyer]}
          closeTable={() => setShowTable(false)}
          setSearch={setSearch}
          search={search}
          salaryDet={salaryDet}
          selectedState={selectedState}
          selectmonths={selectmonths}
          setSelectedState={setSelectedState}
          setSelectmonths={setSelectmonths}
          selectedYear={selectedYear1}
          autoFocusBuyer={true}
          excelTitle={excelTitle}
          // selectGender1={selectGender}
        />
      )}
      </Card>

</>

} 
export default Monthsalary