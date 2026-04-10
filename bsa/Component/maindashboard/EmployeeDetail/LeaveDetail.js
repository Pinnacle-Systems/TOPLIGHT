import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton
} from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const LeaveDetailsCard = () => {
  // Pie chart data
  const data = [
    { name: 'On Time', value: 1254, color: '#0D5C75' },
    { name: 'Late Attendance', value: 32, color: '#4CAF50' },
    { name: 'Work From Home', value: 658, color: '#FF9800' },
    { name: 'Absent', value: 14, color: '#F44336' },
    { name: 'Sick Leave', value: 68, color: '#FFD54F' }
  ]

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Leave Details
          </Typography>
        }
        action={
          <IconButton
            size="small"
            sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontSize: 14
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
            2024
          </IconButton>
        }
      />

      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Left Side - Legend */}
          <Box>
            {data.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    mr: 1.5
                  }}
                />
                <Typography variant="body2">
                  <strong>{item.value}</strong>{' '}
                  <span style={{ color: item.color }}>{item.name}</span>
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Right Side - Pie Chart */}
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
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Bottom Checkbox */}
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={
            <Typography variant="body2">
              Better than <strong>85%</strong> of Employees
            </Typography>
          }
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  )
}

export default LeaveDetailsCard
