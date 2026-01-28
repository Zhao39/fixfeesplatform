import { useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Grid, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, Tooltip, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

// assets
import { CopyOutlined } from '@ant-design/icons';
import { showToast } from 'utils/utils';
import { useSelector } from 'react-redux';
import TopPerformersTableBlock from './TopPerformersTableBlock';
import TopPerformersCardTableBlock from './TopPerformersCardTableBlock';
import { apiUserGetDashboardPerformanceData } from 'services/userDashboardService';
import { useEffect } from 'react';
import DateOptionRangePicker from './DateOptionRangePicker';

const DashboardSummaryBlock = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  const { dateOption, setDateOption, hidePeriod } = props
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);

  const [pageData, setPageData] = useState()
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async () => {
    const payload = {
      dateOption: dateOption
    }
    setApiLoading(true)
    const apiRes = await apiUserGetDashboardPerformanceData(payload)
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setPageData(apiRes['data'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
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

  // const [dateOption, setDateOption] = useState(dateOptionList[2]['value'])

  useEffect(() => {
    loadPageData()
  }, [dateOption])

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <MainCard title={
            <>
              <DateOptionRangePicker
                dateOptionList={dateOptionList}
                hidePeriod={hidePeriod}
                dateOption={dateOption}
                setDateOption={setDateOption}
              />
            </>
          } content={false}>
            <TopPerformersTableBlock pageData={pageData} loading={apiLoading} />
          </MainCard>
        </Grid>
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
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
    </Box>
  )
}

export default DashboardSummaryBlock;
