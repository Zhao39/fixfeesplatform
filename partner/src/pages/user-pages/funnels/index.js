import { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid, InputLabel, MenuItem, FormHelperText, FormControl, Select, Button, Box, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

// assets
import { showToast } from 'utils/utils';
import { get_data_value, get_utc_timestamp_ms, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { apiUserGetDashboardData, apiUserGetActiveMerchantsData } from 'services/userDashboardService';
import UserPaymentListTable from './inc/UserPaymentListTable';
import ReferralLinkBox from '../dashboard/ReferralLinkBox';
import { WEBSITE_VERSION } from 'config/constants';
import { urlUserGetFunnelTypeList } from 'services/constants';
import { axiosGet } from 'services/ajaxServices';

const FunnelsPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const defaultFormData = {}
  const [formData, setFormData] = useState(defaultFormData)
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  const [apiLoading, setApiLoading] = useState(false)

  const [funnelList, setFunnelList] = useState([]);
  const [currentFunnel, setCurrentFunnel] = useState(null);
  const [funnelType, setFunnelType] = useState(1);

  const apiUserGetFunnelTypeList = async (params = {}) => {
    const url = urlUserGetFunnelTypeList
    const payload = { ...params }
    const response = await axiosGet(url, payload)
    return response
  }

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = {}
    const apiRes = await apiUserGetFunnelTypeList(payload)
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setFormData(apiRes['data'])
      setFunnelList(apiRes['data']['funnelTypeList'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const businessRecruitingFunnelList = [
    {
      id: 1, // default funnel
      img: `/assets/img/funnel/merchant/main.png?v=${WEBSITE_VERSION}`,
      alt: "Main",
      ReferralLinkType: "business",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_business_url}?ref=${formData?.ref_name}`,
      description: 'This is the main company website, it can be shared for general information purposes as well as for sharing testimonials. Share this with Business Owners interested in processing with Fix My Fees!'
    },
    {
      id: 2,
      img: `/assets/img/funnel/merchant/processwithus.png?v=${WEBSITE_VERSION}`,
      alt: "Processwithus",
      ReferralLinkType: "business",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_business_url}processwithus/${formData?.ref_name}`,
      description: 'This funnel is a detailed overview pitch video for Business Owners to review when they can commit to watching a 20 minute video and giving it their full attention. This is for more analytical prospects that want to know everything, they want all the ins & outs and the full information. This gives them exactly that and covers our 8 primary benefits in great detail. (This version is the short page version with just video and opt-in).'
    },
    {
      id: 3,
      img: `/assets/img/funnel/merchant/paymentprocessing.png?v=${WEBSITE_VERSION}`,
      alt: "Paymentprocessing",
      ReferralLinkType: "business",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_business_url}paymentprocessing/${formData?.ref_name}`,
      description: 'This funnel is a detailed overview pitch video for Business Owners to review when they can commit to watching a 20 minute video and giving it their full attention. This is for more analytical prospects that want to know everything, they want all the ins & outs and the full information. This gives them exactly that and covers our 8 primary benefits in great detail. (This version is the long page version with lots of information and testimonials included).'
    },
    {
      id: 4,
      img: `/assets/img/funnel/merchant/feefixer.png?v=${WEBSITE_VERSION}`,
      alt: "Feefixer",
      ReferralLinkType: "business",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_business_url}feefixer/${formData?.ref_name}`,
      description: 'This funnel is a summarized overview pitch video for Business Owners to review when they can commit to watching a 4 minute video and giving it their full attention. This is for more non-analytical prospects that want to get to the meat of things quickly, they want fast and summarized. This gives them exactly that and covers our 8 primary benefits in a short & quick format. (This version is the short page version with just video and opt-in).'
    },
    {
      id: 5,
      img: `/assets/img/funnel/merchant/paymentprocessor.png?v=${WEBSITE_VERSION}`,
      alt: "Paymentprocessor",
      ReferralLinkType: "business",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_business_url}paymentprocessor/${formData?.ref_name}`,
      description: 'This funnel is a summarized overview pitch video for Business Owners to review when they can commit to watching a 4 minute video and giving it their full attention. This is for more non-analytical prospects that want to get to the meat of things quickly, they want fast and summarized. This gives them exactly that and covers our 8 primary benefits in a short & quick format. (This version is the long page version with lots of information and testimonials included).'
    },
    {
      id: 6,
      img: `/assets/img/funnel/merchant/register.png?v=${WEBSITE_VERSION}`,
      alt: "Register",
      ReferralLinkType: "business",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_business_url}register?ref=${formData?.ref_name}`,
      description: 'This is the application form to register new Business Owners interested in processing payments with Fix My Fees. This link takes them directly to the form and does not include any educational or informational content. This is for Business Owners ready to sign up that have already been pitched and are ready to onboard!'
    }
  ]

  const brandPartnerRecruitingFunnelList = [
    {
      id: 1,
      img: `/assets/img/funnel/partner/main.png?v=${WEBSITE_VERSION}`,
      alt: "Main",
      ReferralLinkType: "partner",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_partner_url}?ref=${formData?.ref_name}`,
      description: 'This is the main Brand Partner recruiting pitch video & funnel. Share this with interested Brand Partners so they can learn about the lucrative payments industry and the compensation plan opportunity with Fix My Fees!'
    },
    {
      id: 2,
      img: `/assets/img/funnel/partner/register.png?v=${WEBSITE_VERSION}`,
      alt: "Register",
      ReferralLinkType: "partner",
      ReferralLinkTitle: "Funnel Description:",
      ReferralLinkNote: "Affiliate Links:",
      ReferralLinkRefUrl: `${formData?.base_partner_url}register?ref=${formData?.ref_name}`,
      description: 'This is the application form to register new Brand Partners interested in being an affiliate with Fix My Fees and referring Business Owners to earn residual commissions. This link takes them directly to the form and does not include any educational or informational content. This is for new Brand Partners ready to sign up that have already been pitched and are ready to onboard!'
    }
  ]

  const getReferralLinkRefUrl = (item, formData) => {
    let referral_url = item.referral_url
    referral_url = referral_url.replace("${{ref_name}}", formData?.ref_name).replace("${{base_business_url}}", formData?.base_business_url).replace("${{base_partner_url}}", formData?.base_partner_url)
    return referral_url
  }

  const renderFunnelItem = (item) => {
    return (
      <Grid item container xs={12} md={12} spacing={2}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%', // Ensure it takes full height of the grid item
              textAlign: 'center',
              padding: 1
            }}
          >
            <img src={item.thumbnail} alt={item.alt} style={{ width: '190px', height: '300px', objectFit: 'cover' }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'left',
              paddingLeft: 2,
              //height: '200px', // Ensure it takes full height of the grid item
              textAlign: 'left',
            }}
          >
            <ReferralLinkBox
              type={item.type}
              title={`Funnel Description:`}
              note={`Affiliate Links:`}
              description={item.description}
              ref_url={formData?.ref_name ? getReferralLinkRefUrl(item, formData) : ''}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%', // Ensure it takes full height of the grid item
            }}
          >
            <Button variant="outlined" href={formData?.ref_name ? getReferralLinkRefUrl(item, formData) : ''} target='_blank'>
              Preview
            </Button>
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <PageLayout title="Funnels" cardType="MainCard">
      <Box sx={{ p: 2 }}>
        <Grid container>
          <Grid item xs={12} md={12}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={funnelType}
                onChange={(event) => setFunnelType(event.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value={1}>Merchant Recruiting Videos</MenuItem>
                <MenuItem value={2}>Brand Partner Recruiting Funnels</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item container xs={12} md={12} spacing={3}>
            {funnelType === 1 && (
              <>
                {
                  funnelList.filter((item) => item.type === 'business').map((item) => (
                    <Fragment key={item.id}>
                      {
                        renderFunnelItem(item)
                      }
                    </Fragment>
                  ))
                }
              </>
            )}
            {funnelType === 2 && (
              <>
                {
                  funnelList.filter((item) => item.type === 'partner').map((item) => (
                    <Fragment key={item.id}>
                      {
                        renderFunnelItem(item)
                      }
                    </Fragment>
                  ))
                }
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  )
};

export default FunnelsPage;
