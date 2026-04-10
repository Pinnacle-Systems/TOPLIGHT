// import React, { useEffect } from 'react';
// import * as am4core from '@amcharts/amcharts4/core';
// import * as am4charts from '@amcharts/amcharts4/charts';
// import am4themes_animated from '@amcharts/amcharts4/themes/animated';
// const SortedBarChart1 = ({ topItems,setSearch ,setShowTable}) => {

//     // console.log(topItems,"topItems");

//     useEffect(() => {
//         am4core.useTheme(am4themes_animated);

//         let chart = am4core.create("sidechartdiv", am4charts.XYChart3D);
//         chart.logo.disabled = true;

//         chart.depth3D = 10;
//         chart.angle = 5;

//         let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
//         categoryAxis.renderer.grid.template.location = 0;
//         categoryAxis.dataFields.category = "Department";
//         categoryAxis.renderer.minGridDistance = 1;
//         categoryAxis.renderer.inversed = true;
//         categoryAxis.renderer.grid.template.disabled = true;
//         categoryAxis.renderer.labels.template.fontSize = 10;
//         categoryAxis.renderer.labels.template.fill = am4core.color("#666");
//         categoryAxis.renderer.labels.template.maxWidth = 100;
//         categoryAxis.renderer.labels.template.truncate = true;
//         categoryAxis.title.text = "Department";
//         categoryAxis.title.fontWeight = 600;
//         categoryAxis.title.fontSize = 12;
//         categoryAxis.title.fill = am4core.color("#333");

//         let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
//         valueAxis.max = Math.max(...topItems.map(i => parseFloat(i.Netpay)));
//         valueAxis.renderer.labels.template.fontSize = 10;
//         valueAxis.renderer.labels.template.fill = am4core.color("#666");
//         valueAxis.title.text = "Amount";
//         // valueAxis.title.paddingTop = 10;
//         valueAxis.title.fontWeight = 600;
//         valueAxis.title.fontSize = 12;
//         valueAxis.title.fill = am4core.color("#333");

//         let series = chart.series.push(new am4charts.ColumnSeries3D());
//         series.dataFields.categoryY = "Department";
//         series.dataFields.valueX = "Netpay";
//         series.columns.template.strokeOpacity = 0;
//         series.columns.template.column.cornerRadiusBottomRight = 10;
//         series.columns.template.column.cornerRadiusTopRight = 10;
//         series.columns.template.tooltipText = "{categoryY}: {valueX}";

//         series.columns.template.events.on("hit", function (ev) {
//     const data = ev.target.dataItem.dataContext;
//     // console.log("Clicked item:", data);

//     // Example: show alert or call parent function
//     // alert(`Department: ${data.Department}\nNetpay: ${data.Netpay}`);

//     setSearch((prev) => ({
//                 ...prev,
//                 DEPARTMENT: data.Department,
//               }));
//               setShowTable(true);

//     // You can also navigate or call API here
//     // props.onBarClick(data);
// });

//         series.tooltip.getFillFromObject = false;
//         series.tooltip.label.fontSize = 10;
//         series.tooltip.label.fill = am4core.color("#333333");

//         let labelBullet = series.bullets.push(new am4charts.LabelBullet());
//         labelBullet.label.horizontalCenter = "left";
//         labelBullet.label.verticalCenter = "middle";
//         labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#')}";
//         labelBullet.locationX = 1;
//         labelBullet.dx = 5;
//         labelBullet.label.fontSize = 12;
//         labelBullet.label.fill = am4core.color("#333");
// labelBullet.label.adapter.add("text", function (text, target) {
//   if (target.dataItem && target.dataItem.valueX !== undefined) {
//     return target.dataItem.valueX.toLocaleString("en-IN");
//   }
//   return text;
// });

//         chart.maskBullets = false;
// labelBullet.label.truncate = false;
// labelBullet.label.wrap = false;
// labelBullet.label.hideOversized = false;
// labelBullet.label.maxWidth = 300;

//         series.columns.template.adapter.add("fill", function (fill, target) {
//             return chart.colors.getIndex(target.dataItem.index);
//         });

//         chart.data = topItems;

//         chart.events.on("ready", function () {
//             if (series.columns.length > 0) {
//                 series.columns.getIndex(0).fill = am4core.color("#9E1710");
//                 // ... (remaining colors)
//             }
//         });

//         return () => {
//             if (chart) {
//                 chart.dispose();
//             }
//         };
//     }, [topItems]);

//     return (
//         <div id="sidechartdiv" style={{
//             width: "100%",
//             height: "350px",
//             backgroundColor: "#f5f5f5",
//             borderRadius: "12px",
//             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//         }}></div>
//     );
// };

// export default SortedBarChart1;

import React, { useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const SortedBarChart1 = ({ topItems, setSearch, setShowTable }) => {
  useEffect(() => {
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("sidechartdiv", am4charts.XYChart3D);
    chart.logo.disabled = true;
    chart.depth3D = 10;
    chart.angle = 5;

    // -----------------------------------------------------
    //  CATEGORY AXIS (X-Axis → Horizontal)
    // -----------------------------------------------------
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "Department";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.labels.template.fontSize = 10;
    categoryAxis.renderer.labels.template.fill = am4core.color("#666");
    categoryAxis.renderer.labels.template.maxWidth = 120;
    categoryAxis.renderer.labels.template.truncate = true;
    categoryAxis.title.text = "Department";
    categoryAxis.title.fontWeight = 600;
    categoryAxis.title.fontSize = 12;
    categoryAxis.title.fill = am4core.color("#333");
    categoryAxis.renderer.labels.template.rotation = 90;


    // -----------------------------------------------------
    //  VALUE AXIS (Y-Axis → Vertical)
    // -----------------------------------------------------
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.max = Math.max(...topItems.map((i) => parseFloat(i.Netpay)));
    valueAxis.renderer.labels.template.fontSize = 10;
    valueAxis.renderer.labels.template.fill = am4core.color("#666");
    valueAxis.title.text = "Amount";
    valueAxis.title.fontWeight = 600;
    valueAxis.title.fontSize = 12;
    valueAxis.title.fill = am4core.color("#333");

    chart.depth = 3;
    chart.depth3D = 5;
    chart.bottom = 5;

    // -----------------------------------------------------
    //  SERIES → Horizontal Bars
    // -----------------------------------------------------
    let series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.categoryX = "Department"; // CHANGED
    series.dataFields.valueY = "Netpay"; // CHANGED
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusTopLeft = 12;
    series.columns.template.column.cornerRadiusTopRight = 12;
    series.columns.template.tooltipText = "{categoryX}: {valueY}";
    series.columns.template.height = 10; // exact pixel width

    // CLICK EVENT
    series.columns.template.events.on("hit", function (ev) {
      const data = ev.target.dataItem.dataContext;

      setSearch((prev) => ({
        ...prev,
        DEPARTMENT: data.Department,
      }));

      setShowTable(true);
    });

    // -----------------------------------------------------
    //  Label Bullet (Right side values)
    // -----------------------------------------------------
    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.horizontalCenter = "left";
    labelBullet.label.verticalCenter = "start";
    labelBullet.label.text = "{valueY}";
    labelBullet.locationX =0.5;
    labelBullet.dx = 1;
    labelBullet.label.fontSize = 10;
    labelBullet.label.fill = am4core.color("#333");
    labelBullet.label.rotation = 90; // rotates the text vertically
    labelBullet.label.verticalCenter = "middle";
    labelBullet.label.horizontalCenter = "middle";
    chart.maskBullets = true;
    labelBullet.label.truncate = false;
    labelBullet.label.wrap = false;
    labelBullet.label.hideOversized = false;
    labelBullet.label.maxWidth = 300;

    // Format label numbers
    labelBullet.label.adapter.add("text", function (text, target) {
      if (target.dataItem && target.dataItem.valueY !== undefined) {
        return target.dataItem.valueY.toLocaleString("en-IN");
      }
      return text;
    });

    // -----------------------------------------------------
    //  Colors
    // -----------------------------------------------------
    series.columns.template.adapter.add("fill", function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    chart.data = topItems;

    return () => {
      chart && chart.dispose();
    };
  }, [topItems]);

  return (
    <div
      id="sidechartdiv"
      style={{
        width: "100%",
        height: "350px",
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    ></div>
  );
};

export default SortedBarChart1;
