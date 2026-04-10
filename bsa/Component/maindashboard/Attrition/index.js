import { Box, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DropdownWithSearch } from "../../../input/inputcomponent";
import { useGetYearlyCompQuery } from "../../../redux/service/misDashboardService";
import CompAttrition from "../Attrition/CompanyAttrition";
import { useGetFinYrQuery } from "../../../redux/service/poData";
import Newjoin from "./Newjoin";
import FinYear from "../../../components/FinYear";
import LeftList from "./leftlist";
import Deptjoin from "./Deptjoin";
import DeptLeft from "./Deptleft";

const DetailedAttribution = ({
  companyName,
  Year,
  selectedmonth,
  autoFocusBuyer,
}) => {
  console.log(selectedmonth, "YearLast");

  const [filterBuyer, setfilterBuyer] = useState();
  const [selectedYear, setSelectedYear] = useState(Year);
  const [selectmonths, setSelectmonths] = useState("");

  const { data: result } = useGetYearlyCompQuery({ params: {} });

  const filterBuyer1 = result?.data.map((item) => item.customer);

  const chartData = Object.entries(filterBuyer1).map(([id, company]) => ({
    compname: company,
    id: company,
  }));
  useEffect(() => {
    setSelectmonths(selectedmonth || "");
  }, [selectedmonth]);

  useEffect(() => {
    setSelectmonths(selectedmonth);
  }, [companyName]);

  useEffect(() => {
    setfilterBuyer(companyName);
  }, [companyName]);

  const { data: finYr } = useGetFinYrQuery();

  const optionsArray = Object.values(chartData);

  useEffect(() => {}, [filterBuyer]);

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
          <Grid item md={7}>
            <Box sx={{ p: 0 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, textAlign: "start", mt: 0.5, ml: 1 }}
              >
                Overview of Attrition - {filterBuyer}
              </Typography>
            </Box>
          </Grid>

          <Grid item md={5}>
            <Grid container spacing={1}>
              <Grid item md={1}></Grid>
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
              <Grid item md={3} sx={{ mt: 0.5, borderRadius: 5 }}>
                <FinYear
                  selectedYear={selectedYear}
                  selectmonths={selectmonths}
                  setSelectmonths={setSelectmonths}
                  autoFocusBuyer={autoFocusBuyer}
                />
              </Grid>
              <Grid item md={4} sx={{ ml: 2 }}>
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
      </div>
      <Grid container spacing={1}>
        <Grid item xs={12} md={8}>
          <CompAttrition
            selectedYear1={selectedYear}
            companyName={filterBuyer}
            selectmonths={selectmonths}
            setSelectmonths={setSelectmonths}
          />
        </Grid>
        
        <Grid item md={4}>
          <Grid container spacing={1}>
            <Grid item md={12}>
              <Newjoin
                selectedYear1={selectedYear}
                companyName={filterBuyer}
                selectmonths={selectmonths}
                setSelectmonths={setSelectmonths}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <LeftList
                selectedYear1={selectedYear}
                companyName={filterBuyer}
                selectmonths={selectmonths}
                setSelectmonths={setSelectmonths}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={6}>
          <Deptjoin selectedYear1={selectedYear}
                companyName={filterBuyer}
                selectmonths={selectmonths}
                setSelectmonths={setSelectmonths} />
        </Grid>
        <Grid item md={6}>
          <DeptLeft selectedYear1={selectedYear}
                companyName={filterBuyer}
                selectmonths={selectmonths}
                setSelectmonths={setSelectmonths} />
        </Grid>
      </Grid>
    </>
  );
};
export default DetailedAttribution;
