import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, useMediaQuery } from '@mui/material';

// material-ui
import Marquee from "react-fast-marquee";
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import MainCard from 'components/MainCard';
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import AnimateButton from "components/@extended/AnimateButton";

const GetStartedSection = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <section className="front-section" id="get-started-section">
      <Container>
        <div className="section-wrapper" style={{ paddingBottom: matchDownSM ? 0 : null }}>
          <Grid container spacing={10}>
            <Grid item xs={12}>
              <div className="">
                <Box sx={{ width: '100%', pt: 0, zIndex: 1, position: 'relative' }}>
                  <Grid container spacing={4}>
                    <Grid item xs={matchDownSM ? 12 : 6}>
                      <Box sx={{ width: '100%', py: 5 }}>
                        <Stack direction={`column`} justifyContent={`flex-start`} alignItems={matchDownSM ? `center` : `flex-start`} spacing={3}>
                          <Typography variant="h1" align="center" sx={{ fontWeight: 800 }}>Are You Ready?</Typography>
                          <Typography variant="h5">Click The Button Below and Lets Get Started</Typography>
                          <div className="text-center">
                            <Box sx={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                              <AnimateButton>
                                <Button
                                  size="xlarge"
                                  color="success"
                                  variant="contained"
                                  //startIcon={<ArrowRightOutlined />}
                                  component={Link}
                                  className="btn-main"
                                  to="/register"
                                  sx={{ width: '100%' }}
                                >
                                  Fix My Fees Now!
                                </Button>
                              </AnimateButton>
                            </Box>
                          </div>
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 12 : 6}>
                      {
                        (matchDownSM) ? (
                          <>
                            <Box sx={{ width: '100%', position: 'relative', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'row' }}>
                              <img src="/assets/home/images/get-started/man-xs-1.png" className="img-responsive" style={{ width: '100%' }} alt="man" />
                            </Box>
                          </>
                        ) : (
                          <>
                            <Box sx={{ width: '100%', position: 'relative', height: '100%' }}>
                              <div className="man-img-box">
                                <img src="/assets/home/images/get-started/man.webp" className="img-responsive" style={{ height: '100%' }} alt="man" />
                              </div>
                            </Box>
                          </>
                        )
                      }
                    </Grid>
                  </Grid>
                </Box>
              </div>
            </Grid>
          </Grid>
        </div>
      </Container>
    </section>
  )
}

export default GetStartedSection;
