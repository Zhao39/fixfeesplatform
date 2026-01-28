// material-ui
import Marquee from "react-fast-marquee";
import { Box, Button, Container, Grid, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import MainCard from 'components/MainCard';
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import AnimateButton from "components/@extended/AnimateButton";

const FrontMainVideoSection = (props) => {

  return (
    <section className="front-section" id="main-video-section">
      <Container>
        <div className="section-wrapper">
          <div className="front-video-header text-center">
            <Typography variant="h2" component="span" sx={{ fontWeight: 700 }}>
              Save <Typography variant="h2" component="span" color={`primary`} sx={{ fontWeight: 700 }}>20-40%</Typography> on Your Payment Processing Fees For  <br />Your Company <Typography variant="h2" component="span" color={`primary`} sx={{ fontWeight: 700 }}>Guaranteed</Typography>!</Typography>
          </div>
          <div
            className="front-video-box text-center"
            style={{ position: "relative", zIndex: 1, marginTop: '16px' }}
          >
            <iframe
              src="https://player.vimeo.com/video/836611171"
              className="vimeo-iframe"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="video"
              style={{ margin: 'auto' }}
            ></iframe>
          </div>
          <div className="front-video-footer text-center">
            <Box sx={{ width: '100%', pt: 2, maxWidth: '400px', margin: 'auto' }}>
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
        </div>
      </Container>
    </section>
  )
}

export default FrontMainVideoSection;
