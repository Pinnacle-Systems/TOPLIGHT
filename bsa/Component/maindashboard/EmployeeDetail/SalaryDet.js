// // ** MUI Imports
// import Box from '@mui/material/Box'
// import Card from '@mui/material/Card'
// import Avatar from '@mui/material/Avatar'
// import Typography from '@mui/material/Typography'
// import IconButton from '@mui/material/IconButton'
// import CardHeader from '@mui/material/CardHeader'
// import CardContent from '@mui/material/CardContent'

// // ** Icons Imports
// import ChevronUp from 'mdi-material-ui/ChevronUp'
// import ChevronDown from 'mdi-material-ui/ChevronDown'
// import DotsVertical from 'mdi-material-ui/DotsVertical'
// import { useGetMisDashboardSalaryDetQuery } from '../../redux/service/misDashboardService'

// const data = [
//   {
//     sales: '894k',
//     trendDir: 'up',
//     subtitle: 'USA',
//     title: '$8,656k',
//     avatarText: 'US',
//     trendNumber: '25.8%',
//     avatarColor: 'success',
//     trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
//   },
//   {
//     sales: '645k',
//     subtitle: 'UK',
//     trendDir: 'down',
//     title: '$2,415k',
//     avatarText: 'UK',
//     trendNumber: '6.2%',
//     avatarColor: 'error',
//     trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
//   },
//   {
//     sales: '148k',
//     title: '$865k',
//     trendDir: 'up',
//     avatarText: 'IN',
//     subtitle: 'India',
//     trendNumber: '12.4%',
//     avatarColor: 'warning',
//     trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
//   },
//   {
//     sales: '86k',
//     title: '$745k',
//     trendDir: 'down',
//     avatarText: 'JA',
//     subtitle: 'Japan',
//     trendNumber: '11.9%',
//     avatarColor: 'secondary',
//     trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
//   },
//   {
//     sales: '42k',
//     title: '$45k',
//     trendDir: 'up',
//     avatarText: 'KO',
//     subtitle: 'Korea',
//     trendNumber: '16.2%',
//     avatarColor: 'error',
//     trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
//   }
// ]

// const SalesByCountries = () => {

//   const { data: Salarydata, isLoading, isError, error } = useGetMisDashboardSalaryDetQuery({ params: {} });

//   console.log(Salarydata,"Salarydata");

//   return (
//     <Card sx={{ m:1 }}>
//       <CardHeader
//         title='Sales by Countries'
//         titleTypographyProps={{ sx: { lineHeight: '1.2 !important', letterSpacing: '0.31px !important' } }}
//         action={
//           <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
//             <DotsVertical />
//           </IconButton>
//         }
//       />
//       <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
//         {data.map((item, index) => {
//           return (
//             <Box
//               key={item.title}
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 ...(index !== data.length - 1 ? { mb: 5.875 } : {})
//               }}
//             >
//               <Avatar
//                 sx={{
//                   width: 38,
//                   height: 38,
//                   marginRight: 3,
//                   fontSize: '1rem',
//                   color: 'common.white',
//                   backgroundColor: `${item.avatarColor}.main`
//                 }}
//               >
//                 {item.avatarText}
//               </Avatar>

//               <Box
//                 sx={{
//                   width: '100%',
//                   display: 'flex',
//                   flexWrap: 'wrap',
//                   alignItems: 'center',
//                   justifyContent: 'space-between'
//                 }}
//               >
//                 <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column' }}>
//                   <Box sx={{ display: 'flex' }}>
//                     <Typography sx={{ mr: 0.5, fontWeight: 600, letterSpacing: '0.25px' }}>{item.title}</Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       {item.trend}
//                       <Typography
//                         variant='caption'
//                         sx={{
//                           fontWeight: 600,
//                           lineHeight: 1.5,
//                           color: item.trendDir === 'down' ? 'error.main' : 'success.main'
//                         }}
//                       >
//                         {item.trendNumber}
//                       </Typography>
//                     </Box>
//                   </Box>
//                   <Typography variant='caption' sx={{ lineHeight: 1.5 }}>
//                     {item.subtitle}
//                   </Typography>
//                 </Box>

//                 <Box sx={{ display: 'flex', textAlign: 'end', flexDirection: 'column' }}>
//                   <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.72, letterSpacing: '0.22px' }}>
//                     {item.sales}
//                   </Typography>
//                   <Typography variant='caption' sx={{ lineHeight: 1.5 }}>
//                     Sales
//                   </Typography>
//                 </Box>
//               </Box>
//             </Box>
//           )
//         })}
//       </CardContent>
//     </Card>
//   )
// }

// export default SalesByCountries

import React, { useMemo } from "react";
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
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";

const SalaryDet = () => {
  const theme = useTheme();
  const {
    data: Salarydata,
    isLoading,
    isError,
    error,
  } = useGetMisDashboardSalaryDetQuery({ params: {} });

  const dispatch = useDispatch();

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

  console.log(totalsByComp, "Salarydata");

  const compList = Object.entries(totalsByComp).map(
    ([code, total], index, arr) => {
      const prevTotal = index > 0 ? arr[index - 1][1] : total;
      const trendDir = total >= prevTotal ? "up" : "down";
      const color = trendDir === "up" ? "success.main" : "error.main";
      return { COMPCODE: code, NETPAY: total, trendDir, color };
    }
  );
  console.log(compList, "compList");

  const handleView = (item) => {
    // console.log(item.COMPCODE);
    dispatch(
      push({
        id: `EmployeeDetail`,
        name: `EmployeeDetail`,
        component: "DetailedDashBoard", //
        data: { companyName: item.COMPCODE },
      })
    );
  };

  const Totalvalue = compList?.map((x)=>x.NETPAY)

  const Sumtotal =Totalvalue?.reduce((sum,total)=>sum+total)

  console.log(Totalvalue,Sumtotal,"Sumtotal");
  


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
            component="div"
            style={{ cursor: "pointer" }}
            onClick={() => handleView(item)}
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
            OverAll Contribution : {Sumtotal.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalaryDet;
