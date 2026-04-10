import { useState } from "react";
import {
  useGetAgewiseEsiQuery,
  useGetEsiPf1Query,
} from "../../../redux/service/misDashboardService";
import { useEffect } from "react";
import { Box, Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Chart from "react-apexcharts";
import EsiDetail from "../../../components/EsiDet";
import AgewiseESIlDetail from "../../../components/AgeESIdetail";
import Highcharts from "highcharts";
import AgewisePFlDetail from "../../../components/PF detail/AgeDetailPF";

const AgePF = ({
  companyName,
  selectedYear1,
  setSelectmonths,
  selectmonths,
  setSelectedState,
  selectedState,
  PFdata,
}) => {
  console.log(PFdata, "PFdata");

  const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);

  const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [filterBuyer, setFilterBuyer] = useState(companyName);

  const { data: salaryDet1, isLoading } = useGetAgewiseEsiQuery({
    params: {
      filterBuyer: filterBuyer,
      filterYear: selectedYear,
    },
  });

  console.log(salaryDet1, "ESIsalaryDet21");

  const ESIdata = salaryDet1?.data || [];

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  useEffect(() => {
    setSelectedYear(selectedYear1);
  }, [selectedYear1]);
  const filteredData = Array.isArray(ESIdata)
    ? ESIdata.filter((row) => {
        if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
        if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
        return true;
      }).filter((row) => {
        if (!selectmonths) return true;
        return row.PAYPERIOD === selectmonths;
      })
    : [];

  const groupdata = filteredData?.reduce((acc, emp) => {
    const code = emp.SLAP || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.TOTAL_PF || 0);
    return acc;
  }, {});
  console.log(filteredData, "groupdata12");

  const Chartdata = Object.entries(groupdata).map(([x, y]) => ({
    slap: x,
    esi: y,
  }));

  console.log(Chartdata, "ESIyeardata");
  const pfData = Chartdata?.map((item) => item.esi);
  const headCount = Chartdata?.map((item) => item.slap);

  // const options = {
  //   series: pfData,
  //   options: {
  //     chart: {

  //       type: "pie",
  //        height: 100,
  //        width: "100%",
  //       events: {
  //         dataPointSelection: (event, chartContext, config) => {
  //           const index = config.dataPointIndex;
  //           const value = pfData[index];
  //           const label = headCount[index];

  //           setSearch((prev) => ({
  //             ...prev,
  //             AGE: label,
  //           }));
  //           setShowTable(true);

  //         },
  //       },
  //     },
  //     labels: headCount,
  //     legend: {
  //       position: "right",
  //       fontSize: "14px",
  //       itemMargin: {
  //         horizontal: 10, // spacing width
  //         vertical: 4, // spacing height
  //       },
  //       markers: {
  //         width: 14,
  //         height: 14,
  //       },
  //     },
  //     dataLabels: {
  //       style: {
  //         fontSize: "10px",
  //       },
  //     },
  //     // responsive: [
  //     //   {
  //     //     breakpoint: 480,
  //     //     options: {
  //     //       chart: {
  //     //         width: 200,
  //     //       },
  //     //       legend: {
  //     //         position: "bottom",
  //     //       },
  //     //     },
  //     //   },
  //     // ],
  //   },
  // };
  const options = {
    chart: {
      type: "pie",
      height: 200,
      backgroundColor: "#f5f5f5",
    },
    title: {
      text: null,
    },

    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25cf</span> ' +
        "{point.name}: <b>{point.percentage:.1f}%</b>",
    },

    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },

    plotOptions: {
      pie: {
        allowPointSelect: true,
        borderWidth: 2,
        cursor: "pointer",

         dataLabels: {
        enabled: true,
        // format: "<b>{point.name}</b><br>",
        // distance: 20,
        formatter: function () {
    return `<b>${this.point.name}</b></br>${this.y.toLocaleString("en-IN")}`; 
  }
      },

        point: {
          events: {
            click: function () {
              console.log("Clicked:", this.name, this.y);

              setSearch((prev) => ({
                ...prev,
                AGE: this.name,
              }));

              setShowTable(true);
            },
          },
        },
      },
    },

    series: [
      {
        animation: {
          duration: 2000,
        },
        colorByPoint: true,
        data: Chartdata?.map((item) => ({
          name: item.slap,
          y: item.esi,
        })),
      },
    ],
  };

  return (
    <>
      <Card
        sx={{
          backgroundColor: "#f5f5f5",
          // borderRadius: 3,
          // boxShadow: 4,
          
        }}
      >
        <CardHeader
          title="Age wise PF "
          titleTypographyProps={{
            sx: { fontSize: ".9rem", fontWeight: 600 },
          }}
          sx={{
            p: 1,
            borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          }}
        />
        <Box>
          <HighchartsReact highcharts={Highcharts} options={options} />
          {/* <Chart options={options.options} series={options.series} type="pie" height={150} /> */}
        </Box>
        {showTable && (
          <AgewisePFlDetail
            selectedYear={selectedYear1}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            PFdata={PFdata}
            selectedState={selectedState}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            setSelectmonths={setSelectmonths}
            autoFocusBuyer={true}
          />
        )}
      </Card>
    </>
  );
};

export default AgePF;
