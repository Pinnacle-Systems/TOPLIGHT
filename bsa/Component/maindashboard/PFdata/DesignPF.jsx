import { useState } from "react";
import {
  useGetEsiPf1Query,
  useGetEsiPfQuery,
} from "../../../redux/service/misDashboardService";
import { useEffect } from "react";
import { Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { Title } from "@mui/icons-material";
import PfDetail from "../../../components/PfDet";
import PFDetailedCom from "../../../components/PF detail/pfDetail";

const DesignPF = ({ companyName,
  selectedYear1,
  setSelectmonths,
  selectmonths,
  setSelectedState,
  selectedState,
  PFdata, }) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  let excelTitle = "PF Contribution Designation wise Report"
  // const [selectedYear, setSelectedYear] = useState(selectedYear1);
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

  // useEffect(() => {
  //   setSelectedYear(selectedYear1);
  // }, [selectedYear1]);

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

  const groupdata = filteredData?.reduce((acc, emp) => {
    const code = emp.DESIGNATION || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.PF || 0);

    return acc;
  }, {});

  const Chartdata = Object.entries(groupdata).map(([x, y]) => ({
    desgn: x,
    pf: y,
    // percent: ((y / totalNetPay) * 100).toFixed(2),
    // color:getRandomColor()
  }));
  const pfData = Chartdata?.map((item) => item.pf);
  const Xdata = Chartdata?.map((item) => item.desgn);
  //   const colorArray = ['#8A37DE', '#005E72', '#E5181C', '#056028', '#1F2937'];
  const colorArray = pfData.map(
    () => "#" + Math.floor(Math.random() * 16777215).toString(16)
  );

  //   const options = {
  //     chart: {
  //       backgroundColor: "#f5f5f5",
  //       marginTop: 10,
  //       marginBottom: 100,
  //       type: "line",
  //       height: 250,
  //       borderRadius: 10,
  //     },
  //     xAxis: {
  //       categories: Xdata,
  //       title: {
  //         text: "Department",
  //         style: { fontSize: "10px" },
  //       },
  //       labels: {
  //         style: { fontSize: "10px"},
  //       },
  //     },
  //     yAxis: {
  //       min: 0,
  //       title: {
  //         text: "Amount (PF)",
  //         style: { fontSize: "10px" },
  //       },
  //       labels: {
  //         style: { fontSize: "10px" },
  //       },
  //     },
  //     tooltip: {
  //       shared: true,
  //       useHTML: true,
  //       style: { fontSize: "10px" },
  //       formatter: function () {
  //         let index = this.points[0].point.index;

  //         let pf = pfData[index];
  //         let monthName = this.x;

  //         return `<b>Dept:</b> ${monthName} <br/>
  //                         <b>PF Value:</b> ${pf} <br/>
  //                         `;
  //       },
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
  //               setShowTable(true);
  //             },
  //           },
  //         },
  //       },
  //     },
  //     title: {
  //       text: null,
  //     },
  //     legend: {
  //       enabled:false,
  //       itemStyle: { fontSize: "10px" },
  //     },
  //     series: [
  //       {
  //         name: "Department",
  //         data: pfData,
  //         color: "#FF5733",
  //       },
  //     ],
  //   };

  const option = {
    chart: {
      type: "column",
      height: 400,
      options3d: {
        enabled: true,
        alpha: 4,
        beta: 4,
        depth: 100,
        viewDistance: 100,
      },
      backgroundColor: "#f5f5f5",
      borderRadius: "10px",
      marginBottom:120,
      marginLeft: 50,
    },
    title: null,
    legend: { enabled: false },
     tooltip: {
  formatter: function () {
    return `<b>${this.x}</b></br>
    <b>Pf share:${this.y.toLocaleString('en-IN')}</b>
  `;
  }
},
    xAxis: {
      categories: Xdata,

      labels: { style: { fontSize: "10px", color: "#6B7280" }, rotation: 90 },
      title: {
        text: null,
        style: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
        margin: 30,
      },
    },
    yAxis: {
      title: {
        text: "Amount(PF)",
        style: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
        margin: 25,
      },
      labels: { style: { fontSize: "10px", color: "#6B7280" } },
    },
    plotOptions: {
      column: { depth: 25, colorByPoint: true, borderRadius: 5 },

      series: {
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              setSearch((prev) => ({
                ...prev,
                DESIGNATION: this.category,
              }));
              setShowTable(true);
              // console.log("Clicked:", this.category, this.y); // test
              // alert(`You clicked ${this.category} → ${this.y}`);
            },
          },
        },
      },
    },

    colors: colorArray,
    series: [
      {
        name: "",
        data: pfData,
        dataLabels: {
          enabled: true,
          rotation: -90, 
          formatter: function () {
            return this.y.toLocaleString("en-IN"); 
          },
          style: { fontSize: "10px", color: "#333" },
        },
      },
    ],
  };

  return (
    <>
      <Card
        sx={{
          
          ml: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <CardHeader
          title="Designation wise "
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
          <PFDetailedCom
            selectedYear={selectedYear1}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            PFdata={PFdata}
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

export default DesignPF;
