import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Button, Container, CardMedia, Divider, Grid, Link, Typography, Stack } from '@mui/material';
import Logo from 'components/logo';

// third party
import { motion } from 'framer-motion';

// project import
import useConfig from 'hooks/useConfig';

import imgfooterSocialFacebook from 'assets/images/landing/img-social-facebook.svg';
import imgfooterSocialInstagram from 'assets/images/landing/img-social-instagram.svg';
import imgfooterSocialLinkedIn from 'assets/images/landing/img-social-linkedin.svg';


import AnimateButton from 'components/@extended/AnimateButton';
import { APP_NAME, SOCIAL_FACEBOOK_URL, SOCIAL_INSTAGRAM_URL, SOCIAL_LINKEDIN_URL } from 'config/constants';

const dashImage = require.context('assets/images/landing', true);

// ==============================|| LANDING - FOOTER PAGE ||============================== //

const FooterBlock = ({ isFull }) => {
  const theme = useTheme();
  const { presetColor } = useConfig();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const linkSX = {
    color: theme.palette.common.white,
    fontSize: '0.875rem',
    fontWeight: 400,
    opacity: '0.6',
    '&:hover': {
      opacity: '1'
    }
  };

  const socialIconSX = {
    width: '45px',
    height: '45px'
  }

  const footerLinks = [
    {
      url: '/privacy-policy',
      label: 'Privacy Policy'
    },
    {
      url: 'terms-service',
      label: 'Terms of Service'
    },
    {
      url: 'cookies-settings',
      label: 'Cookies Settings'
    },
    {
      url: 'disclaimer',
      label: 'Disclaimer'
    }
  ]
  return (
    <>
      <Box sx={{ pt: 7, pb: 7, bgcolor: theme.palette.grey.A700 }}>
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 400, color: theme.palette.common.white, textAlign: isMobile ? 'center' : 'left' }}>
                    Fix My Fees has proudly served over <Typography variant="h5" component="span" color="primary">10,000+</Typography> companies across multiple industries saving our clients millions in unnecessary fees.
                    <Link href="mailto:support@fixmyfees.com" sx={{ display: 'block' }}>support@fixmyfees.com</Link>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction={`row`} justifyContent={`center`} alignItems={`center`} sx={{ width: '100%' }}>
                    <Logo to={`/`} width={220} src="/assets/global/images/logo-h.png" />
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={3} alignItems="center" justifyContent={`${isMobile ? 'center' : 'flex-end'}`}>
                <Grid item>
                  <Link href={SOCIAL_FACEBOOK_URL} target="_blank" underline="none">
                    <CardMedia component="img" sx={socialIconSX} image={imgfooterSocialFacebook} />
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={SOCIAL_INSTAGRAM_URL} target="_blank" underline="none">
                    <CardMedia component="img" sx={socialIconSX} image={imgfooterSocialInstagram} />
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={SOCIAL_LINKEDIN_URL} target="_blank" underline="none" >
                    <CardMedia component="img" sx={socialIconSX} image={imgfooterSocialLinkedIn} />
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Divider sx={{ borderColor: '#2c2c2c' }} />

      <Box
        sx={{
          py: 2.5,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[50] : theme.palette.grey[800]
        }}
      >
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="secondary">
                {`© 2024 ${APP_NAME}, LLC. All rights reserved.`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={3} alignItems="center" justifyContent={`${isMobile ? 'center' : 'flex-end'}`}>
                {
                  footerLinks.map((item, index) => {
                    return (
                      <Grid item key={index}>
                        <Link component={RouterLink} to={item.url} underline="none" sx={linkSX}>
                          {item.label}
                        </Link>
                      </Grid>
                    )
                  })
                }
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

FooterBlock.propTypes = {
  isFull: PropTypes.bool
};

export default FooterBlock;
