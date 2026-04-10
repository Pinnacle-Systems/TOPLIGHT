import { useState } from "react";
import {
  useGetEsiPf1Query,
  useGetRegioncountQuery,
  useGetStateWiseHeadCountQuery,
} from "../../../redux/service/misDashboardService";
import { useEffect } from "react";
import { Avatar, Box, Card, CardHeader, Grid, Typography } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Chart from "react-apexcharts";
import EsiDetail from "../../../components/EsiDet";

import Highcharts from "highcharts";
import ESIDetailed from "../../../components/MonthESIde";
import { IoIosPeople, IoMdFemale } from "react-icons/io";
import { BiMaleSign } from "react-icons/bi";
import ExpHeadDetail from "../../../components/Headcount/Expdetail";
import StateWiseDetails from "../../../components/Headcount/StateWiseDetails";

const RegionHead = ({
  companyName,
  selectedYear1,
  HeadData,
  selectedState,
}) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
    STATE: ""
  });
  const [showTable, setShowTable] = useState(false);

  const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [filterBuyer, setFilterBuyer] = useState(companyName);
  const [filterHeadData, setFilteredHeadData] = useState([])
  const [selectedGender, setSelectedGender] = useState();

  const { data: regiondata } = useGetRegioncountQuery({
    params: {
      filterBuyer: filterBuyer,
    },
  });

  const { data: stateWiise } = useGetStateWiseHeadCountQuery({
    params: {
      filterBuyer: filterBuyer,
    },
  });
  console.log(stateWiise, "stateWiise");



  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  useEffect(() => {
    setSelectedYear(selectedYear1);
  }, [selectedYear1]);



  //   const filteredData = Array.isArray(regiondata?.data)
  //     ? regiondata?.data.filter((row) => {
  //         if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
  //         if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
  //         return true;
  //       })
  //     : [];

  //     const groupedSum = filteredData.reduce((acc, item) => {
  //   const key = item.PAYCAT;

  //   if (!acc[key]) {
  //     acc[key] = { tn_male: 0, tn_female: 0, tn_total: 0 };
  //   }

  //   acc[key].tn_male += item.tn_male;
  //   acc[key].tn_female += item.tn_female;
  //   acc[key].tn_total += item.tn_total;

  //   return acc;
  // }, {});


  //   const groupdata = filteredData?.reduce((acc, emp) => {
  //     const code = emp.GENDER || "Unknown";
  //     acc[code] = (acc[code] || 0) + (Math.round(emp.EMPLOYER_CON) || 0);

  //     return acc;
  //   }, {});

  //   const chartdata = Object.entries(filteredData).map(([x, y]) => ({
  //     gender: x,
  //     headcount: y,
  //   }));

  //   const colourdata = chartdata?.map((x) => x.gender);
  // SAFE: no crash even if API returns null or empty
  const first = regiondata?.data?.[0] || {};




  const pieData = [
    { name: "Female", y: first.tn_female ?? 0 },
    { name: "Male", y: first.tn_male ?? 0 },
  ];

  const pieData1 = [
    { name: "Female", y: first.non_female ?? 0 },
    { name: "Male", y: first.non_male ?? 0 },
  ];






  const options = {
    chart: {
      backgroundColor: "#f5f5f5",
      height: 150,
      plotBackgroundColor: null,
      plotBorderWidth: 0,
      plotShadow: true,
      spacing: [0, 0, 0, 0],
    },
    title: {
      text: null,
      align: "center",
      verticalAlign: "middle",
      y: 70,
      style: { fontSize: ".9em" },
    },
    tooltip: {
      formatter: function () {
        return `
            <b>${this.point.name}</b><br/>
            HeadCount: <b>${this.point.y}</b><br/>
            
          `;
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: false,
          distance: -50,
          style: { fontWeight: "bold", color: "white" },
        },
        startAngle: -90,
        endAngle: 90,
        center: ["55%", "100%"],
        size: "180%",
        innerSize: "60%",
        point: {
          events: {
            click: function () {
              // dispatch(
              //   push({
              //     id: "ESIDetail",
              //     name: "ESIDetail",
              //     component: "DetailedDashBoard",
              //     data: { companyName: this.name, Year: this.Year },
              //   })
              // );
              setSearch((prev) => ({
                ...prev,
                STATE: "TAMILNADU",
              }));

              setShowTable(true);


            },
          },
        },
      },
    },
    series: [
      {
        type: "pie",
        name: "PF share",
        innerSize: "50%",
        data: pieData,
      },
    ],
  };
  // const options1 = {
  //   chart: {
  //     backgroundColor: "#f5f5f5",
  //     height: 150,
  //     plotBackgroundColor: null,
  //     plotBorderWidth: 0,
  //     plotShadow: true,
  //     spacing: [0, 0, 0, 0],
  //   },
  //   title: {
  //     text: null,
  //     align: "center",
  //     verticalAlign: "middle",
  //     y: 70,
  //     style: { fontSize: ".9em" },
  //   },
  //   tooltip: {
  //     formatter: function () {
  //       return `
  //           <b>${this.point.name}</b><br/>
  //            HeadCount :<b>${this.point.y}</b><br/>

  //         `;
  //     },
  //   },
  //   plotOptions: {
  //     pie: {
  //       dataLabels: {
  //         enabled: false,
  //         distance: -50,
  //         style: { fontWeight: "bold", color: "white" },
  //         formatter: function () {
  //           return `${this.point.y.toLocaleString("en-IN")}`;
  //         },
  //       },
  //       startAngle: -90,
  //       endAngle: 90,
  //       center: ["55%", "100%"],
  //       size: "180%",
  //       innerSize: "60%",
  //       point: {
  //         events: {
  //           click: function () {
  //             // dispatch(
  //             //   push({
  //             //     id: "ESIDetail",
  //             //     name: "ESIDetail",
  //             //     component: "DetailedDashBoard",
  //             //     data: { companyName: this.name, Year: this.Year },
  //             //   })
  //             // );
  //             // setSearch((prev) => ({
  //             //   ...prev,
  //             //   STATE: this.name==="TAMILNADU"?"TAMILNADU":"",
  //             // }));

  //             setShowTable(true);
  //           },
  //         },
  //       },
  //     },
  //   },
  //   series: [
  //     {
  //       type: "pie",
  //       name: "PF share",
  //       innerSize: "50%",
  //       data: pieData1,
  //     },
  //   ],
  // };

  const StatBox = ({ icon: Icon, value, label, color }) => (
    <Box
      sx={{
        p: 1,
        borderRadius: 3,
        background: "#e9eef6",
        display: "flex",
        alignItems: "center",
        gap: 2,
        boxShadow: 2,
        height: "100%",
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          //   mr: 3,
          borderRadius: 50,
          width: 40,
          height: 40,
          boxShadow: 3,
          color: "common.black",
          backgroundColor: "white",
        }}
      >
        {Icon}
      </Avatar>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {value}
        </Typography>
      </Box>
    </Box>
  );


  console.log(HeadData?.filter?.(i  => !i.STATE),"FILTEREEEEE");
  
  const filterDataBySearch = (param) => {
    console.log(param, "paramparam")
    const filtered = HeadData?.filter(row => {
      const bgf = row?.STATE?.toLowerCase();
      console.log(search, "searchsearch")
      if(param == "NA"){
        return !bgf
      }

      return bgf == param.toLocaleLowerCase();
    });
    setFilteredHeadData(filtered);
  }

  const stateData = [
    { state: "Tamil Nadu", male: 120, female: 80 },
    { state: "Karnataka", male: 40, female: 30 },
    { state: "Kerala", male: 25, female: 20 },
    { state: "Andhra Pradesh", male: 60, female: 45 },
    { state: "Maharashtra", male: 30, female: 20 }
  ];

  // Prepare Highcharts options
  const options1 = {
    chart: {
      type: "column"
    },
    xAxis: {
      categories: stateWiise?.data?.map((item) => item.STATE)
    },
    yAxis: {
      min: 0,
      title: {
        text: "Headcount"
      }
    },
    legend: {
      align: "center",
      verticalAlign: "bottom"
    },
    title: null,

    plotOptions: {
      series: {
        point: {
          events: {
            click: function () {
              const clickedState = this.category;   // X-axis category → STATE
              const clickedGender = this.series.name; // Series name → Male/Female
              const clickedValue = this.y; // Value

              console.log("Clicked:", clickedState, clickedGender, clickedValue);

              setSearch((prev) => ({
                ...prev,
                STATE: clickedState,
              }));
              setSelectedGender(clickedGender)
              filterDataBySearch(clickedState);

              setShowTable(true);

            },
          },
        },
      },
    },
    series: [
      {
        name: "Male",
        data: stateWiise?.data?.map((item) => item.MALE),
        color: "#2196F3"
      },
      {
        name: "Female",
        data: stateWiise?.data?.map((item) => item.FEMALE),
        color: "#E91E63"
      }
    ]
  };

  // useEffect(() => {
  //   if (!search?.STATE) return;

  //   const filtered = HeadData?.filter(row => {
  //     const bgf = row?.STATE?.toLowerCase();

  //     return bgf == search?.STATE?.toLocaleLowerCase();
  //   });

  //   setFilteredHeadData(filtered);
  // }, [search]);




  return (
    <>
      {/* <Card
        sx={{
          backgroundColor: "#f5f5f5",
          height: 380,

        }}
      >
        <CardHeader
          title="Region wise HeadCount"
          titleTypographyProps={{
            sx: { fontSize: ".9rem", fontWeight: 600 },
          }}
          sx={{
            p: 1,
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />
        <Grid container spacing={1}>
          <Grid item md={12}>
            <Grid container spacing={1}>
              <Grid item md={8}>
                <Box>
                  <HighchartsReact highcharts={Highcharts} options={options} />
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 7 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: "gray",
                        mr: .5
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: "11px" }}>
                      <strong>Tamilnadu</strong>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={12}>
            <Grid container spacing={1}>
              <Grid item md={8}>
                <Box>
                  <HighchartsReact highcharts={Highcharts} options={options1} />
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 7 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: "gray",
                        mr: .5
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: "11px" }}>
                      <strong>Other State</strong>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>


        {showTable && (
          <ExpHeadDetail
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            HeadData={HeadData}
          />
        )}
      </Card> */}
      <CardHeader
        title="State Wise Headcount"
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />
      <Grid item md={12}>
        <Grid container spacing={1}>
          <Grid item md={12}>
            <Box>
              <HighchartsReact highcharts={Highcharts} options={options1} />
            </Box>
          </Grid>
          {showTable && (
            <StateWiseDetails
              selectedBuyer={[filterBuyer]}
              closeTable={() => setShowTable(false)}
              setSearch={setSearch}
              search={search}
              HeadData={filterHeadData}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default RegionHead;
