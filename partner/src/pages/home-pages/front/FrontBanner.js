// material-ui
import Marquee from "react-fast-marquee";
import { Container, Grid, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import MainCard from 'components/MainCard';

const FrontBanner = (props) => {
  const bannerMessage = "ATTENTION : Business Owners, Sales Reps and Marketers Looking to Speed Up Their Passive Income Journey"

  return (
    <div className="front-banner-container">
      <div className="front-banner">
        <div className="block t-show-desktop">
          <span className="front-banner-text text-emphasis">
            {bannerMessage}
          </span>
        </div>
        <div className="t-show-mobile">
          <Marquee gradient={false}><span className="front-banner-text">{bannerMessage}</span></Marquee>
        </div>
      </div>
    </div>
  )
}

export default FrontBanner;
