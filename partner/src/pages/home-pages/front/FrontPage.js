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

// ==============================|| LANDING - FEATURE PAGE ||============================== //

const FrontPage = () => {
  const hasBanner = true //true
  return (
    <div className="front-page-bg-container">
      <Container>
        <div className={`front-page-container ${hasBanner ? 'has-banner' : ''}`}>
          {
            (hasBanner) && (
              <>
                <FrontBanner />
              </>
            )
          }

          <FrontHeader />
          <FrontMainVideoSection />
        </div>
      </Container>
    </div>
  )
}

export default FrontPage;
