

import { Avatar, Box, Grid, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { DropdownWithSearch } from "../../../input/inputcomponent";
import {
  useGetYearlyCompQuery,
  useGetsalarydelQuery,
} from "../../../redux/service/misDashboardService";
import { ColorContext } from "../../global/context/ColorContext";
import FinYear from "../../../components/FinYear";
import EmpType1 from "./Emptypesal";
import AgeSalary from "./AgewiseSalary";
import OTwagessalary from "./OTWagesSalary";
import SunburstChart from "./detailedSalary";
import DesignationSalary from "./DesignationSalary";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { useGetFinYrQuery } from "../../../redux/service/poData";
import Monthsalary from "./monthsal";

const SalaryIndex = ({ companyName, Year, selectedmonth, autoFocusBuyer }) => {
  const { color } = useContext(ColorContext);
  const theme = useTheme();

  const [selectedState, setSelectedState] = useState("All");
  const [filterBuyer, setfilterBuyer] = useState(companyName);
  const [selectedYear, setSelectedYear] = useState(Year);
  const [selectmonths, setSelectmonths] = useState("");

  
  const { data: result } = useGetYearlyCompQuery({ params: {} });
  const { data: detail } = useGetsalarydelQuery({
    params: {
      filterSupplier: filterBuyer,
      filterYear: selectedYear,
    },
  });
  const { data: finYr } = useGetFinYrQuery();
  const SalaryData = detail?.data || [];

  useEffect(() => {
    setSelectmonths(selectedmonth || "");
  }, [selectedmonth]);

  useEffect(() => {
    setSelectmonths(selectedmonth);
  }, [companyName]);

  useEffect(() => {
    setfilterBuyer(companyName);
  }, [companyName]);

  const filterBuyerList = result?.data?.map((item) => item.customer) || [];
  const chartData = filterBuyerList.map((company) => ({
    compname: company,
    id: company,
  }));

  const handleFilterClick = (type) => {
    setSelectedState(type);
  };

  return (
    <>
      {/* Header and Filters */}
      <div
        className="mt-2"
        style={{
          position: "sticky",
          top: 30,
          zIndex: 50,
          backgroundColor: "white",
        }}
      >
        <Grid
          container
          spacing={0}
          sx={{
            backgroundColor: "white",
            color: "black",
            p: 0.5,
            borderBottom: "1px solid #afafaf",
            borderTop: "1px solid #afafaf",
          }}
        >
          <Grid item md={5}>
            <Box sx={{ p: 0 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, textAlign: "start", mt: 0.5, ml: 1 }}
              >
                Overview of Salary Distribution - {filterBuyer}
              </Typography>
            </Box>
          </Grid>

          <Grid item md={7}>
            <Grid container spacing={1}>
              <Grid item md={6}>
                <Grid container spacing={1}>
                  <Grid item md={4}>
                    <button
                      onClick={() => handleFilterClick("Labour")}
                      className={`flex items-center gap-2 px-5 py-2 text-[11px] font-semibold rounded-full shadow-md transition-all ${
                        selectedState === "Labour"
                          ? "bg-blue-600 text-white scale-105"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaUserTie size={14} /> Employees
                    </button>
                  </Grid>
                  <Grid item md={4}>
                    <button
                      onClick={() => handleFilterClick("Staff")}
                      className={`flex items-center gap-2 px-5 py-2 ml-6 text-xs font-semibold rounded-full shadow-md transition-all ${
                        selectedState === "Staff"
                          ? "bg-blue-600 text-white scale-105"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaUsers size={16} /> Staff
                    </button>
                  </Grid>
                  <Grid item md={4}>
                    <button
                      onClick={() => handleFilterClick("All")}
                      className={`flex items-center gap-2 px-5 py-2 ml-4 text-xs font-semibold rounded-full shadow-md transition-all ${
                        selectedState === "All"
                          ? "bg-blue-600 text-white scale-105"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaUsers size={16} /> All
                    </button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item md={6}>
                <Grid container spacing={1}>
                  <Grid item md={3}>
                    <DropdownWithSearch
                      options={finYr?.data || []}
                      labelField={"finYr"}
                      label={""}
                      value={selectedYear}
                      setValue={setSelectedYear}
                      className="mt-1"
                    />
                  </Grid>
                  <Grid item md={5} sx={{ mt: 0.5, borderRadius: 5 }}>
                    <FinYear
                      selectedYear={selectedYear}
                      selectmonths={selectmonths}
                      setSelectmonths={setSelectmonths}
                      autoFocusBuyer={autoFocusBuyer}
                    />
                  </Grid>
                  <Grid item md={4}>
                    <DropdownWithSearch
                      options={chartData || []}
                      labelField={"compname"}
                      label={""}
                      value={filterBuyer}
                      setValue={setfilterBuyer}
                      className="mt-1"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>

      {/* Child components */}
      <Grid container spacing={1}>
        <Grid item md={6}>
          <Grid container spacing={1}>
            <Grid item md={5}>
              <EmpType1
                selectedYear1={selectedYear}
                companyName={filterBuyer}
                selectedState={selectedState}
                salary={SalaryData}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
                setSelectmonths={setSelectmonths}
              />
            </Grid>
            <Grid item md={7}>
              <AgeSalary
                selectedYear1={selectedYear}
                companyName={filterBuyer}
                selectedState={selectedState}
                salaryDet={SalaryData}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
                setSelectmonths={setSelectmonths}
              />
            </Grid>
          </Grid>
        </Grid>
      
        <Grid item xs={12} md={6}>
          <Monthsalary selectedYear1={selectedYear}
            companyName={filterBuyer}
            selectedState={selectedState}
            salaryDet={SalaryData}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}/>
          
           
        </Grid>
        <Grid item xs={12} md={8}>
         <SunburstChart
            selectedYear1={selectedYear}
            companyName={filterBuyer}
            selectedState={selectedState}
            salaryDet={SalaryData}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          {/* <Monthsalary selectedYear1={selectedYear}
            companyName={filterBuyer}
            selectedState={selectedState}
            salaryDet={SalaryData}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}/> */}
            <OTwagessalary
            selectedYear1={selectedYear}
            companyName={filterBuyer}
            selectedState={selectedState}
            // salaryDet={SalaryData}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <DesignationSalary
            selectedYear1={selectedYear}
            companyName={filterBuyer}
            selectedState={selectedState}
            salaryDet={SalaryData}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default SalaryIndex;
