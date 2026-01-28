import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, useMediaQuery } from '@mui/material';

// material-ui
import { Container, Grid, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import MainCard from 'components/MainCard';

// assets
import imgfeature1 from 'assets/images/landing/img-feature1.svg';
import imgfeature2 from 'assets/images/landing/img-feature2.svg';
import imgfeature3 from 'assets/images/landing/img-feature3.svg';
import FrontBanner from './FrontBanner';
import FrontHeader from './FrontHeader';
import FrontMainVideoSection from './FrontMainVideoSection';
import { Navigate } from 'react-router';
import FeatureSection from './FeatureSection';
import SuccessStorySection from './SuccessStorySection';
import WorkedCompanyListSection from './WorkedCompanyListSection';
import HowItWorkSection from './HowItWorkSection';
import TestimonialSection from './TestimonialSection';
import GetStartedSection from './GetStartedSection';
import FaqSection from './FaqSection';

// ==============================|| LANDING - FEATURE PAGE ||============================== //

const FrontPage = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div className="front-page-bg-container">
      <div className={`front-page-container has-banner`}>
        <FrontMainVideoSection />
        <FeatureSection />
        <SuccessStorySection />
        <WorkedCompanyListSection />
        <HowItWorkSection />
        <TestimonialSection />
        <GetStartedSection />
        <FaqSection />
      </div>
    </div>
  )
}

export default FrontPage;
