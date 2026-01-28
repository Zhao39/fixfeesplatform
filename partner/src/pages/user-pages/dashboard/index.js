import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Divider, Grid, Stack, Select, MenuItem, Box } from '@mui/material';
import SkeletonCard from 'components/cards/SkeltonCard';

// assets
import { showToast } from 'utils/utils';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { apiUserGetDashboardData, apiUserGetActiveMerchantsData } from 'services/userDashboardService';
import ReferralLinkBox from './ReferralLinkBox';
import DashboardSummaryBlock from './DashboardSummaryBlock';
import { DollarOutlined, EyeOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { get_data_value, priceFormat } from 'utils/misc';
import { RANK_TYPE_TEXT, TIER_TYPE_TEXT } from 'config/constants';
import StatsBox from '../rank-stats/StatsBox';

const DashboardPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  const defaultFormData = {
    business_ref_url: "",
    partner_ref_url: "",
    stores: 0,
    wallet: 0,
    sponsor: 'Admin'
  }
  const [formData, setFormData] = useState(defaultFormData)
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = {}
    const apiRes = await apiUserGetDashboardData(payload)
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setFormData({ ...apiRes['data'], wallet: apiRes['data']?.user.balance })
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const dateOptionList = [
    {
      value: 'today',
      text: 'Today'
    },
    {
      value: 'last_7',
      text: 'Last 7 day'
    },
    {
      value: 'last_30',
      text: 'Last 30 days'
    },
    {
      value: 'last_90',
      text: 'Last 90 days'
    }
  ]

  const [dateOption, setDateOption] = useState(dateOptionList[0]['value'])
  const onChangeDateRangeOption = (e) => {
    const v = e.target.value
    console.log(`onChangeDateRangeOption v:::`, v)
    setDateOption(v)
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <PageLayout title="" cardType="" >
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={6} md={3}>
          <h1>Dashboard</h1>
        </Grid>
        <Grid item xs={6} md={9}>
          <Grid container spacing={2} justifyContent="center"> {/* Added container here for nested items */}
            <Grid item xs={4} md={4}>
              <p>Active Merchants: {formData.merchants}</p>
            </Grid>
            <Grid item xs={4} md={4}>
              <p>Active Brand Partners: {formData.partners}</p>
            </Grid>
            <Grid item xs={4} md={4}>
              <p>Commission Wallet Balance: {`${priceFormat(formData.wallet, '$')}`}</p>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <ReferralLinkBox
            type="business"
            title="Merchant Referral Link:"
            note="Your referral link to sign up a business:"
            ref_url={formData?.business_ref_url}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <ReferralLinkBox
            type="partner"
            title="Brand Partner Referral Link:"
            note="Your referral link to sign up a brand partner:"
            ref_url={formData?.partner_ref_url}
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <Divider />
        </Grid>

        <Grid item xs={12} md={12}>
          <Box sx={{ width: '100%' }}>
            <StatsBox
              showDateOption={true}
              showExportButton={false}
              showProgressBar={false}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={12}>
          <Divider />
        </Grid>

        <Grid item xs={12} md={12}>
          <DashboardSummaryBlock
            hidePeriod={true}
            dateOption={dateOption}
            setDateOption={setDateOption} />
        </Grid>
      </Grid>
    </PageLayout>
  )
}

export default DashboardPage;
