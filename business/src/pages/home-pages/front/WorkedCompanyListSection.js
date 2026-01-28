import { useTheme } from '@mui/material/styles';
import { AppBar, Rating, Toolbar, useMediaQuery } from '@mui/material';

// material-ui
import Marquee from "react-fast-marquee";
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';
import { RightCircleFilled } from '@ant-design/icons';

const WorkedCompanyItem = (props) => {
  const { item } = props
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box className="worked-company-item">
      <Grid container spacing={3}>
        <Grid item xs={matchDownSM ? 12 : 4}>
          <Box className="worked-company-item-block-1">
            <Stack direction={`column`} spacing={2} justifyContent={`center`} alignItems={`flex-start`}>
              <img src={item.logo} className="img-responsive" alt="icon" />
              <Rating
                name="simple-controlled"
                value={item.rating}
                // size={`large`}
                readOnly={true}
              />
              <Typography variant="h3">{item.name}</Typography>
              <Typography variant="subtitle" color="text.secondary">{item.short_desc}</Typography>
              <div className="worked-company-desc-wrapper">
                <Typography variant="h4">{item.full_desc}</Typography>
              </div>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={matchDownSM ? 12 : 4}>
          <Box className="worked-company-item-block-2">
            <Typography variant="h3">Initial State:</Typography>

            <Stack direction={`column`} spacing={1} justifyContent={`center`} alignItems={`flex-start`} sx={{ pt: 2 }}>
              {
                item.initial_state.map((spec, index) => {
                  return (
                    <div className="company-spec-item" key={index}>
                      <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`flex-start`} spacing={1}>
                        <span className="spec-icon">
                          <RightCircleFilled />
                        </span>
                        <div style={{ flex: 1, paddingTop: '1px' }}>
                          <Typography variant="h5">{spec}</Typography>
                        </div>
                      </Stack>
                    </div>
                  )
                })
              }
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={matchDownSM ? 12 : 4}>
          <Box className="worked-company-item-block-3">
            <Typography variant="h3" color="white">Result:</Typography>

            <Stack direction={`column`} spacing={1} justifyContent={`center`} alignItems={`flex-start`} sx={{ pt: 2 }}>
              {
                item.result.map((spec, index) => {
                  return (
                    <div className="company-spec-item" key={index}>
                      <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`flex-start`} spacing={1}>
                        <span className="spec-icon">
                          <RightCircleFilled />
                        </span>
                        <div style={{ flex: 1, paddingTop: '1px' }}>
                          <Typography color="white" variant="h5">{spec}</Typography>
                        </div>
                      </Stack>
                    </div>
                  )
                })
              }
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

const WorkedCompanyListSection = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const companyList = [
    {
      name: "Manatt's",
      logo: "/assets/home/images/worked-companies/manatts.webp",
      rating: 5,
      short_desc: "Construction Company",
      full_desc: '“How we saved this business over $100,000 in fees in our first year compared to their previous processor.”',
      initial_state: [
        "Waiting for funds to be deposited.",
        "Rate increases 1-2 times per year.",
        "Unnecessary fees.",
        "Transactions downgrading."
      ],
      result: [
        "Saved over $100,000 in fees.",
        "Set up on same day funding.",
        "Optimized downgraded transactions through level 2 and 3 data.",
        "Complimentary annual PCI Compliance."
      ]
    },
    {
      name: "Bath Fitter",
      logo: "/assets/home/images/worked-companies/bath-fitter.webp",
      rating: 5,
      short_desc: "Bathroom Remodeling Company",
      full_desc: '“How we saved this home services company $60,000 per year at one location.”',
      initial_state: [
        "Growing business resulting in record sales.",
        "Processor wrongfully holding funds as a result of this amazing growth.",
        "Could not get a hold of anyone to help them get their funds released.",
        "Seeking a better partner that will have their back."
      ],
      result: [
        "Reduced fees by 30% resulting in $60,000 in savings per year.",
        "Upgraded billing back office.",
        "Implemented the ability for the sales team to take payment in person, resulting in lower fees and streamlined process.",
        "No funds on hold."
      ]
    },
    {
      name: "Napa Auto Parts",
      logo: "/assets/home/images/worked-companies/napa-auto-parts.webp",
      rating: 5,
      short_desc: "Auto Parts Store",
      full_desc: '“How we saved one Napa franchisee $45,000 a year and upgraded their technology.‍”',
      initial_state: [
        "Overpaying in fees with their bank.",
        "Client is processing on phone line.",
        "Stuck in a lease with old technology.",
        "Not PCI Compliant."
      ],
      result: [
        "Reduced fees by 35% putting $45,000 back in their pocket.",
        "Upgraded machines making check out more efficient and secure.",
        "Merchant became PCI Compliant saving them fees and risk.‍",
        "$250,000 in Breach Protection.",
        "Implemented e-Invoicing, check guarantee and ACH for corporate clients."
      ]
    },
    {
      name: "Happy Henry's",
      logo: "/assets/home/images/worked-companies/happy-henry.webp",
      rating: 5,
      short_desc: "Car Wash",
      full_desc: '“There is no client too small or big. We also saved this family small business 35%”',
      initial_state: [
        "Paying on average 5% in Fees.",
        "Frustrating support with no one local to call.",
      ],
      result: [
        "Reduced fees by 35%.",
        "Provided them with local dedicated support and chargeback assistance."
      ]
    },
    {
      name: "AV-Tech",
      logo: "/assets/home/images/worked-companies/av-tech.webp",
      rating: 5,
      short_desc: "Electronics Outfitter",
      full_desc: '“This family-owned business outfits police, security and fire trucks”',
      initial_state: [
        "Paying on average 6.87% in Fees.",
        "Thought they were being taken care of by their current bank.",
      ],
      result: [
        "Reduced fees to 3%, over half their fee with the bank.",
        "Upgraded their machines and back office, streamlining processes and cashflow."
      ]
    },
    {
      name: "ATIF",
      logo: "/assets/home/images/worked-companies/atif.webp",
      rating: 5,
      short_desc: "Fitness Company",
      full_desc: '“How we saved this online coaching company $2,500 per year in fees and got them same day funding‍”',
      initial_state: [
        "Using an aggregate processor that had them at a fixed rate.",
        "Waiting 3-5 business days for net deposits into their bank account.",
        "Only access to chat bot or email support.",
        "Pay more than they need to per transaction.",
      ],
      result: [
        "Got them set up on our cost-plus pricing model.",
        "Saved over 30% in fees.",
        "Set up on same day funding.",
        "Gross deposits on sales making reconciling books very simple."
      ]
    },
    {
      name: "The ConFITdent Woman",
      logo: "/assets/home/images/worked-companies/confitddent-woman.webp",
      rating: 5,
      short_desc: "Fitness Company",
      full_desc: '“How we helped this company get paid faster and lower their fees”',
      initial_state: [
        "Using an aggregate processor that had them at a fixed rate.",
        "Waiting 3-5 business days for net deposits into their bank account.",
        "Only access to chat bot or email support.",
        "Pay more than they need to per transaction.‍"
      ],
      result: [
        "Got them set up on our cost-plus pricing model.",
        "Saved over 25% in fees.",
        "Set up on same day funding.",
        "Gross deposits on sales making reconciling books very simple."
      ]
    }
  ]

  return (
    <section className="front-section" id="worked-company-section">
      <Container>
        <div className="section-wrapper">
          <Grid container spacing={10}>
            <Grid item xs={12}>
              <div className="story-list">
                <Typography variant="h1" align="center" sx={{ fontWeight: 800 }}>{`Companies We’ve Worked With`}</Typography>
                <Box sx={{ width: '100%', pt: 6, zIndex: 1, position: 'relative' }}>
                  <Grid container spacing={4}>
                    {
                      companyList.map((item, index) => {
                        return (
                          <Grid item xs={12} key={index}>
                            <WorkedCompanyItem
                              item={item}
                            />
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

export default WorkedCompanyListSection;
