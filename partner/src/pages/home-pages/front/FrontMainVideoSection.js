// material-ui
import Marquee from "react-fast-marquee";
import { Button, Container, Grid, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import MainCard from 'components/MainCard';
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const FrontMainVideoSection = (props) => {

  return (
    <div className="front-main-container">
      <div className="front-video-container">

      </div>
      <div className="front-video-header text-center">
        <Typography variant="h2" component="span" sx={{ fontWeight: 700 }}>Unlock a <Typography variant="h2" component="span" color={`primary`} sx={{ fontWeight: 700 }}>Lifetime of Residual Income</Typography> by Simply Helping <br />Companies Save Big Money</Typography>
      </div>
      <div
        className="front-video-box text-center"
        style={{ position: "relative", zIndex: 1 }}
      >
        <iframe
          src="https://player.vimeo.com/video/888303230"
          className="vimeo-iframe"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          title="video"
          style={{ margin: 'auto' }}
        ></iframe>
      </div>
      <div className="front-video-footer text-center">
        <Button
          size="xlarge"
          color="success"
          variant="contained"
          //startIcon={<ArrowRightOutlined />}
          component={Link}
          className="btn-main"
          to="/register"
          sx={{ width: '100%', maxWidth: '480px' }}
        >
          Click Here to Become a Partner!
        </Button>
      </div>
    </div>
  )
}

export default FrontMainVideoSection;
