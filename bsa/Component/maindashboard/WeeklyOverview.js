import {
  Box,
  Card,
  Button,
  useTheme,
  CardHeader,
  IconButton,
  Typography,
  CardContent,
  Tooltip,
  CircularProgress,
  Grid
} from '@mui/material'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import GroupsIcon from '@mui/icons-material/Groups'

import ReactApexcharts from 'react-apexcharts'
import { useState, useEffect } from 'react'
import EmployeeDetail from './DetailedDashboard/EmployDetail'
import { useDispatch } from 'react-redux'
import { push } from '../../redux/features/opentabs'

const GenderDistributionChart = () => {
  const dispatch = useDispatch();
  const[detailedpage,setDetailedpage]=useState(false)
  const theme = useTheme()
  const [chartData, setChartData] = useState({ male: [], female: [] })
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalStats, setTotalStats] = useState({ totalMale: 0, totalFemale: 0, total: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:9008/misDashboard/yearlyComp')
        if (!response.ok) throw new Error('Failed to fetch data')
          console.log(response.data,"getEmploy deatil");
          

        const result = await response.json()
        console.log(result.data,"getEmploy deatil");
        if (result.statusCode === 0 && result.data) {
          const apiCategories = result.data.map(item => item.customer)
          const maleData = result.data.map(item => item.male)
          const femaleData = result.data.map(item => item.female)
          const totalMale = maleData.reduce((sum, val) => sum + val, 0)
          const totalFemale = femaleData.reduce((sum, val) => sum + val, 0)

          setCategories(apiCategories)
          setChartData({ male: maleData, female: femaleData })
          setTotalStats({ totalMale, totalFemale, total: totalMale + totalFemale })
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleView =()=>{
    console.log("lavanya");
    
    
    // dispatch(push({ id: "employees-detail", name: "EmployeeDetail" }));
    
  }

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      events: {
      dataPointSelection: (event, chartContext, config) => {
        
        const company = categories[config.dataPointIndex];
        console.log('Clicked company:', company);

        // dispatch your redux action or call your function
        dispatch(push({ id: `EmployeeDetail`,
                        name: `EmployeeDetail`,
                        component: "DetailedDashBoard", //
                        data: { companyName: company }, }));
      },
    },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
        endingShape: 'rounded'
      }
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: { width: 12, height: 12, radius: 6 }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '13px',
          fontWeight: 500
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of People',
        style: {
          color: theme.palette.text.secondary,
          fontSize: '12px'
        }
      }
    }
  }

  const chartSeries = [
    { name: 'Male', data: chartData.male },
    { name: 'Female', data: chartData.female }
  ]

  const StatBox = ({ icon: Icon, value, label, color }) => (
    <Box
      sx={{
        p: 1,
        borderRadius: 3,
        background: `${color}22`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: 2,
        height: '100%'
      }}
    >
      <Icon sx={{ color, fontSize: 100 }} />
      <Box>
        <Typography variant='subtitle2' color='text.secondary'>
          {label}
        </Typography>
        <Typography variant='h6' fontWeight={600}>
          {value}
        </Typography>
      </Box>
    </Box>
  )

  if (isLoading)
    return (
      <Card
        sx={{
          p: 6,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 500,
          borderRadius: 3
        }}
      >
        <CircularProgress />
      </Card>
    )

  if (error)
    return (
      <Card
        sx={{
          p: 6,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 500
        }}
      >
        <Typography color='error' variant='h6'>
          Error: {error}
        </Typography>
      </Card>
    )

    return (

      <>     
      <Card sx={{
          // m:1,
          borderRadius: 3,
          boxShadow: 4,
          width: '100%',
          maxWidth: 1000,
          mx:1
        }}
      >
        <CardHeader
          title='Employee Strength As On Date'
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: '#fff',
            py: 1,
                    }}
          titleTypographyProps={{
            sx: { fontSize: '1.1rem', fontWeight: 600 }
          }}
          action={
            <Tooltip title='Options'>
              <IconButton sx={{ color: '#fff' }}>
                <DotsVertical />
              </IconButton>
            </Tooltip>
          }
        />

        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={4}>
              <StatBox
                icon={MaleIcon}
                value={totalStats.totalMale}
                label='Total Male'
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatBox
                icon={FemaleIcon}
                value={totalStats.totalFemale}
                label='Total Female'
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatBox
                icon={GroupsIcon}
                value={totalStats.total}
                label='Total Employees'
                color={theme.palette.success.main}
              />
            </Grid>
          </Grid>

          <Box sx={{ height: 230 ,'& .apexcharts-bar-area:hover': { cursor: 'pointer' }}} >
            <ReactApexcharts type='bar' height='100%' options={chartOptions} series={chartSeries} />
          </Box>

          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: 'background.default',
              borderRadius: 3,
              textAlign: 'center',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
              Gender Distribution
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              Male: {((totalStats.totalMale / totalStats.total) * 100).toFixed(1)}% | Female:{' '}
              {((totalStats.totalFemale / totalStats.total) * 100).toFixed(1)}%
            </Typography>
          </Box>

          {/* <Button
            fullWidth
            variant='contained'
            sx={{
              mt: 4,
              py: 1,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
            onClick={handleView}
          >
            View Detailed Report
          </Button> */}
        </CardContent>
      </Card>
      </>
      
    )
  }

export default GenderDistributionChart