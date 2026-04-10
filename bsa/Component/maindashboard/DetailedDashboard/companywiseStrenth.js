import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
} from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useGetYearlyCompQuery } from '../../../redux/service/misDashboardService'

const CompanywiseStrenth = ({ companyName }) => {
  // Fetch data
  const { data: Esidata, isLoading } = useGetYearlyCompQuery({
    params: { filterBuyer: companyName }
  })

//   console.log(Esidata,"EsidataStrenth");
  

  // Show loading state
  if (isLoading) {
    return <Card sx={{ padding: 2, textAlign: 'center' }}>Loading...</Card>
  }

  // If API returns nothing or unexpected shape
//   const maleValue = Esidata?.data?.map((x)=>x.male)
//   const femaleValue = Esidata?.data?.map((x)=>x.female)
//   console.log(maleValue,femaleValue,"Lavanay");
const maleValue = Esidata?.data?.reduce((acc, x) => acc + (x.male || 0), 0) ?? 0
const femaleValue = Esidata?.data?.reduce((acc, x) => acc + (x.female || 0), 0) ?? 0

  

  const data = [
    { name: 'Male', value: maleValue, color: '#0D5C85' },
    { name: 'Female', value: femaleValue, color: '#FF7F45' }
  ]

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 500 }}>Employee Strength of {companyName}</Typography>}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Legend */}
          <Box>
            {data.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, mr: 1.5 }}
                />
                <Typography variant="body2">
                  <strong>{item.value}</strong> <span style={{ color: item.color }}>{item.name}</span>
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Pie Chart */}
          <Box sx={{ width: 180, height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #ccc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CompanywiseStrenth
