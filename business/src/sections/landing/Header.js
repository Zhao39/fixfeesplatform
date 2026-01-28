import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Container, Grid, Link, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// assets
import { EyeOutlined } from '@ant-design/icons';
import headertechimg from 'assets/images/landing/img-headertech.svg';
// import headerbg from 'assets/images/landing/bg-mokeup.svg';
// import headeravtar from 'assets/images/landing/img-headeravtar.png';
// import headerwidget1 from 'assets/images/landing/img-headerwidget1.png';
// import headerwidget2 from 'assets/images/landing/img-headerwidget2.png';
// import headerwidget3 from 'assets/images/landing/img-headerwidget3.png';
import AnimateButton from 'components/@extended/AnimateButton';
import { textAlign } from '@mui/system';

// ==============================|| LANDING - HEADER PAGE ||============================== //

const HeaderPage = () => {
  const theme = useTheme();

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ pt: { md: 0, xs: 8 }, pb: { md: 0, xs: 5 } }}>
        <Grid item xs={12} lg={12} md={12}>
          <Grid container spacing={2} sx={{ pr: 10, [theme.breakpoints.down('md')]: { pr: 0, textAlign: 'center' } }}>
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30
                }}
              >
                <Typography
                
                  variant="h1"
                  color="white"
                  sx={{
                    fontSize: { xs: '1.825rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    lineHeight: { xs: 1.3, sm: 1.3, md: 1.3 },
                    textAlign: 'center'
                  }}
                >
                  <span>Landing Page </span>
               
                </Typography>
              </motion.div>
            </Grid>
        
          </Grid>
        </Grid>
     
      </Grid>
    </Container>
  );
};

export default HeaderPage;
