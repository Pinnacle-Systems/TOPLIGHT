import {
  Card,
  CardHeader,
  CircularProgress,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useGetEPFlastmonthQuery } from "../../../redux/service/misDashboardService";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { Box } from "@mui/material";
import DotsVertical from "mdi-material-ui/DotsVertical";

Highcharts3D(Highcharts);

const HomePF = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { data: pfdata  ,isLoading, isError} = useGetEPFlastmonthQuery();

  if (isLoading) return <CircularProgress />;
    if (isError) return <div>Error loading data</div>;
    if (!pfdata?.data?.length) return <div>No data found</div>;
  
    const chartData1 = pfdata.data.map((e) => e.customer);
  
    // const month = ESIdata.data[0]?.month;
    // const year = pfdata.data.map((e) => e.Year);
  
    const colors = chartData1.map(
      () => "#" + Math.floor(Math.random() * 16777215).toString(16)
    );
    const year = pfdata?.data.map((item) => item.Year);
  
    // const formattedData = pfdata.data.map((item, i) => ({
    //   name: item.customer,
    //   y: item.pf,
    //   color: colors[i],
    //   headCount: item.headCount,
    //   Year: year[i],
    //   month:item.month
      
    // }));

  // console.log(pfdata, "PFdata");

  const totalvalue = pfdata?.data.map((item) => item.pf);
  const headcount = totalvalue?.reduce((sum, val) => sum + val, 0);

  const options = {
    chart: {
      type: "pie",
      options3d: {
        enabled: true,
        alpha: 40,
      },
      backgroundColor: "#FFFFFF",
   
      height: 265,
      borderRadius: 10,
      margin: [0, 0, 0, 0],
    },
    title: {
      text: "",
      align: "left",
      style: {
        color: "#000000",
        fontWeight: "normal",
      },
    },
    subtitle: {
      text: "",
      align: "left",
      style: {
        color: "#000000",
        fontWeight: "normal",
      },
    },
    plotOptions: {
      pie: {
        innerSize: 100,
        depth: 60,
         center: ["50%", "50%"],
         size: "100%",

        dataLabels: {
          distance:-5,
          formatter: function () {
            return `${this.point.name}`;
          },
          style: {
            color: "#000000",
            fontWeight: "normal",
          },
        },

        point: {
          events: {
            click: function () {
              const companyName = this.name;
              const Year = this.Year;
              console.log("Clicked:", companyName, Year);

              dispatch(
                push({
                  id: "PFDetails",
                  name: "PFDetails",
                  component: "PFIndex",
                  data: { companyName, Year,autoFocusBuyer: true,selectedmonth:this.month },
                })
              );
            },
          },
        },
      },
    },
    tooltip: {
      style: {
        color: "#374151",
        fontSize: "10px",
      },
      headerFormat: "<b> {point.key}</b><br/>",
      pointFormatter: function () {
        return `
                    <span style="color:${this.color}">\u25CF</span>
                    <span style="color: #2d2d2d;"> PF Amount: <b>${this.y.toLocaleString('en-IN')}</b></span><br/>
                    <span style="color: #2d2d2d;"> headCount: <b>${this.count.toLocaleString('en-IN')}</b></span><br/>
                    <span style="color: #2d2d2d;"> headCount: <b>${this.month}</b></span><br/>
                `;
      },
    },
    series: [
      {
        name: "PF Amount",
        data: pfdata?.data.map((item, index) => ({
          name: item.customer,
          y: item.pf,
          count: item.headCount,
          Year: year[index],
          month:item.month
        })),
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <>
      <Card
        sx={{
          // m:1,
          borderRadius: 3,
          boxShadow: 4,
          width: "100%",
          maxWidth: 1000,
          ml: 1,
        }}
      >
        <CardHeader
          title="PF contribution"
          titleTypographyProps={{
            sx: { fontSize: "1rem", fontWeight: 600 },
          }}
          action={
            <IconButton
              size="small"
              aria-label="settings"
              sx={{ color: "text.secondary" }}
            >
              <DotsVertical />
            </IconButton>
          }
          sx={{
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />
        <Box>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </Box>
        <Box
          sx={{
            m: 1,
            p: 1,
            // mb: 2,
            bgcolor: "background.default",
            borderRadius: 3,
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            OverAll Contribution : {headcount?.toLocaleString('en-IN')}
          </Typography>
        </Box>
      </Card>
    </>
  );
};

export default HomePF;
