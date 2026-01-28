import { useTheme } from '@mui/material/styles';
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Toolbar, useMediaQuery } from '@mui/material';

// material-ui
import Marquee from "react-fast-marquee";
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import MainCard from 'components/MainCard';
import { ArrowRightOutlined, SmileOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import AnimateButton from "components/@extended/AnimateButton";

const FaqItem = (props) => {
  const { item, index } = props

  return (
    <Accordion>
      <AccordionSummary id={`accordian-${index}`}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5">{item.title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <div className="accordian-detail-wrapper" style={{ padding: '8px 16px' }}>
          {
            item.content
          }
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

const FaqSection = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const faqList = [
    {
      title: `How are you able to have such low fees compared to everyone else?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            In the electronic payments industry, most providers offer “bait and switch“ pricing. Where they get business owners signed up for an intro program, only to change it and increase fees later. Banks and processors increase rates on average once or twice per year.
          </Typography>
          <Typography>
            Fix My Fees focuses on providing transaction processing services with integrity and transparent pricing. We offer flexible month-to-month merchant agreements and guarantee our processing rates for as long as you have your accounts with us.
          </Typography>
          <Typography>
            We offer great processing rates upfront. AND we don’t imitate other providers in their “bait and switch” pricing increases.
          </Typography>
          <Typography>
            We save you money now AND later, with great fees and processing rates.
          </Typography>
        </Stack>
      )
    },
    {
      title: `How many merchants have been onboarded?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            We have onboarded approximately 10,000 businesses and organizations for payment processing. For our first few years in business we operated as a “word of mouth introduction only” company. We have recently expanded to allow anyone to find us and sign up with us.
          </Typography>
        </Stack>
      )
    },
    {
      title: `Out of all the one’s reviewed how many could you save money?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            Out of more than 10,000 accounts reviewed and approximately 10,000 accounts onboarded, we have successfully saved over 9,990 accounts. There have been less than 10 clients that we couldn’t save considerable money. Call it a 99.999% success rate!
          </Typography>
        </Stack>
      )
    },
    {
      title: `Can you increase my fees after I switch to your merchant?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            Typically credit card processors increase their rates annually. We know you work hard for your money and we guarantee our rates for the life of the account.
          </Typography>
        </Stack>
      )
    },
    {
      title: `How many merchants have you reviewed?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            We have helped thousands of businesses save in exorbitant fees. Our typical savings is 20-40%. We work hard to keep your costs low and increasing your bottom line.
          </Typography>
        </Stack>
      )
    },
    {
      title: `How fast do I get paid after running a sale?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            We know your cash flow is important to your business. We offer funding methods as quickly as same day deposits.
          </Typography>
        </Stack>
      )
    },
    {
      title: `How can I start accepting credit card payments?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            To get started, simply sign up here. It typically takes one business day to get your account activated.
          </Typography>
        </Stack>
      )
    },
    {
      title: `What is interchange?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            Interchange is the cost charged for running a credit or debit card by the card-issuing bank to cover handling costs, rewards and costs of the risk involved in approving the payment. This is the cost passed onto you, getting you the best rate.
          </Typography>
        </Stack>
      )
    },
    {
      title: `If I send you my statements how is it confidential?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            As a financial services company, we abide by all government and industry regulations. We’re very similar to your bank or financial institution in safeguarding and securing your information. We use industry-leading encryption, and all of our services are backed by the highest levels of Payment Card Industry Data Security Standards (PCI DSS).
          </Typography>
          <Typography>
            Whether it’s your merchant statements we review or your sensitive business data you provide to sign up with us, we take the utmost precautions to safeguard your data.
          </Typography>
          <Typography>
            We take your privacy seriously and keep your information safe and confidential.
          </Typography>
        </Stack>
      )
    },
    {
      title: `What is the average fee savings based off of those onboarded percent wise?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            We consistently average an overall cost reduction of 20-40% for our clients. Your actual cost reduction may be somewhat less or considerably more than this, depending on the types of transactions you process, and how you’re set up currently. Our experts will customize a plan specifically for you and your business/organization.
          </Typography>
        </Stack>
      )
    },
    {
      title: `Out of all the current businesses on your merchants how many have left Fix My Fees?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            We average 4X the industry standard in regard to retention of our clients. This figure accounts for all of the factors why an account would close — businesses that closed their doors, sold the business, the owner retired, the business experienced a merger/acquisition, or chose to close their processing account for another reason.
          </Typography>
        </Stack>
      )
    },
    {
      title: `What are the payment types I am able to accept?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            Reports have shown that offering multiple payment channels to your customers equates to an increase in revenue generation. Offering customers, the right easy-to-use payment tools at checkout allows your business to go beyond cash transactions expanding opportunities.
          </Typography>
          <Typography>
            Mobile Payments and Contactless Payments: Touch-free payments made with credit cards and debit cards, key fobs, smart cards, or other devices, such as smartphones and other mobile devices such as Samsung Pay, Apple Pay, Google Pay.
          </Typography>
          <Typography>
            eCommerce/Online Payments (electronic commerce) accept payments online via your website or app to offer the convenience of shopping and paying online.
          </Typography>
          <Typography>
            Virtual Terminal: A virtual terminal is a software application you can access from anywhere to securely store and run cards with a customer database, virtual invoicing, recurring or one-time payments.
          </Typography>
          <Typography>
            ACH Payments: ACH stands for Automated Clearing House. This is the ability to accept electronic check.
          </Typography>
        </Stack>
      )
    },
    {
      title: `What are the rates for Fix My Fees payment processing services?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            Fix My Fees offers wholesale rates with our Interchange (cost) Plus Pricing to all businesses, with no long term contract. This way you are getting the most qualified rate to keep your costs low. Bank-owned payment processors tend to be on the higher end while most third-party payment processors, like ourselves, offer lower rates per transaction.
          </Typography>
        </Stack>
      )
    },
    {
      title: `How do I keep my customers' financial data safe? What is PCI Compliance?`,
      content: (
        <Stack spacing={2}>
          <Typography>
            PCI Compliance or the Payment Card Industry Data Security Standard is a mandated set of requirements agreed upon by the major credit card companies. The security requirement is designed to keep both the merchant and consumer safe from fraud. We provide each client with the ability to complete and become PCI Compliant as well as $250,000 in breach protection to ensure your business is protected.
          </Typography>
          <Typography>
            PCI Compliance or the Payment Card Industry Data Security Standard is an information security standard for organizations that handle branded credit cards. The PCI Standard is mandated by the card brands but administered by the Payment Card Industry Security Standards Council.
          </Typography>
        </Stack>
      )
    }
  ]
  return (
    <section className="front-section" id="faq-section">
      <Container>
        <div className="section-wrapper">
          <Grid container>
            <Grid item xs={12}>
              <div className="faq-item-list">
                <Typography variant="h1" align="center" sx={{ fontWeight: 800 }}>Frequently Asked Question</Typography>
                <Box sx={{ width: '100%', pt: 3, zIndex: 1, position: 'relative' }}>
                  <Box
                    sx={{
                      '& .MuiAccordion-root': {
                        borderColor: theme.palette.divider,
                        marginBottom: '16px',
                        border: '1px solid #ddd !important',
                        borderRadius: '8px',
                        '&.Mui-expanded': {
                          border: '1px solid #15D500 !important',
                          boxShadow: '0px 4px 24px 0px #cde8c7'
                        },
                        '& .MuiAccordionSummary-root': {
                          bgcolor: 'transparent',
                          flexDirection: 'row',
                          '& .MuiAccordionSummary-content': {
                            padding: '8px 8px'
                          },
                        },
                        '& .MuiAccordionDetails-root': {
                          borderColor: theme.palette.divider
                        },
                        '& .Mui-expanded': {
                          color: theme.palette.primary.main,
                        },
                      }
                    }}
                  >
                    {
                      faqList.map((item, index) => {
                        return (
                          <FaqItem
                            key={index}
                            item={item}
                            index={index}
                          />
                        )
                      })
                    }
                  </Box>
                </Box>

                <Box sx={{ width: '100%', pt: 5, position: 'relative' }}>
                  <Box sx={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
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
                </Box>
              </div>
            </Grid>
          </Grid>
        </div>
      </Container>
    </section>
  )
}

export default FaqSection;
