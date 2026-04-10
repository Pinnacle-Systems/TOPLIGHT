import { Card, CardHeader } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState } from "react";
import PfDetail from "../../../components/PfDet";
import Highcharts from "highcharts";
import PFDetailedCom from "../../../components/PF detail/pfDetail";
import PFShareDetailed from "../../../components/PF detail/EmployerpfDEt";

const MonthPF=({ companyName, selectedYear1, PFdata, selectedState,setSelectedState,setSelectmonths,selectmonths })=>{
const [search, setSearch] = useState({
    FNAME: "",
    GENDER: "",
    MIDCARD: "",
    DEPARTMENT: "",
    COMPCODE: "",
  });
  const [showTable, setShowTable] = useState(false);
let excelTitle = "PF Employee Contribution Report"

  // const [selectedYear, setSelectedYear] = useState(selectedYear1);
  const [filterBuyer, setFilterBuyer] = useState(companyName);

  //     const { data: PFyeardata } = useGetEsiPfQuery(
  //         {params: {
  //             filterSupplier: filterBuyer ,
  //             filterYear: selectedYear ,
  //         }},

  //     );
  //     console.log(PFyeardata, "PFyeardata")
  //    const pfData = PFyeardata?.data.map((item) => item.esi);
  //     const headCount = PFyeardata?.data.map((item) => item.headCount);

  useEffect(() => {
    setFilterBuyer(companyName);
  }, [companyName]);

  
  // useEffect(() => {
  //   setSelectedYear(selectedYear1);
  // }, [selectedYear1]);

  const filteredData = Array.isArray(PFdata)
    ? PFdata.filter((row) => {
        if (selectedState === "Labour") return row?.PAYCAT !== "STAFF";
        if (selectedState === "Staff") return row?.PAYCAT === "STAFF";
        return true;
      })
    : [];

  const groupdata = filteredData?.reduce((acc, emp) => {
    const code = emp.PAYPERIOD || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.PF || 0);

    return acc;
  }, {});

  const Chartdata = Object.entries(groupdata).map(([x, y]) => ({
    month: x,
    pf: y,
    // percent: ((y / totalNetPay) * 100).toFixed(2),
    // color:getRandomColor()
  }));
  const pfData = Chartdata?.map((item) => item.pf);
  const Month = Chartdata?.map((item) => item.month);

const option= {
    chart: {
        type: 'area',
        height:420,
        marginLeft:70,
        marginBottom:100,
        backgroundColor: "#f5f5f5",
    },
    title: {
        text: null
    },
    xAxis: {
        categories: Month,  
        title: { text:"month" ,style:{fontSize: "9px"}},
        labels: {
        style: { fontSize: "10px"},
      },
        allowDecimals: false
    },
    yAxis: {
        title: {
            text: 'Amount(PF)',
            style:{fontSize: "10px"}
        },
        labels: {
        style: { fontSize: "10px"},
      },
    },
    tooltip: {
        shared: true,
      useHTML: true,
      style: { fontSize: "10px" },
      formatter: function () {
        let index = this.points[0].point.index;
        
        let pf = pfData[index];
        let monthName = this.x;

        return `<b>Month:</b> ${monthName} <br/>
                        <b>PF Value:</b> ${pf.toLocaleString('en-IN')} <br/>
                        `;
      },
        // pointFormat: 'PF: <b>{point.y}</b><br/>Month: <b>{point.category}</b>'
    },
    plotOptions: {
        area: {
            marker: {
                enabled: true,
                radius: 3
            }
        },
series: {
      cursor: "pointer",
      point: {
        events: {
          click: function () {
            setSelectmonths(this.category)
            setShowTable(true)
          },
        },
      },
    }
    },
    legend: {
        enabled:false,
      itemStyle: { fontSize: "11px" },
    },
    series: [{
        name: 'Amount(PF)',
        data: pfData               
    }]
}

return<>
<Card
        sx={{
          mt: 2,
          ml: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
         <CardHeader
                title="Employee Contribution "
                titleTypographyProps={{
                  sx: { fontSize: ".9rem", fontWeight: 600 },
                }}
                sx={{
                  p: 1,
                  borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
                }}
              />
        <HighchartsReact highcharts={Highcharts} options={option} />

         {showTable && (
          <PFShareDetailed
            selectedYear={selectedYear1}
            selectedBuyer={[filterBuyer]}
            closeTable={() => setShowTable(false)}
            setSearch={setSearch}
            search={search}
            setSelectmonths={setSelectmonths}
            selectmonths={selectmonths}
            setSelectedState={setSelectedState}
            selectedState={selectedState}
            autoFocusBuyer={true}
             PFdata={PFdata} excelTitle={excelTitle}
          />
        )}
      </Card>

</>

} 
export default MonthPF