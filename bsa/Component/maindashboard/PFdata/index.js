import { Avatar, Box, Grid, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { DropdownWithSearch } from "../../../input/inputcomponent";
import {
  useGetEsiPfQuery,
  useGetYearlyCompQuery,
} from "../../../redux/service/misDashboardService";
import { ColorContext } from "../../global/context/ColorContext";
import { useDispatch } from "react-redux";
import { useGetFinYrQuery } from "../../../redux/service/poData";
import { FaUsers, FaUserTie } from "react-icons/fa";
import DetailedPF from "./DetailedPF";
import MonthPF from "./MonthPF";
import DesignPF from "./DesignPF";
import EmployerPF from "./EmployerPF";
import AgePF from "./AgswisePF";
import FinYear from "../../../components/FinYear";
import CompPF from "./compPF";

const PFIndex = ({ companyName, Year, selectedmonth, autoFocusBuyer }) => {
  const { color } = useContext(ColorContext);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [filterBuyer, setfilterBuyer] = useState(companyName);
  const [selectedYear, setSelectedYear] = useState(Year);
  const [selectedState, setSelectedState] = useState("All");
  const [selectmonths, setSelectmonths] = useState("");

  const { data: result } = useGetYearlyCompQuery({ params: {} });

  const { data: PFyeardata1 } = useGetEsiPfQuery({
    params: {
      filterSupplier: filterBuyer,
      filterYear: selectedYear,
    },
  });

  const PFyeardata = PFyeardata1?.data || [];

  console.log(PFyeardata, "PFyeardata");

  const filterBuyer1 = result?.data?.map((item) => item.customer) || [];

  const chartData = Object.entries(filterBuyer1 || {}).map(([id, company]) => ({
    compname: company,
    id: company,
  }));

  useEffect(() => {
    setSelectmonths(selectedmonth || "");
  }, [selectedmonth, companyName]);

  // useEffect(() => {
  //   setSelectmonths(selectedmonth);
  // }, [filterBuyer]);
  useEffect(() => {
    setfilterBuyer(companyName);
  }, [companyName]);

  const optionsArray = Object.values(chartData);

  const handleFilterClick = (type) => {
    setSelectedState(type);
  };

  useEffect(() => {}, [filterBuyer]);

  const { data: finYr } = useGetFinYrQuery();

  const StatBox = ({ icon: Icon, value, label, color }) => (
    <Box
      sx={{
        p: 1,
        borderRadius: 3,
        background: "#DE5959",
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
          width: 50,
          height: 50,
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

  return (
    <>
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
                Overview of PF Contribution - {filterBuyer}
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

      <Grid container spacing={1}>
        <Grid item xs={12} md={4}>
          <MonthPF
            selectedYear1={selectedYear}
                companyName={filterBuyer}
                PFdata={PFyeardata}
                selectedState={selectedState}
                setSelectmonths={setSelectmonths}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EmployerPF
            selectedYear1={selectedYear}
                companyName={filterBuyer}
                PFdata={PFyeardata}
                selectedState={selectedState}
                setSelectmonths={setSelectmonths}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item md={12}>
              <CompPF
                selectedYear1={selectedYear}
                companyName={filterBuyer}
                PFdata={PFyeardata}
                selectedState={selectedState}
                setSelectmonths={setSelectmonths}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
              />
            </Grid>
            <Grid item md={12}>
              <AgePF
                selectedYear1={selectedYear}
                companyName={filterBuyer}
                PFdata={PFyeardata}
                selectedState={selectedState}
                setSelectmonths={setSelectmonths}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={12}>
          <DetailedPF
            selectedYear1={selectedYear}
                companyName={filterBuyer}
                PFdata={PFyeardata}
                selectedState={selectedState}
                setSelectmonths={setSelectmonths}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <DesignPF
            selectedYear1={selectedYear}
                companyName={filterBuyer}
                PFdata={PFyeardata}
                selectedState={selectedState}
                setSelectmonths={setSelectmonths}
                selectmonths={selectmonths}
                setSelectedState={setSelectedState}
          />
        </Grid>
      </Grid>
    </>
  );
};
export default PFIndex;
