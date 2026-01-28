import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Button, Chip, Grid, Stack, Typography, Select, Divider } from '@mui/material';
import MainCard from 'components/MainCard';

// assets
import { showToast } from 'utils/utils';
import { get_data_value, get_utc_timestamp_ms, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import TopPerformersCardTableBlock from '../dashboard/TopPerformersCardTableBlock';
import { apiUserGetDashboardPerformanceData } from 'services/userDashboardService';
import { apiUserGetMerchantData } from 'services/userMerchantService';
import DateOptionRangePicker from '../dashboard/DateOptionRangePicker';
import TopPerformersTableBlock from '../dashboard/TopPerformersTableBlock';
import MerchantListTableBlock from './inc/MerchantListTableBlock';
import IRISMerchantListTableBlock from './inc/IRISMerchantListTableBlock';

const MerchantListPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);

  const [pageData, setPageData] = useState()
  const [merchantData, setMerchantData] = useState()
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async () => {
    const payload = {
      dateOption: dateOption
    }
    setApiLoading(true)
    const apiRes = await apiUserGetDashboardPerformanceData(payload)
    console.log(apiRes)
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setPageData(apiRes['data'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  const loadIRISMerchantData = async () => {
    // const payload = {
    //   dateOption: dateOption
    // }
    const apiRes = await apiUserGetMerchantData({})

    console.log("merchantData", apiRes)
    setApiLoading(false)

    setMerchantData(apiRes['data'])
  }

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

  useEffect(() => {
    loadPageData()
    loadIRISMerchantData()
  }, [dateOption])

  return (
    <PageLayout title="Merchants" cardType="">
      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <div style={{ display: 'block' }}>
            <MainCard title={
              <>
                <DateOptionRangePicker
                  dateOptionList={dateOptionList}
                  dateOption={dateOption}
                  setDateOption={setDateOption}
                />
              </>
            } content={false}>
              <MerchantListTableBlock pageData={pageData} loading={apiLoading} />
            </MainCard>
          </div>
        </Grid>

        <Grid item xs={12} md={12}>
          <Divider />
        </Grid>

        <Grid item xs={12} md={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <MainCard
                title={
                  <>
                    <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`}>
                      <Typography>Top Performers By Card Type</Typography>
                      <div style={{ visibility: 'hidden' }}>
                        <Select size="small"></Select>
                      </div>
                    </Stack>
                  </>
                }
                content={false}>
                <TopPerformersCardTableBlock pageData={pageData} loading={apiLoading} />
              </MainCard>
            </Grid>
            <Grid item xs={12} md={8}>
              <MainCard
                title={
                  <>
                    <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`}>
                      <Typography>Portfolio Totals By Card Type</Typography>
                      <div style={{ visibility: 'hidden' }}>
                        <Select size="small"></Select>
                      </div>
                    </Stack>
                  </>
                }
                content={false}>
                <TopPerformersCardTableBlock pageData={pageData} loading={apiLoading} />
              </MainCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={12}>
          <IRISMerchantListTableBlock pageData={merchantData} loading={apiLoading} />
        </Grid>

      </Grid>
    </PageLayout>
  )
}

export default MerchantListPage;
