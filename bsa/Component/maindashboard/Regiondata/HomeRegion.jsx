import { params } from "node-oracledb/src/execObj.lib";
import { useGetRegioncountQuery } from "../../../redux/service/misDashboardService";
import { Card, CardHeader, IconButton } from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Highcharts3D from "highcharts/highcharts-3d";
import DotsVertical from "mdi-material-ui/DotsVertical";


Highcharts3D(Highcharts);

const HomeRegion = () => {
  const { data: regiondata } = useGetRegioncountQuery({ params: {} });

  // console.log(regiondata, "regiondata");

  const groupeddata = regiondata?.data.reduce((acc, item) => {
    if (!acc[item.customer]) {
      acc[item.customer] = [];
    }
    acc[item.customer].push(item);
    return acc;
  }, {});

  console.log(regiondata,"regiondata");
  

  const years = Object.keys(groupeddata || {});
  const categories = [
    ...new Set(regiondata?.data.map((order) => order.customer)),
  ];
  const series = [
    {
      name: "Tamil Nadu",
      data: categories.map((c) => groupeddata[c][0]?.tn_total ?? 0),
    },
    {
      name: "Non Tamil Nadu",
      data: categories.map((c) => groupeddata[c][0]?.non_total ?? 0),
    },
  ];

  const options = {
    chart: {
      type: "column",
      height: 320,
      options3d: {
        enabled: true,
        alpha: 10,
        beta: 10,
        depth: 40,
        viewDistance: 30,
      },
      backgroundColor: "#FFFFFF",
      marginBottom: 100,
    },
    title: null,
    xAxis: {
      categories,
      title: {
        text: "Company",
        style: {
          color: "#374151",
          fontSize: "12px",
          fontWeight: "bold",
        },
      },
      labels: {
        style: { color: "#6B7280", fontSize: "10px" },
        rotation: -45,
        align: "right",
        overflow: "justify",
        step: 1,
        padding: 10,
      },
      tickInterval: 1,
    },
    yAxis: {
      title: {
        text: "Number of Employees",
        style: {
          fontSize: "12px",
          color: "#374151",
          fontWeight: "bold",
        },
      },
      labels: {
        style: { fontSize: "10px", color: "#9CA3AF" },
      },
    },
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: "#FFFFFF",
      borderColor: "#D1D5DB",
      shadow: true,
      style: { color: "#374151", fontSize: "10px" },
      formatter: function () {
        return `<b>${this.x}</b><br/>
                    ${this.points
                      .map(
                        (point) =>
                          `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.y}</b><br/>`
                      )
                      .join("")}`;
      },
    },
    plotOptions: {
      column: {
        stacking: "normal",
        depth: 40,
        pointWidth: 15,
        borderRadius: 5,
      },
    },
    legend: {
      align: "center",
      verticalAlign: "top",
      layout: "horizontal",
      itemStyle: { color: "#374151", fontSize: "10px", fontWeight: "500" },
    },
    series,
  };

  return (
    <>
      <Card sx={ {borderRadius: 3,
          boxShadow: 4,
          width: "100%",
          maxWidth: 1000,
          mx: 1,}}>
          <CardHeader
          title="Region Wise HeadCount"
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
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Card>
    </>
  );
};

export default HomeRegion;
