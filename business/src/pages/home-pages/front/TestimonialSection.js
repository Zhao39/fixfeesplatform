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

const TestimonialItem = (props) => {
  const { item } = props

  return (
    <Box className="testimonial-item">
      <Stack direction={`column`} justifyContent={`flex-start`} alignItems={`flex-start`} spacing={2}>
        <div className="responsive-video-container">
          <div className="responsive-video-wrapper">
            <div className="responsive-video-box">
              <iframe
                src={item.url}
                className="vimeo-iframe-responsive"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="video"
              />
            </div>
          </div>
        </div>
        <div className="testimonial-video-title">
          <Typography variant="h4">
            {item.desc}
          </Typography>
        </div>
      </Stack>
    </Box>
  )
}

const TestimonialSection = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const testimonialList = [
    {
      url: `https://player.vimeo.com/video/861378667`,
      desc: `Aaron & Jordan's Story`
    },
    {
      url: `https://player.vimeo.com/video/861382491`,
      desc: `Billy's Story`
    },
    {
      url: `https://player.vimeo.com/video/861407680`,
      desc: `Kenzie's Story`
    },
    {
      url: `https://player.vimeo.com/video/861404315`,
      desc: `Sally's Story`
    }
  ]

  const learnMoreList = [
    {
      url: `https://player.vimeo.com/video/861411577`,
      desc: `Too Busy`
    },
    {
      url: `https://player.vimeo.com/video/861393150`,
      desc: `Deposits & Float Time`
    },
    {
      url: `https://player.vimeo.com/video/861399674`,
      desc: `Real Merchant Account`
    },
    {
      url: `https://player.vimeo.com/video/861387497`,
      desc: `Calls From Payment Providers`
    }
  ]

  return (
    <section className="front-section" id="testimonial-section">
      <Container>
        <div className="section-wrapper">
          <Grid container spacing={10}>
            <Grid item xs={12}>
              <div className="testimonial-list">
                <Typography variant="h1" align="center" sx={{ fontWeight: 800 }}>Testimonials</Typography>
                <div className="how-bg-container">
                  <img src="/assets/home/images/testimals/testimal-text.png" className="img-responsive" style={{ maxWidth: '1024px', width: '100%' }} alt="testimal" />
                </div>
                <Box sx={{ width: '100%', pt: 0, zIndex: 1, position: 'relative' }}>
                  <Grid container spacing={3}>
                    {
                      testimonialList.map((item, index) => {
                        return (
                          <Grid item xs={matchDownSM ? 12 : 6} key={index}>
                            <TestimonialItem item={item} />
                          </Grid>
                        )
                      })
                    }
                  </Grid>
                </Box>
              </div>
            </Grid>

            <Grid item xs={12}>
              <div className="testimonial-list">
                <Typography variant="h1" align="center" sx={{ fontWeight: 800 }}>Learn More</Typography>
                <Box sx={{ width: '100%', pt: 4, zIndex: 1, position: 'relative' }}>
                  <Grid container spacing={3}>
                    {
                      learnMoreList.map((item, index) => {
                        return (
                          <Grid item xs={matchDownSM ? 12 : 6} key={index}>
                            <TestimonialItem item={item} />
                          </Grid>
                        )
                      })
                    }
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

export default TestimonialSection;
