// ** MUI Imports
import Grid from "@mui/material/Grid";

// ** Icons Imports
import CurrencyUsd from "mdi-material-ui/CurrencyUsd";
// import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import HelpCircleOutline from "mdi-material-ui/HelpCircleOutline";
import BriefcaseVariantOutline from "mdi-material-ui/BriefcaseVariantOutline";

// ** Custom Components Imports
import CardStatisticsVerticalComponent from "../../components/CardStatsVertical.js";

// ** Styled Component Import
import ApexChartWrapper from "../../components/ApexChartWrapper.js";
import YearlyComChart from "../MisDashboard/comParision/YearlyCompChart.jsx";
import SalaryDet from "./EmployeeDetail/SalaryDet.js";

// ** Demo Components Imports
import Table from "../../scenes/maindashboard/Table.js";
import Trophy from "../../scenes/maindashboard/Trophy.js";
// import TotalEarning from '../../scenes/maindashboard/TotalEarning.js'
import StatisticsCard from "../../scenes/maindashboard/StatisticsCard.js";
import WeeklyOverview from "../maindashboard/WeeklyOverview.js";
import DepositWithdraw from "../../scenes/maindashboard/DepositWithdraw.js";
import { Poll } from "@mui/icons-material";
import DashboardHeader from "./DashboardHeader.js";
// import LeaveDetailsCard from './EmployeeDetail/LeaveDetailsCard.js'

// import SalesByCountries from 'src/views/dashboard/SalesByCountries'
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PfData from "../MisDashboard/PfData/EsiPf.jsx";
import HeadCount from "./Headcount/HeadCount.jsx";
import HomeAttrition from "./Attrition/HomeAttrition.jsx";
// import HomeESI from './EmployeeDetail/ESI Det.js'
import HomePF from "./PFdata/HomePF.jsx";
import HomeESI from "./ESIdata/ESI Det.js";
import HomeRegion from "./Regiondata/HomeRegion.jsx";
import HomeSalary from "./salarydata/Homesalary.jsx";
import HomeOTWages from "./OTWages/HomeOT.jsx";
import { useGetuserpagesQuery } from "../../redux/service/Rolemaster.js";
import { getCommonParams } from "../../utils/hleper.js";
// import CompanywiseEsi from "./DetailedDashboard/companywiseEsi.js";



const Main_Dashboad = () => {
  const params = getCommonParams();
  const { userId } = params;
  const { data: allPages } = useGetuserpagesQuery(
    { params: { userId } },
  );
  const usernames = [...new Set(allPages?.map(item => item.username))]
  .join(", ");
  console.log(allPages, "allPages");
  console.log(usernames, "checkingname");
  return (
    <div  className="w-full  mx-auto rounded-md shadow-lg py-1 overflow-y-auto">
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <DashboardHeader usernames={usernames}/>
        </Grid>
        <Grid item xs={12} md={4}>
          <Trophy />
        </Grid>
        <Grid item xs={12} md={8}>
          <StatisticsCard />
        </Grid>
      <Grid container spacing={1} sx={{mt:1,ml:1}}>
        <Grid item xs={12} md={3}>
          <CardStatisticsVerticalComponent
            stats="$78"
            title="Revenue"
            trend="negative"
            color="secondary"
            trendNumber="-15%"
            subtitle="Past Month"
            icon={<CurrencyUsd />}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <CardStatisticsVerticalComponent
            stats="$25.6k"
            icon={<ReceiptLongIcon />}
            color="success"
            trendNumber="+42%"
            title="Expense"
            subtitle="Weekly Profit"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <CardStatisticsVerticalComponent
            stats="$25.6k"
            icon={<Poll />}
            color="primary"
            trendNumber="+42%"
            title="Sales"
            subtitle="Weekly Profit"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <CardStatisticsVerticalComponent
            stats="$25.6k"
            icon={<Poll />}
            color="warning"
            trendNumber="+42%"
            title="Orders"
            subtitle="Weekly Profit"
          />
        </Grid>

      </Grid>
        
        <Grid item xs={12} md={7}>
          <HomeSalary/>
        </Grid>

        <Grid item xs={12} md={5}>
          <HomeESI />
        </Grid>
        <Grid item xs={12} md={4} >
           <HomePF />
        </Grid>
        <Grid item xs={12} md={4}>
          <HeadCount />
        </Grid>
        <Grid item xs={12} md={4}>
          <HomeAttrition />
        </Grid>
        <Grid item xs={12} md={6} >
          {/* <HomeRegion /> */}
        </Grid>

        <Grid item xs={12} md={6} >
          {/* <Table /> */}
            {/* <HomeOTWages/> */}
        </Grid>
      </Grid>
    </div>
  );
};

export default Main_Dashboad;
