import PropTypes from 'prop-types';

// material-ui
import { Box, Container, Grid } from '@mui/material';

// project import
import AuthFooter from 'components/cards/AuthFooter';
import Logo from 'components/logo';
import AuthCard from './AuthCard';

// assets
import AuthBackground from 'assets/images/auth/AuthBackground';
import { useDispatch } from 'react-redux';
import { resetSettingData } from 'store/reducers/settingPersist';
import { useEffect, useState } from 'react';
import { BASE_FRONT_URL } from 'config/constants';
import RoutePageWrapper from 'pages/route-page-wrapper';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = (props) => {
  const { type = "" } = props
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(resetSettingData())
  }, [])

  return (
    <RoutePageWrapper>
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        {
          (type === "register") ? (
            <>
              <Container>
                {/* <AuthBackground /> */}
                <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ py: 3 }}>
                        <Grid container spacing={3} justifyContent={`flex-start`}>
                          <Grid item>
                            <Logo to={`/`} src={`/assets/global/images/logo-h.png`} width={240} />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <AuthCard type={type}>{props.children}</AuthCard>
                    </Grid>
                    
                    <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
                      <AuthFooter />
                    </Grid>
                  </Grid>
                </Box>
              </Container>
            </>
          ) : (
            <>
              {/* <AuthBackground /> */}
              <Box sx={{ width: '100%', minHeight: '100vh', paddingTop: '68px', paddingBottom: '68px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Grid
                  container
                  direction="column"
                >
                  <Grid item xs={12}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Box sx={{ display: 'block', textAlign: 'center', margin: 'auto' }}>
                        <Logo to={`/`} width={175} />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      item
                      xs={12}
                      container
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item>
                        {
                          (props.no_content) ? <></> : <AuthCard type={type}>{props.children}</AuthCard>
                        }
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
                    <AuthFooter />
                  </Grid>
                </Grid>
              </Box>
            </>
          )
        }
      </Box>
    </RoutePageWrapper>
  )
}

AuthWrapper.propTypes = {
  children: PropTypes.node
};

export default AuthWrapper;
