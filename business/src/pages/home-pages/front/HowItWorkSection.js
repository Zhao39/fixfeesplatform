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

const StepBox = (props) => {
  const { item } = props

  return (
    <Box className="step-box">
      <Stack direction={`column`} justifyContent={`flex-start`} alignItems={`flex-start`} spacing={2}>
        <div className="step-icon-container">
          <img src={`/assets/home/images/how-it-works/step${item.id}.svg`} className="img-responsive" alt="icon" />
        </div>
        <Typography variant="h3" color={`primary`}>Step{item.id}</Typography>
        <Typography variant="h5" color="text.secondary">{item.desc}</Typography>
      </Stack>
    </Box>
  )
}

const HowItWorkSection = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const stepList = [
    {
      id: 1,
      desc: `Most companies are using processors without really understanding the fees they are paying on every transaction. At Fix My Fee’s we bring integrity and transparency back to the Merchant Industry.`
    },
    {
      id: 2,
      desc: `It’s as simple as Submit and Save, simply fill in our application and submit 3 months of merchant statements. All documents sent are confidential and only viewed internally by our team. After submission you will be prompted to schedule a Savings Call with one of our account representatives.`
    },
    {
      id: 3,
      desc: `In the meantime, our team will run a comprehensive audit on your statements and identify how much you will save when integrating with our processors.`
    },
    {
      id: 4,
      desc: `On the Savings call we will screen share an analysis on your current merchant providers fee agreement and how much you're being upcharge. We will also answer any questions you have about the integration process to our processors. Note we will never increase your fees. What you see is what you get!`
    },
    {
      id: 5,
      desc: `After the call our team will run a final review and once approved will connect with your current team to transition some or all of the processors over a 24–48-hour period.`
    },
    {
      id: 6,
      desc: `With no long term contracts you can go back to business as usual with Fixed Fees while we save you more money to go back into your bottom line!`
    },
  ]

  return (
    <section className="front-section" id="how-it-work-section">
      <Container>
        <div className="section-wrapper">
          <Grid container spacing={10}>
            <Grid item xs={12}>
              <div className="step-list">
                <Typography variant="h1" align="center" sx={{ fontWeight: 800 }}>How it Works</Typography>
                <div className="how-bg-container">
                  <img src="/assets/home/images/how-it-works/bg-text.png" className="img-responsive" style={{ maxWidth: '1024px', width: '100%' }} alt="testimal" />
                </div>
                <Box sx={{ width: '100%', pt: 0, zIndex: 1, position: 'relative' }}>
                  <Grid container spacing={3}>
                    {
                      stepList.map((item, index) => {
                        return (
                          <Grid item xs={matchDownSM ? 12 : 4} key={index}>
                            <StepBox item={item} />
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

export default HowItWorkSection;
