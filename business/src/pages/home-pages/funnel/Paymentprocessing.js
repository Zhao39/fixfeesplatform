import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Container } from '@mui/material';

// assets
import FrontMainVideoSection from '../front/FrontMainVideoSection';
import FeatureSection from '../front/FeatureSection';
import SuccessStorySection from '../front/SuccessStorySection';
import WorkedCompanyListSection from '../front/WorkedCompanyListSection';
import HowItWorkSection from '../front/HowItWorkSection';
import TestimonialSection from '../front/TestimonialSection';
import GetStartedSection from '../front/GetStartedSection';
import FaqSection from '../front/FaqSection';
import { useParams, useSearchParams } from "react-router-dom";
import FrontBanner from '../front/FrontBanner';
import FrontHeader from '../front/FrontHeader';
import FunnelMainVideoSection from './FunnelMainVideoSection';

// ==============================|| LANDING - FEATURE PAGE ||============================== //

const Paymentprocessing = () => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
    // const [searchParams, setSearchParams] = useSearchParams()
    // const v = searchParams.get("v") ?? '1'
    // console.log("version:::::", v)
    const { affiliate_code } = useParams()
    console.log(`affiliate_code:::`, affiliate_code)

    const hasBanner = true
    const videoId = '1048418141'
    return (
        <>
            <div className="front-page-bg-container">
                <div className={`front-page-container has-banner`}>
                    <FunnelMainVideoSection
                        videoId={videoId}
                    />
                    <FeatureSection />
                    <SuccessStorySection />
                    <WorkedCompanyListSection />
                    <HowItWorkSection />
                    <TestimonialSection />
                    <GetStartedSection />
                    <FaqSection />
                </div>
            </div>
        </>
    )
}

export default Paymentprocessing;
