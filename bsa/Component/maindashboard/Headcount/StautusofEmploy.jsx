    import React from "react";
    import { Card, CardHeader, CardContent, Box, Typography, Button, Stack } from "@mui/material";
    import ReactApexChart from "react-apexcharts";
    import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

    const EmployeeByDepartment = () => {
    const chartData = {
        series: [
        {
            name: "Employees",
            data: [80, 105, 60, 40], // Example values
        },
        ],
        options: {
        chart: {
            type: "bar",
            height: 350,
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
            horizontal: true,
            borderRadius: 4,
            barHeight: "60%",
            colors: {
                backgroundBarColors: [],
            },
            },
        },
        colors: ["#FFA726"], // orange color
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: ["Permanent Staff", "Contract", "Permanent Labour","Temporary Labour"],
            labels: {
            style: { fontSize: "13px", colors: "#666" },
            },
        },
        grid: {
            borderColor: "#eee",
            strokeDashArray: 3,
        },
        tooltip: {
            theme: "light",
            y: {
            formatter: (val) => `${val} Employees`,
            },
        },
        },
    };

    return (
        <Card
        sx={{
            m:1,
            borderRadius: 3,
            boxShadow: 3,
            p: 1,
            width: "100%",
            maxWidth: 1100,
            // mx:1,
        }}
        >
        {/* Header */}
        <CardHeader
            title="Employees Status"
            titleTypographyProps={{
            sx: { fontWeight: 600, fontSize: "1rem" },
            }}
            // action={
            // <Button
            //     size="small"
            //     variant="outlined"
            //     startIcon={<CalendarTodayIcon fontSize="small" />}
            //     sx={{
            //     textTransform: "none",
            //     borderRadius: 2,
            //     fontSize: "12px",
            //     color: "#555",
            //     borderColor: "#ddd",
            //     }}
            // >
            //     This Week
            // </Button>
            // }
        />

        {/* Chart */}
        <CardContent>
            <Box sx={{ height: 280 }}>
            <ReactApexChart
                options={chartData.options}
                series={chartData.series}
                type="bar"
                height={300}
            />
            </Box>

            {/* Footer note */}
            <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mt: 1.5, pl: 1 }}
            >
            {/* <Box
                sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#FFA726",
                }}
            /> */}
            {/* <Typography variant="body2" sx={{ color: "#555" }}>
                No of Employees increased by{" "}
                <Typography component="span" sx={{ color: "green", fontWeight: 600 }}>
                +20%
                </Typography>{" "}
                from last Week
            </Typography> */}
            </Stack>
        </CardContent>
        </Card>
    );
    };

    export default EmployeeByDepartment;
