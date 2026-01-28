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

const SuccessStorySection = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <section className="front-section" id="success-story-section">
      <Container>
        <div className="section-wrapper">
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <div className="story-list">
                <Typography variant="h1" align="center" sx={{ fontWeight: 800 }}>Success Stories</Typography>
                <Box sx={{ width: '100%', pt: 3, zIndex: 1, position: 'relative' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={matchDownSM ? 12 : 4}>
                      <Box className="success-story-item">
                        <div className="responsive-video-container">
                          <div className="responsive-video-wrapper">
                            <div className="responsive-video-box">
                              <iframe
                                src="https://player.vimeo.com/video/861395461"
                                className="vimeo-iframe-responsive"
                                frameBorder="0"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                title="video"
                              />
                            </div>
                          </div>
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 12 : 4}>
                      <Box className="success-story-item">
                        <div className="responsive-video-container">
                          <div className="responsive-video-wrapper">
                            <div className="responsive-video-box">
                              <iframe
                                src="https://player.vimeo.com/video/861851452"
                                className="vimeo-iframe-responsive"
                                frameBorder="0"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                title="video"
                              />
                            </div>
                          </div>
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 12 : 4}>
                      <Box className="success-story-item">
                        <div className="responsive-video-container">
                          <div className="responsive-video-wrapper">
                            <div className="responsive-video-box">
                              <iframe
                                src="https://player.vimeo.com/video/861397023"
                                className="vimeo-iframe-responsive"
                                frameBorder="0"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                title="video"
                              />
                            </div>
                          </div>
                        </div>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <div className="story-bg-container">
                  <img src="/assets/home/images/testimals/testimal-text.png" className="img-responsive" style={{ maxWidth: '1024px', width: '100%' }} alt="testimal" />
                </div>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ width: '100%', pt: 3, position: 'relative' }} id="apply-now-block">
                <Box sx={{ width: '100%', maxWidth: '300px', margin: 'auto' }}>
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
                      Apply Now!
                    </Button>
                  </AnimateButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </div>
      </Container>
    </section>
  )
}

export default SuccessStorySection;
