import { Avatar, Box, Grid, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { DropdownWithSearch } from "../../../input/inputcomponent";
import {
  useGetEsiPfQuery,
  useGetHeadCountDetailQuery,
  useGetYearlyCompQuery,
} from "../../../redux/service/misDashboardService";
import { ColorContext } from "../../global/context/ColorContext";
import { useDispatch } from "react-redux";
import { useGetFinYrQuery } from "../../../redux/service/poData";
import { FaUsers, FaUserTie } from "react-icons/fa";
import DeptHeadCount from "./DeptHead";
import EmptypeHead from "./EmptypeHead";
import HeadcountDept from "./HeadCountDept";
import AgeHead from "./AgeHeadcount";
import BGhead from "./BloodwiseHead";
import DesgHead from "./desnhead";
import RegionHead from "./RegionHead";
import ExperienceHead from "./ExperienceHead";

const DetailedHeadcount = ({ companyName, Year }) => {
  const { color } = useContext(ColorContext);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [filterBuyer, setfilterBuyer] = useState(companyName);
  const [selectedYear, setSelectedYear] = useState(Year);
  const [selectedState, setSelectedState] = useState("");
  const [readOnly, setReadonly] = useState(false);

  const { data: result } = useGetYearlyCompQuery({ params: {} });

  const { data: HeadDetail } = useGetHeadCountDetailQuery({
    params: {
      compCode: filterBuyer, filterYear: selectedYear,
    },
  });

  const PFyeardata = HeadDetail?.data || [];

  console.log(PFyeardata, "PFyeardata");

  const filterBuyer1 = result?.data?.map((item) => item.customer) || [];

  const chartData = Object.entries(filterBuyer1 || {}).map(([id, company]) => ({
    compname: company,
    id: company,
  }));
  useEffect(() => {
    setfilterBuyer(companyName);
  }, [companyName]);

  const optionsArray = Object.values(chartData);

  const handleFilterClick = (type) => {
    setSelectedState(type);
  };

  useEffect(() => { }, [filterBuyer]);

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
        className=" mt-2"
        style={{
          position: "sticky",
          top: "30px", // set to height of tab list
          zIndex: 50,
          backgroundColor: "white",
          padding: 3
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
          <Grid item md={11}>
            <Box sx={{ p: 0, backgroundColor: "" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, textAlign: "start", mt: 0.5, ml: 1 }}
              >
                Overview of HeadCount -{filterBuyer}
              </Typography>
            </Box>
          </Grid>
          <Grid item md={1}>
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
      </div>
      <div className="p-3">
        <Grid item md={6}>
          <HeadcountDept
            companyName={filterBuyer}
            HeadData={PFyeardata}
            selectedState={selectedState}
          />
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={6} md={12}>
            <Grid container spacing={1}>

              <Grid item md={12}>
                <Grid container spacing={1}>
                  <Grid item md={4}>
                    <EmptypeHead
                      companyName={filterBuyer}
                      HeadData={PFyeardata}
                      selectedState={selectedState}
                    />
                  </Grid>
                  <Grid item md={4}>
                    <AgeHead
                      companyName={filterBuyer}
                      HeadData={PFyeardata}
                      selectedState={selectedState}
                    />
                  </Grid>
                  <Grid item md={4}>

                    <ExperienceHead
                      companyName={filterBuyer}
                      HeadData={PFyeardata}
                      selectedState={selectedState}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={12}>
            <DeptHeadCount
              selectedYear1={selectedYear}
              companyName={filterBuyer}
              HeadData={PFyeardata}
              selectedState={selectedState}
            />
          </Grid>
          <Grid md={12}>
            <DesgHead
              companyName={filterBuyer}
              HeadData={PFyeardata}
              selectedState={selectedState}
            />
          </Grid>
          <Grid item xs={6} md={12}>
            <BGhead
              companyName={filterBuyer}
              HeadData={PFyeardata}
              selectedState={selectedState}
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <RegionHead
              companyName={filterBuyer}
              HeadData={PFyeardata}
              selectedState={selectedState}
            />
          </Grid>
          {/* <Grid item xs={12} md={4}>
            <ExperienceHead
              companyName={filterBuyer}
              HeadData={PFyeardata}
              selectedState={selectedState}
            />
          </Grid> */}

        </Grid>
      </div>

    </>
  );
};
export default DetailedHeadcount;
