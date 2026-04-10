// import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Grid,
} from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useGetMisDashboardEsiDetQuery } from '../../../redux/service/misDashboardService'
import { useState } from 'react';
import EmptypeDetails from '../../../components/EmptypesalayDetails';
import ExpHeadDetail from '../../../components/Headcount/Expdetail';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#B435E3", "#E35B5B"];

const EmptypeHead = ({ companyName, selectedState, HeadData }) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  const [filterBuyer, setFilterBuyer] = useState(companyName);
  let excelTitle ="Employee Type Wise HeadCount Report"
  const filteredData = Array.isArray(HeadData)
    ? HeadData.filter((row) => {
      if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
      if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
      return true;
    })
    : [];

  const groupeddata = filteredData?.reduce((acc, item) => {

    const code = item.EMPTYPE || "Unknown"
    if (!acc[code]) {
      acc[code] = []
    }
    acc[code].push(item)

    return acc

  }, {});

  const deptHeadcount = {};

  Object.keys(groupeddata || {}).forEach(dept => {
    deptHeadcount[dept] = groupeddata[dept].length;
  });

  console.log(groupeddata, "groupeddata");

  console.log(deptHeadcount, "totalsByComp");


  const Chartdata = Object.entries(deptHeadcount).map(([emptype, netpay], index) => ({
    Emptype: emptype,
    headcount: netpay,
    color: COLORS[index % COLORS.length],
  }));

  console.log(Chartdata, "Chartdata");


  const handlePieClick = (data, index) => {


    setSearch((prev) => ({
      ...prev,
      EMPTYPE: data.Emptype,
    }));
    setShowTable(true);
  }

  return (
    <Card
      sx={{
        backgroundColor: "#f5f5f5",
        ml: 1,
        height: 330,
        marginTop: 1
      }}
    >
      <CardHeader
        title="Employee Type Wise HeadCount"
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />
      <Grid container spacing={1} >

        <Grid item md={12}>
          <ResponsiveContainer width="100%" height={150} style={{}}>
            <PieChart>
              <Pie
                data={Chartdata}
                dataKey="headcount"
                nameKey="Emptype"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={1}
                onClick={(data, index) => handlePieClick(data, index)}
              >
                {Chartdata.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [` ${value.toLocaleString("en-IN")}`, name]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: 1, border: '1px solid #ccc' }}
              />
            </PieChart>
          </ResponsiveContainer>

        </Grid>

        <Grid item md={12}>
          {Chartdata.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: .8, ml: 2 }}>
              <Box
                sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color, mr: 1.5 }}
              />
              <Typography variant="body2" sx={{ fontSize: "11px" }}>
                <strong>{item.headcount.toLocaleString("en-IN")}</strong> — {item.Emptype}
              </Typography>
            </Box>
          ))}

        </Grid>


      </Grid>



      {showTable && (
        <ExpHeadDetail
          selectedBuyer={[filterBuyer]}
          closeTable={() => setShowTable(false)}
          setSearch={setSearch} excelTitle={excelTitle}
          search={search}
          HeadData={HeadData}
        />
      )}
    </Card>
  )
}

export default EmptypeHead;
