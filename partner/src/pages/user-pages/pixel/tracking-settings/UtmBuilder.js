// material-ui
import { useEffect, useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { get_data_value } from 'utils/misc';
import { useSelector } from 'react-redux';
import BackLeft from 'assets/images/profile/UserProfileBackLeft';
import BackRight from 'assets/images/profile/UserProfileBackRight';
import MainCard from 'components/MainCard';
import FacebookAdsSection from './FacebookAdsSection';
import TiktokAdsSection from './TiktokAdsSection';
import GenericAdsSection from './GenericAdsSection';
import PageLayout from 'layout/UserLayout/PageLayout';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}


const UtmBuilder = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')

  const [loading, setLoading] = useState(true)
  const [pageData, setPageData] = useState({})

  const loadPageData = async () => {
     
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
    <PageLayout title="Tracking Settings" cardType="">
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ position: 'relative' }}>
              <MainCard border={false} content={false} sx={{ bgcolor: 'primary.lighter', position: 'relative' }}>
                <Box sx={{ position: 'absolute', bottom: '-7px', left: 0, zIndex: 1 }}>
                  <BackLeft />
                </Box>
                <Grid container justifyContent="center" alignItems="center" sx={{ position: 'relative', zIndex: 5 }}>
                  <Grid item>
                    <Stack direction="row" spacing={matchDownSM ? 1 : 2} alignItems="center">
                      <Box sx={{ p: matchDownSM ? 3 : 4, textAlign: 'center' }}>
                        <Typography variant="h3" marginBottom={1}>UTM Builder</Typography>
                        <Typography variant="body" color="secondary">
                          Set up proper tracking for your ads on each marketing  platform.
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
                <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
                  <BackRight />
                </Box>
              </MainCard>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="main-section">
              <Tabs value={value} onChange={handleChange} aria-label="UTM builder" variant="scrollable" scrollButtons="auto">
                <Tab label="Facebook Ads" {...a11yProps(0)} value={0} />
                {/* <Tab label="Google Ads" {...a11yProps(1)} value={1} /> */}
                <Tab label="Tiktok" {...a11yProps(2)} value={2} />
                <Tab label="Generic URL Builder" {...a11yProps(3)} value={3} />
              </Tabs>
              <TabPanel value={value} index={0}>
                <FacebookAdsSection
                  pageData={pageData}
                />
              </TabPanel>
              {/* <TabPanel value={value} index={1}>
                <GoogleAdsSection
                  pageData={pageData}
                />
              </TabPanel> */}
              <TabPanel value={value} index={2}>
                <TiktokAdsSection
                  pageData={pageData}
                />
              </TabPanel>
              <TabPanel value={value} index={3}>
                <GenericAdsSection
                  pageData={pageData}
                />
              </TabPanel>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </PageLayout>
  )
};

export default UtmBuilder
