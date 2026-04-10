import React from "react";
import {
  Box,
  Card,
  Avatar,
  Typography,
  IconButton,
  CardHeader,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import DotsVertical from "mdi-material-ui/DotsVertical";
import TrendingUp from "mdi-material-ui/TrendingUp";
import TrendingDown from "mdi-material-ui/TrendingDown";
import { useGetMisDashboardSalaryDetQuery } from "../../../redux/service/misDashboardService";
import { useTheme } from "@emotion/react";

const EmployeeDetail = () => {
  const theme = useTheme();
  const {
    data: Salarydata,
    isLoading,
    isError,
    error,
  } = useGetMisDashboardSalaryDetQuery({ params: {} });

  if (isLoading)
    return (
      <Card sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Card>
    );

  if (isError)
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Error: {error?.message || "Failed to load data"}
      </Typography>
    );

  const employees = Salarydata?.data || [];


  const totalsByComp = employees.reduce((acc, emp) => {
    const code = emp.COMPCODE || "Unknown";
    acc[code] = (acc[code] || 0) + (emp.NETPAY || 0);
    return acc;
  }, {});


  const compList = Object.entries(totalsByComp).map(
    ([code, total], index, arr) => {
      const prevTotal = index > 0 ? arr[index - 1][1] : total;
      const trendDir = total >= prevTotal ? "up" : "down";
      const color = trendDir === "up" ? "success.main" : "error.main";
      return { COMPCODE: code, NETPAY: total, trendDir, color };
    }
  );

  return (
    <Card sx={{ mx: 1 }}>
      <CardHeader
        title="Salary Contribution"
        titleTypographyProps={{
          sx: {
            lineHeight: "1.2 !important",
            letterSpacing: "0.31px !important",
            fontSize: "16px",
            p: 1,
          },
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
          pb: 0,
        }}
      />

      <CardContent sx={{ pt: (theme) => `${theme.spacing(2)} !important` }}>
        {compList.map((item, index) => (
          <Box
            key={item.COMPCODE}
            sx={{
              display: "flex",
              alignItems: "center",
              ...(index !== compList.length - 1 ? { mb: 2 } : {}),
            }}
          >
            {/* Avatar with COMPCODE initials */}
            <Avatar
              sx={{
                width: 38,
                height: 38,
                mr: 3,
                fontSize: "1rem",
                color: "common.white",
                bgcolor: item.color,
                textTransform: "uppercase",
              }}
            >
              {item.COMPCODE.slice(0, 2)}
            </Avatar>

            {/* Company & Salary */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: ".8rem" }}>
                  {item.COMPCODE}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: ".65rem" }}
                >
                  Net Pay
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: item.color,
                    mr: 1,
                    fontSize: ".8rem",
                  }}
                >
                  ₹{item.NETPAY.toLocaleString()}
                </Typography>
                {item.trendDir === "up" ? (
                  <TrendingUp sx={{ color: item.color, fontSize: "1.3rem" }} />
                ) : (
                  <TrendingDown
                    sx={{ color: item.color, fontSize: "1.3rem" }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        ))}
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            py: 1,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 4,
            },
          }}
        >
          View Detailed Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmployeeDetail;
