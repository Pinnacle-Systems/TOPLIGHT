// import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetMisDashboardEsiDetQuery } from "../../../redux/service/misDashboardService";
import { useState } from "react";
import EmptypeDetails from "../../../components/EmptypesalayDetails";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#B435E3",
  "#E35B5B",
];

const EmpType1 = ({
  companyName,
  selectedState,
  salary,
  selectmonths,
  selectedYear1,
  setSelectedState,
  setSelectmonths,
}) => {
  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
  const [filterBuyer, setFilterBuyer] = useState(companyName);

  const filteredData = Array.isArray(salary)
    ? salary
        .filter((row) => {
          if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
          if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
          return true;
        })
        .filter((row) => {
          if (!selectmonths) return true;
          return row.PAYPERIOD === selectmonths;
        })
    : [];

  const totalsByComp = filteredData.reduce((acc, emp) => {
    const code = emp.EMPTYPE || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.NETPAY || 0);
    return acc;
  }, {});

  const Chartdata = Object.entries(totalsByComp).map(
    ([emptype, netpay], index) => ({
      Emptype: emptype,
      Netpay: netpay,
      color: COLORS[index % COLORS.length],
    })
  );

  const handlePieClick = (data, index) => {
    setSearch((prev) => ({
      ...prev,
      EMPTYPE: data.Emptype,
    }));
    setShowTable(true);
  };

  return (
    <Card
      sx={{
        backgroundColor: "#f5f5f5",
        height: 337,
        mt: 2,
        ml: 1,

        // mx:1
      }}
    >
      <CardHeader
        title="Employee Type wise "
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      />

      <CardContent>
        <Box sx={{ display: "", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 200, height: 200}}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={Chartdata}
                  dataKey="Netpay"
                  nameKey="Emptype"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  onClick={(data, index) => handlePieClick(data, index)}
                >
                  {Chartdata.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    `₹ ${value.toLocaleString("en-IN")}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 1,
                    border: "1px solid #ccc",
                    padding:"5px",
                    fontSize:"10px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ ml: 5, mt: 2 }}>
            {Chartdata.map((item, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    mr: 1.5,
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: "11px" }}>
                  <strong>{item.Netpay.toLocaleString("en-IN")}</strong> —{" "}
                  {item.Emptype}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
      {showTable && (
        <EmptypeDetails
          selectedBuyer={[filterBuyer]}
          closeTable={() => setShowTable(false)}
          setSearch={setSearch}
          search={search}
          salary={salary}
          selectedState={selectedState}
          selectmonths={selectmonths}
          selectedYear={selectedYear1}
          setSelectmonths={setSelectmonths}
          setSelectedState={setSelectedState}
          autoFocusBuyer={true}
          // selectGender1={selectGender}
        />
      )}
    </Card>
  );
};

export default EmpType1;
