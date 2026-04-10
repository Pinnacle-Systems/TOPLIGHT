// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'

// Styled component for the triangle shaped background image
const TriangleImg = styled('img')({
  right: 0,
  bottom: 0,
  height: 170,
  position: 'absolute'
})

// Styled component for the trophy image
const TrophyImg = styled('img')({
  right: 36,
  bottom: 20,
  height: 98,
  position: 'absolute'
})

const Trophy = () => {
  // ** Hook
  const theme = useTheme()
  const imageSrc = theme.palette.mode === 'light' ? 'triangle-light.png' : 'triangle-dark.png'

  return (
    <Card sx={{ position: 'relative',ml:1}}>
      <CardContent>
        <Typography variant='h5' sx={{fontWeight:500}}>Profit 💰</Typography>
        <Typography variant='body2' sx={{ letterSpacing: '0.25px',lineHeight:'30px' }}>
          Profit of the month
        </Typography>
        <Box sx={{ marginTop: 1.5, display: 'flex', flexWrap: 'wrap', marginBottom: 1.5, alignItems: 'flex-start' }}>


        <Typography variant='h6' sx={{ mr: 2,my:2 }}>
          $42.8k
          </Typography>
          <Typography
            component='sup'
            variant='caption'
            sx={{ color: 'success.main' ,my:1}}
          >
             +15 %
          </Typography>
        </Box>
          
        
        <Button size='small' variant='contained'>
          View Sales
        </Button>
        <TriangleImg alt='triangle background' src={`/images/misc/${imageSrc}`} />
        <TrophyImg alt='trophy' src='/images/misc/trophy.png' />
      </CardContent>
    </Card>
  )
}

export default Trophy
