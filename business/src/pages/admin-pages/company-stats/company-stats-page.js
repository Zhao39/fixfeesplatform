import { Grid } from '@mui/material';
import {
  EyeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/utils';
import { get_data_value, priceFormat } from 'utils/misc';
import PageLayout from "layout/AdminLayout/PageLayout";
import SkeletonCard from 'components/cards/SkeltonCard';
import { apiAdminGetCompanyStats } from 'services/adminService';

const CompanyStatsPage = (props) => {
  const dispatch = useDispatch()
  const settingPersistDataStore = useSelector((x) => x.settingPersist)
  //  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const defaultPageData = {}
  const [pageData, setPageData] = useState(defaultPageData)
  const [loading, setLoading] = useState(true)

  const loadPageData = async () => {
    const payload = {}
    setLoading(true)
    const apiRes = await apiAdminGetCompanyStats(payload)
    setLoading(false)
    if (apiRes['status'] === '1') {
      setPageData(apiRes['data']['companyStats'])
    } else {
      showToast(apiRes['message'], "error")
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  return (
    <PageLayout title="Campany Stats" cardType="">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total monthly income:"
            secondary={`${priceFormat(get_data_value(pageData, 'total_revenue', 0), '$')}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total monthly sponsor expense"
            secondary={`${priceFormat(get_data_value(pageData, 'total_sponsor_expense', 0), '$')}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total credit wallet amount"
            secondary={`${priceFormat(get_data_value(pageData, 'company_balance', 0), '$')}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total users"
            secondary={`${(get_data_value(pageData?.member_stats, 'total_users', 0))}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total GSM members"
            secondary={`${(get_data_value(pageData?.member_stats, 'total_gsm_members', 0))}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total users of basic package"
            secondary={`${(get_data_value(pageData?.member_stats, 'membership1_user_cnt', 0))}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total inactive users"
            secondary={`${(get_data_value(pageData?.member_stats, 'total_inactive_users', 0))}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total pending cancellation users"
            secondary={`${(get_data_value(pageData?.member_stats, 'cancelled_user_cnt', 0))}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <SkeletonCard
            primary="Total users on trial"
            secondary={`${(get_data_value(pageData?.member_stats, 'trial_user_cnt', 0))}`}
            iconPrimary={EyeOutlined}
            color="primary.main"
            bgcolor="primary.lighter"
            isLoading={loading}
          />
        </Grid>
      </Grid>
    </PageLayout>
  )
}

export default CompanyStatsPage;