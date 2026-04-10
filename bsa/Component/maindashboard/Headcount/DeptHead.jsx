import React, { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import drilldown from "highcharts/modules/drilldown";
import { Box, Card, CardHeader, Typography } from "@mui/material";
import {
  useGetHeadCountDetailQuery,
  useGetHeadCountQuery,
  useGetMisDashboardOrdersInHandQuery,
} from "../../../redux/service/misDashboardService";
import { useTheme } from "@emotion/react";
import HeadDetailedCom from "../../../components/Headcount/HeadDetail";

// Initialize Highcharts drilldown safely
if (typeof Highcharts === "object") {
  drilldown(Highcharts);
}

const DeptHeadCount = ({ companyName, selectedState, HeadData }) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);

  const [filterBuyer, setFilterBuyer] = useState(companyName);
  const [filterHeadData, setFilteredHeadData] = useState([])
  const [selectedGender, setSelectedGender] = useState();

  let excelTitle = "Department wise HeadCount-Male vs Female Report"


  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  const filteredData = Array.isArray(HeadData)
    ? HeadData.filter((row) => {
      if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
      if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
      return true;
    })
    : [];

  // const groupdata1 = filteredData?.reduce((acc, emp) => {
  //   const dept = emp.DEPARTMENT || "Unknown";
  //   const gender = (emp.GENDER || "Unknown").trim().toLowerCase();

  //   const normalizedGender =
  //     gender === "male" ? "Male" : gender === "female" ? "Female" : "Other";

  //   if (!acc[dept]) {
  //     acc[dept] = { Male: 0, Female: 0 };
  //   }

  //   acc[dept][normalizedGender] += 1;

  //   return acc;
  // }, {});

  const groupdata1 = filteredData?.reduce((acc, emp) => {
    // Clean department name
    let dept = (emp.DEPARTMENT || "Unknown").trim();

    // Normalize department safely (case-insensitive)
    dept = dept.toLowerCase();

    // If you want exact department separation, do NOT merge similar words
    // Final formatting (first letter capital)
    dept = dept.charAt(0).toUpperCase() + dept.slice(1);

    // Normalize gender
    const gender = (emp.GENDER || "Unknown").trim().toLowerCase();
    const normalizedGender =
      gender === "male" ? "Male" :
        gender === "female" ? "Female" : "Other";

    // Create dept bucket if not exists
    if (!acc[dept]) {
      acc[dept] = { Male: 0, Female: 0, Other: 0 };
    }

    // Count
    acc[dept][normalizedGender] += 1;

    return acc;
  }, {});



  const departments = Object.keys(groupdata1 || []);

  const maleCounts = departments.map((dept) => groupdata1[dept].Male || 0);
  const femaleCounts = departments.map((dept) => groupdata1[dept].Female || 0);

  console.log(groupdata1, "depatmet");


  const option = {
    chart: {
      height: 332,
      type: "spline",
      marginBottom: 120,
      backgroundColor: "#f5f5f5",
    },
    title: {
      text: null,
    },

    xAxis: {
      categories: departments,
      accessibility: {
        description: "Months of the year",
      },
      labels: {
        style: { fontSize: "8px" },
      },
    },
    yAxis: {
      title: {
        text: "HeadCount", style: { fontSize: "10px" },
      },
      labels: {
        style: { fontSize: "10px" },
      },

    },
    tooltip: {
      crosshairs: true,
      shared: true,
    },
    plotOptions: {
      series: {
        cursor: "pointer",

        point: {
          events: {
            click: function () {
              setSearch((prev) => ({
                ...prev,
                DEPARTMENT: this.category,
              }));
              setSelectedGender(this.series.name)
              filterDataBySearch(this.category)

              setShowTable(true)
              console.log("Department:", this.category);
              console.log("Gender:", this.series.name);
              console.log("Headcount:", this.y);

            },
          },
        },
      },
      spline: {
        marker: {
          radius: 4,
          lineColor: "#666666",
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        name: "Male",

        data: maleCounts,
      },
      {
        name: "Female",
        data: femaleCounts,
      },
    ],
  };
const filterDataBySearch = (param) => {
  console.log(param,"paramparam")
  const filtered = HeadData?.filter(row => {
    const bgf = row?.DEPARTMENT?.toLowerCase();
    console.log(search, "searchsearch")

    return bgf == param.toLocaleLowerCase();
  });
  setFilteredHeadData(filtered);
}


  // useEffect(() => {
  //   if (!search?.DEPARTMENT || showTable) return;

  //   const filtered = HeadData?.filter(row => {
  //     const bgf = row?.DEPARTMENT?.toLowerCase();
  //     console.log(search, "searchsearch")



  //     return bgf == search?.DEPARTMENT?.toLocaleLowerCase();
  //   });

  //   setFilteredHeadData(filtered);
  // }, [search]);



  return (
    <Card
      sx={{
        ml: 1,
        mt: 1,
        backgroundColor: "#f5f5f5",
      }}
    >
      <CardHeader
        title="Department wise HeadCount-Male vs Female"
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />
      <Box>
        <HighchartsReact highcharts={Highcharts} options={option} />
      </Box>


      {showTable && (
        <HeadDetailedCom
          selectedBuyer={[filterBuyer]}
          closeTable={() => setShowTable(false)}
          setSearch={setSearch}
          search={search}
          HeadData={filterHeadData}
          selectedGender={selectedGender} excelTitle={excelTitle}
          setSelectedGender={setSelectedGender}
        />
      )}


    </Card>
  );
};

export default DeptHeadCount;
