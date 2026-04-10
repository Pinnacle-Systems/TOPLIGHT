import React, { useEffect, useState, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useContext } from "react";
import { Box, Card, CardHeader, Grid, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { ColorContext } from "../../global/context/ColorContext";
import { useGetMisDashboardAttDetQuery, useGetMisDashboardNewjoinQuery } from "../../../redux/service/misDashboardService";
import NewjoinDetails from "../../../components/Attrition/newjoinDetail";
import AttriDetails from "../../../components/Attrition/Attritiondet";







const LeftList = ({
  selectedYear1,
  companyName,
  selectmonths,
  setSelectmonths,
}) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",

  });
  const [selectedBuyer, setSelectedBuyer] = useState(companyName);
  // const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [selectedGender, setSelectedGender] = useState("");
  let excelTitle = "Attrition Left List report"
  const chartRef = useRef();
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    setSelectedBuyer(companyName);
  }, [companyName]);



  const dispatch = useDispatch();

  const { color } = useContext(ColorContext);

  const { data: NewJoinData } = useGetMisDashboardNewjoinQuery({
    params: {
      filterBuyer: companyName || "",
      filterYear: selectedYear1 || "",
    },
  });
  const { data: LeftData } = useGetMisDashboardAttDetQuery({
    params: {
      filterBuyer: companyName || "",
      filterYear: selectedYear1 || "",
    },
  });

  console.log(LeftData, "LeftData");


  const NewData = LeftData?.data || [];

  const filteredData = Array.isArray(NewData)
    ? NewData.filter((row) => {
      if (!selectmonths) return true;
      return row.PAYPERIOD === selectmonths;
    })
    : [];
  const groupdata1 = filteredData?.reduce((acc, emp) => {
    const gender = emp.GENDER || "Unknown";

    if (!acc[gender]) {
      acc[gender] = [];
    }

    acc[gender].push(emp);

    return acc;
  }, {});
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"]
  const pieData = [
    { name: "Female", y: groupdata1?.FEMALE?.length ?? 0, color: colors[2] },
    { name: "Male", y: groupdata1?.MALE?.length ?? 0, color: colors[0] },
  ];

  //   console.log(pieData, "Newdataatta");

  // const sumByCompany = (NewData|| []).reduce((acc, item) => {
  //   acc[item.company] = (acc[item.company] || 0) + item.attrition;
  //   return acc;
  // }, {});

  // const chartData = Object.entries(sumByCompany).map(([company, total]) => ({
  //   name: company,
  //   value: total,
  // }));

  // const categories = chartData?.map((item) => item.name);
  // const seriesData = chartData?.map((item) => item.value);

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
            Left count: <b>${this.point.y}</b><br/>
            
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
              // setSelectmonths()
              //   console.log(this.name,"clicked value");
              setSelectedGender(this.name)

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

  return (
    <Card
      sx={{
        backgroundColor: "#f5f5f5",

      }}
    >
      <CardHeader
        title="Left List"
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />
      <Grid container spacing={2}>
        <Grid item md={8}>
          <Box>
            <HighchartsReact
              highcharts={Highcharts} // FIXED ✔
              options={options}
            />
          </Box>
        </Grid>
        <Grid item md={4}>
          <Box sx={{ display: "flex", alignItems: "center", mt: 7 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#FF9800",
                mr: 0.5,
              }}
            />
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              <strong>Female-{groupdata1?.FEMALE?.length || 0}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                mr: 0.5,
              }}
            />
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              <strong>Male-{groupdata1?.MALE?.length || 0}</strong>
            </Typography>
          </Box>
        </Grid>
      </Grid>

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
  );
};

export default LeftList;
