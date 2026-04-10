import React from 'react'
import { Box, Typography, Button, Avatar, Stack } from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { getCommonParams } from '../../utils/hleper'
import { useGetFnameQuery } from '../../redux/service/user'
import { useState } from 'react'
import { useEffect } from 'react'

const DashboardHeader = ({usernames}) => {

  const [user,setUser]=useState(null)
const params=getCommonParams()

const{isSuperAdmin,employeeId}=params
// console.log(employeeId);



const {data:userName}=useGetFnameQuery({params:{employeeId}})
console.log(userName,"userNamecheck");

 useEffect(() => {
    if (!isSuperAdmin && userName && userName.data && Array.isArray(userName.data)) {
      const usernameObj = userName.data.find((x) => x.userName)
      if (usernameObj) setUser(usernameObj.userName)
    }
  }, [isSuperAdmin, userName])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        p: 2,
        backgroundColor: '#fff'
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          alt="Adrian"
          src="/images/avatars/1.png" // change to your avatar image path
          sx={{ width: 56, height: 56 }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Welcome Back, {usernames ||"SuperAdmin"}<span style={{ fontSize: '1.2rem' }}>👋</span>
          </Typography>
          {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You have{' '}
            <span style={{ color: '#E53935', fontWeight: 600 }}>21</span> Pending Approvals &{' '}
            <span style={{ color: '#E53935', fontWeight: 600 }}>14</span> Leave Requests
          </Typography> */}
        </Box>
      </Box>

      {/* Right Section (Buttons) */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ backgroundColor: '#446D7F', textTransform: 'none', '&:hover': { backgroundColor: '#365A6A' } }}
        >
          Add Project
        </Button>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ backgroundColor: '#E65100', textTransform: 'none', '&:hover': { backgroundColor: '#C43E00' } }}
        >
          Add Requests
        </Button>
      </Stack>
    </Box>
  )
}

export default DashboardHeader
