// import { useEffect, useState } from "react";
// import {
//   useGetMisDashboardBgDetQuery,
//   useGetMisDashboardOrdersInHandQuery,
// } from "../../../redux/service/misDashboardService";
// import { Box, Card, CardHeader } from "@mui/material";
// import HighchartsReact from "highcharts-react-official";
// import Highcharts from "highcharts";
// import { useGetTopItemsQuery } from "../../../redux/service/poData";
// import SortedBarChart from "../../MisDashboard/BloodGroupDistribution/SortedBarChart";
// import ExpHeadDetail from "../../../components/Headcount/Expdetail";
// import BloodGroupDetails from "../../../components/Headcount/BloogGroupDetail";

// const BGhead = ({ companyName, selectedState, HeadData }) => {
//   const [search, setSearch] = useState({
//     FNAME: "",
//     GENDER: "",
//     MIDCARD: "",
//     DEPARTMENT: "",
//     COMPCODE: "",
//   });
//   const [showTable, setShowTable] = useState(false);

//   const [filterBuyer, setFilterBuyer] = useState(companyName);
//   const [filterHeadData,setFilteredHeadData] = useState([])

//   useEffect(() => {
//     setFilterBuyer(companyName);
//   }, [companyName]);
//   const { data: BGdata } = useGetTopItemsQuery({ filterBuyer: filterBuyer });
//   console.log(HeadData, "HeadData");
//   const totalCount = (BGdata?.data)?.reduce((sum, val) => sum + val?.headcount, 0);
//   console.log(totalCount, "totalCount");
//   // const filteredData = Array.isArray(BGdata?.data)
//   //   ? BGdata?.data.filter((row) => {
//   //       if (selectedState === "Labour") return row?.Paycat !== "STAFF";
//   //       if (selectedState === "Staff") return row?.Paycat === "STAFF";
//   //       return true;
//   //     })
//   //   : [];
//   // console.log(filteredData, "filteredData");

//   // const totalsByComp = BGdata?.data?.reduce((acc, emp) => {
//   //   const code = emp.BGF || "Unknown";
//   //   acc[code] = (acc[code] || 0) + (emp.headcount || 0);
//   //   return acc;
//   // }, {});
//   const totalsByComp = BGdata?.data?.reduce((acc, emp) => {
//     const code = emp.BGF || "Unknown";   // Use BGF as the key

//     acc[code] = (acc[code] || 0) + Number(emp.headcount || 0);

//     return acc;
//   }, {});

//   console.log(totalsByComp, "totalsByComp");

//   const Chartdata = Object.entries(totalsByComp || [])?.map(([x, y]) => ({
//     Agerange: x,
//     Headcount: y,
//   }));


//   // const Chartdata =  Object.entries(totalsByComp || [])?.map(d => ({
//   //   label: d.Agerange,
//   //   value: d.Headcount
//   // }));

//   console.log(Chartdata, "Chartdata");


//   const options = {
//     chart: {
//       type: "pie",
//       backgroundColor: "transparent",
//       height: 195,
//       marginBottom: 0,
//       marginTop: 0,
//     },
//     title: {
//       text: null,
//       style: { fontSize: "16px", fontWeight: "600" },
//     },
//     // subtitle: {
//     //   text: "Click on a slice for details",
//     //   style: { fontSize: "13px", color: "#888" },
//     // },
//     tooltip: {
//       pointFormat:
//         "<b>{point.name}</b>: {point.y} Employees<br/>({point.percentage:.1f}%)",
//     },
//     accessibility: {
//       point: {
//         valueSuffix: "%",
//       },
//     },
//     plotOptions: {
//       pie: {
//         allowPointSelect: true,
//         cursor: "pointer",
//         borderRadius: 1,
//         dataLabels: {
//           enabled: true,
//           distance: -1,
//           format: "{point.name} </br>{point.percentage:.1f}%",
//           style: {
//             fontSize: "10px",
//             textOutline: "none",
//           },
//         },
//         point: {
//           events: {
//             click: function () {
//               console.log("Clicked Slice:", this.name, this.y);

//               setSearch((prev) => ({
//                 ...prev,
//                 BGF: this.name,
//               }));

//               setShowTable(true);
//             },
//           },
//         },
//       },
//     },
//     colors: [
//       "#F44F5E",
//       "#E55A89",
//       "#D863B1",
//       "#CA6CD8",
//       "#B57BED",
//       "#8D95EB",
//       "#62ACEA",
//       "#4BC3E6",
//     ],
//     series: [
//       {
//         name: "Departments",
//         colorByPoint: true,
//         data: Chartdata?.map((item, i) => ({
//           name: item.Agerange,
//           y: item.Headcount,
//         })),
//       },
//     ],
//     drilldown: {
//       series: [],
//     },
//   };

// useEffect(() => {
//   if (!search?.BGF) return;

//   const filtered = HeadData?.filter(row => {
//     const bgf = row?.BGF;

// // When selected value is "NA"
// if (search.BGF == "NA") {
//   return !bgf 
// }

// return bgf === search.BGF;
//   });

//       setFilteredHeadData(filtered);
//     }, [search]);

//   return (
//     <>
//       <Card
//         sx={{
//           ml: 1,
//           backgroundColor: "#f5f5f5",
//         }}
//       >
//         <CardHeader
//           title="Blood Group wise HeadCount"
//           titleTypographyProps={{
//             sx: { fontSize: ".9rem", fontWeight: 600 },
//           }}
//           sx={{
//             p: 1,
//             borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
//           }}
//         />
//         <Box>
//           <SortedBarChart
//             topItems={Chartdata}
//             setSearch={setSearch}
//             setShowTable={setShowTable}
//           />
//         </Box>

// {showTable && (
//   <BloodGroupDetails
//     selectedBuyer={[filterBuyer]}
//     closeTable={() => setShowTable(false)}
//     setSearch={setSearch}
//     search={search}
//     HeadData={filterHeadData}
//   />
// )}
//       </Card>
//     </>
//   );
// };
// export default BGhead;
import { useEffect, useState } from "react";
import { useGetMisDashboardOrdersInHandQuery } from "../../../redux/service/misDashboardService";
import { Box, Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { useGetOverAllSupplierContributionQuery, useGetTopItemsQuery } from "../../../redux/service/poData";
import HeadDetailedCom from "../../../components/Headcount/HeadDetail";
import ExpHeadDetail from "../../../components/Headcount/Expdetail";
import BloodGroupDetails from "../../../components/Headcount/BloogGroupDetail";

const BGhead = ({ companyName, selectedState, HeadData }) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
    BGF: "",
  });
  const [showTable, setShowTable] = useState(false);

  const [filterBuyer, setFilterBuyer] = useState(companyName);
  const [filterHeadData, setFilteredHeadData] = useState([])
  const [selectedGender, setSelectedGender] = useState();

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);
  const { data: Expdata } = useGetOverAllSupplierContributionQuery({
    filterBuyer: filterBuyer,
  });
  const { data: BGdata } = useGetTopItemsQuery({ filterBuyer: filterBuyer });


  const totalsByComp = BGdata?.data?.reduce((acc, emp) => {
    const code = emp.BGF || "Unknown";   // Use BGF as the key

    acc[code] = (acc[code] || 0) + Number(emp.headcount || 0);

    return acc;
  }, {});
  console.log(totalsByComp, "totalsByComp");


  //   const Chartdata = Object.entries(totalsByComp || [])?.map(([x, y]) => ({
  //     Agerange: x,
  //     Headcount: y,
  //   }));

  const xdata = Object.entries(totalsByComp || [])?.map(([x, y]) => x);
  const ydata = Object.entries(totalsByComp || [])?.map(([x, y]) => y);

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
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    marginBottom: 60,
  },

  title: null,
  legend: { enabled: false },

  tooltip: {
    headerFormat:
      '<b><span style="color: #2d2d2d;">Blood Group: {point.key}</span></b><br/>',
    pointFormat: `
      <span style="color: {point.color}; font-size: 12px;">\u25CF</span> 
      Employees: <span style="color: #2d2d2d;"><b>{point.y}</b></span>`,
    style: { fontSize: "10px", color: "black" },
  },

  xAxis: {
    categories: xdata,
    labels: { style: { fontSize: "10px", color: "#6B7280" } },
    title: {
      text: "Blood Group",
      align: "middle",
      style: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
      },
      margin: 12,
    },
  },

  yAxis: {
    title: {
      text: "Headcount",
      align: "middle",
      style: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
      },
      margin: 18,
    },
    labels: { style: { fontSize: "10px", color: "#6B7280" } },
  },

  plotOptions: {
    column: {
      borderRadius: 5,
      colorByPoint: true,
    },
    series: {
      point: {
        events: {
          click: function () {
            console.log("Clicked:", this.category, this.y);

            setSearch((prev) => ({
              ...prev,
              BGF: this.category,
            }));

            filterDataBySearch(this.category);
            setShowTable(true);
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





  const filterDataBySearch = (param) => {
    console.log(param, "paramparam")
    const filtered = HeadData?.filter(row => {
      const bgf = row?.BGF?.toLowerCase();
      console.log(search, "searchsearch")

      // When selected value is "NA"
      if (param == "NA") {
        return !bgf
      }

      return bgf == param.toLocaleLowerCase();

    });
    setFilteredHeadData(filtered);
  }

  return (
    <>
      <Card
        sx={{
          backgroundColor: "#f5f5f5",
          height: 380,
        }}
      >
        <CardHeader
          title="Blood Group wise HeadCount"
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
          <BloodGroupDetails
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            HeadData={filterHeadData}
            setSelectedGender={setSelectedGender}
            selectedGender={selectedGender}
          />
        )}
      </Card>
    </>
  );
};
export default BGhead;
