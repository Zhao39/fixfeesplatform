import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid, Stack, Select, MenuItem, Box, Typography, Button } from '@mui/material';
import SkeletonCard from 'components/cards/SkeltonCard';

// assets
import { showToast } from 'utils/utils';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { DollarOutlined, EyeOutlined } from '@ant-design/icons';
import { curl_post, get_data_value, priceFormat } from 'utils/misc';
import { RANK_TYPE_TEXT, TIER_TYPE_TEXT } from 'config/constants';

import LinearWithLabel from 'components/@extended/Progress/LinearWithLabel';
import IconButton from 'components/@extended/IconButton';
import { DownloadOutlined } from '@ant-design/icons';
import { apiUserGetRankStatsData } from 'services/userRankStatsService';
import { urlUserExportRankStatsPageData } from 'services/constants';

const StatsFieldGroupBox = (props) => {
  const { showProgressBar, dateOption } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  const defaultFormData = {
    business_ref_url: "",
    partner_ref_url: "",
    stores: 0,
    wallet: 0,
    sponsor: 'Admin',
    tier_next_progress: 0,
    status_next_progress: 0
  }
  const [formData, setFormData] = useState(defaultFormData)
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = { dateOption: dateOption }
    const apiRes = await apiUserGetRankStatsData(payload)
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
  }, [dateOption])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={4}>
        <Grid item container xs={12} md={6} spacing={4}>
          {
            (showProgressBar) ?
              <>
                <Grid item xs={12} md={12}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', zIndex: 1, top: '0px', bottom: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h5" color="text.primary">{`${formData.tier_next_progress}% to ${get_data_value(TIER_TYPE_TEXT, formData.nextTierLevel)}`}</Typography>
                    </Box>
                    <LinearWithLabel value={formData.tier_next_progress} showLabel={false} color="success" sx={{ height: 36 }} />
                  </Box>
                </Grid>
              </>
              :
              <></>
          }

          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Your Current Tier`}
              secondary={get_data_value(TIER_TYPE_TEXT, formData?.tierLevel)}
              iconPrimary={EyeOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Override Status`}
              secondary={get_data_value(RANK_TYPE_TEXT, formData?.overrideRank)}
              iconPrimary={EyeOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Total Net Earnings`}
              secondary={formData?.totalReferralAdjustedNet ? `${priceFormat(formData?.totalReferralAdjustedNet, '$')}` : '$0'}
              iconPrimary={DollarOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Total Active Merchants (Level 1)`}
              secondary={formData?.level1ActiveMerchantCount ? `${formData?.level1ActiveMerchantCount}` : '0'}
              iconPrimary={EyeOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Total Active Merchants (Level 2)`}
              secondary={formData?.level2ActiveMerchantCount ? `${formData?.level2ActiveMerchantCount}` : '0'}
              iconPrimary={EyeOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Total Active Merchants (Level 3)`}
              secondary={formData?.level3ActiveMerchantCount ? `${formData?.level3ActiveMerchantCount}` : '0'}
              iconPrimary={EyeOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
        </Grid>
        <Grid item container xs={12} md={6} spacing={4}>
          {
            (showProgressBar) ?
              <>
                <Grid item xs={12} md={12}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', zIndex: 1, top: '0px', bottom: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h5" color="text.primary">{`${formData.status_next_progress}% to ${get_data_value(RANK_TYPE_TEXT, formData.nextOverrideRank)}`}</Typography>
                    </Box>
                    <LinearWithLabel value={formData.status_next_progress} showLabel={false} color="success" sx={{ height: 36 }} />
                  </Box>
                </Grid>
              </>
              :
              <></>
          }

          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Level 1 Volume (Tier Pay Level)`}
              secondary={formData?.level1MerchantVolumn ? `${priceFormat(formData?.level1MerchantVolumn, '$')}` : '$0'}
              iconPrimary={DollarOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Level 2 Volume (Status Pay Level)`}
              secondary={formData?.level2MerchantVolumn ? `${priceFormat(formData?.level2MerchantVolumn, '$')}` : '$0'}
              iconPrimary={DollarOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Total Cumulative Volume`}
              secondary={formData?.totalReferralProcessingVolume ? `${priceFormat(formData?.totalReferralProcessingVolume, '$')}` : '$0'}
              iconPrimary={DollarOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Total Active Brand Partners (Level 1)`}
              secondary={formData?.level1ReferralPartnerCount ? `${formData?.level1ReferralPartnerCount}` : '0'}
              iconPrimary={EyeOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Total Active Brand Partners (Level 2)`}
              secondary={formData?.level2ReferralPartnerCount ? `${formData?.level2ReferralPartnerCount}` : '0'}
              iconPrimary={EyeOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SkeletonCard
              primary={`Legacy Override Volume - Merchants (Level 3)`}
              secondary={formData?.level2LegacyOverrideVolumn ? `${priceFormat(formData?.level2LegacyOverrideVolumn, '$')}` : '$0'}
              iconPrimary={DollarOutlined}
              color="warning.main"
              bgcolor="warning.lighter"
              isLoading={apiLoading}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default StatsFieldGroupBox;
