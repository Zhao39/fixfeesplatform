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

const FeatureSection = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <section className="front-section" id="feature-section">
      <Container>
        <div className="section-wrapper">
          <Grid container spacing={10}>
            <Grid item xs={12}>
              <div className="feature-list">
                <Grid container spacing={0}>
                  <Grid item xs={matchDownSM ? 12 : 4}>
                    <Box className="feature-item">
                      <Stack direction={`column`} justifyContent={`center`} alignItems={`center`} spacing={1}>
                        <div className="image-wrapper">
                          <img src="/assets/home/images/features/fees-save.webp" alt="icon" />
                        </div>
                        <Typography color="primary" variant="h1" sx={{ fontWeight: 800 }}>$40M</Typography>
                        <Typography color="text.primary" textTransform={`capitalize`} variant="h5" align="center">In fees saved by our<br />clients yearly</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={matchDownSM ? 12 : 4}>
                    <Box className="feature-item highlighted">
                      <Stack direction={`column`} justifyContent={`center`} alignItems={`center`} spacing={1}>
                        <div className="image-wrapper">
                          <img src="/assets/home/images/features/calendar.webp" alt="icon" />
                        </div>
                        <Typography color="white" variant="h1" sx={{ fontWeight: 800 }}>$1.4B</Typography>
                        <Typography color="white" textTransform={`capitalize`} variant="h5" align="center">Processed yearly <br />through Fix My Fees</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={matchDownSM ? 12 : 4}>
                    <Box className="feature-item">
                      <Stack direction={`column`} justifyContent={`center`} alignItems={`center`} spacing={1}>
                        <div className="image-wrapper">
                          <img src="/assets/home/images/features/company.webp" alt="icon" />
                        </div>
                        <Typography color="primary" variant="h1" sx={{ fontWeight: 800 }}>100+</Typography>
                        <Typography color="text.primary" textTransform={`capitalize`} variant="h5" align="center">New companies joining <br />FMF every month</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <Grid item xs={12}>
              <div className="company-list">
                <Typography variant="h2" align="center">Trusted by 10,000+ Companies</Typography>
                <Box sx={{ width: '100%', pt: 3 }}>
                  <Grid container spacing={0}>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/union-college.webp" alt="icon" />
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/beavertor.webp" alt="icon" />
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/av-tech.webp" alt="icon" />
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/bath-fitter.webp" alt="icon" />
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/mountain-home.webp" alt="icon" />
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/napa-auto-parts.webp" alt="icon" />
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/advent-source.webp" alt="icon" />
                        </div>
                      </Box>
                    </Grid>
                    <Grid item xs={matchDownSM ? 6 : 3}>
                      <Box className="company-item">
                        <div className="image-wrapper">
                          <img src="/assets/home/images/companies/other.webp" alt="icon" />
                        </div>
                      </Box>
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

export default FeatureSection;
