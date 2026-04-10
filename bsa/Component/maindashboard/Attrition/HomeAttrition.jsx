import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useContext } from "react";
import { Card, CardHeader } from "@mui/material";
import { ColorContext } from "../../global/context/ColorContext";
import {
  useGetLastAttrQuery,
  useGetYFActVsPlnQuery,
} from "../../../redux/service/orderManagement";

import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";

const HomeAttrition = () => {
  const dispatch = useDispatch();

 const { data: fabPlVsActFull } = useGetYFActVsPlnQuery({
    params: {},
  });

  const { data: LastAttrition } = useGetLastAttrQuery({
    params: {},
  });
  // console.log(LastAttrition, "LastAttrition");

  const sumByCompany = (fabPlVsActFull?.data || []).reduce((acc, item) => {
    acc[item.company] = (acc[item.company] || 0) + item.attrition;
    return acc;
  }, {});
  // console.log(sumByCompany, "sumByCompany");

  const chartData = Object.entries(sumByCompany).map(([company, total]) => ({
    name: company,
    value: total,
  }));

  const categories = chartData?.map((item) => item.name);
  const seriesData = chartData?.map((item) => item.value);

  const options = {
    chart: {
      scrollablePlotArea: { minWidth: 300 },
      marginTop: 10,
      type: "line",
      height: 310,
      borderRadius: 10,
    },

    xAxis: {
      categories: LastAttrition?.data.map(item => item.company),
      
      title: { text: "Company", style: { fontSize: "10px" } },
      labels: { style: { fontSize: "10px" } },
    },

    yAxis: {
      min: 0,
      title: { text: "Attrition Count", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
    },

    tooltip: {
      shared: true,
      style: { fontSize: "10px" },
      formatter: function () {
        return `<b>${this.point.month}</b></br>
        <b>Attrition:${this.point.y}</b>`
      },
    },

    plotOptions: {
      series: {
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
        },
        point: {
          events: {
            click: function () {
              const companyName = this.category;
              const companyName1 = this.month;

              // console.log("Clicked:", companyName1);

              dispatch(
                push({
                  id: "Attrition",
                  name: "Attrition",
                  component: "DetailedAttribution",
                  data: { companyName,Year:this.year,selectedmonth:this.month ,autoFocusBuyer:true},
                })
              );
            },
          },
        },
      },
    },

    title: null,

    series: [
      {
        name: "Attrition",
        data: LastAttrition?.data.map((item, index) => ({
          name: item.company,
          y: item.attrition,
          year: item.finyr,
          month: item.payPeriod,
        })),

        color: "#FF0000",
        marker: {
          fillColor: "#FF0000",
          lineWidth: 2,
          lineColor: "#000000",
        },
      },
    ],
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 4,
      }}
    >
      <CardHeader
        title="Attrition Breakup"
        titleTypographyProps={{
            sx: { fontSize: "1rem", fontWeight: 600 },
          }}
          // action={
          //   <IconButton
          //     size="small"
          //     aria-label="settings"
          //     sx={{ color: "text.secondary" }}
          //   >
          //     <DotsVertical />
          //   </IconButton>
          // }
          sx={{
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
      />

      <div style={{ height: "320px" }}>
        <HighchartsReact
          highcharts={Highcharts} // FIXED ✔
          options={options}
        />
      </div>
    </Card>
  );
};

export default HomeAttrition;
