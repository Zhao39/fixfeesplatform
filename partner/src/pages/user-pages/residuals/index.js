import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid, Stack, Select, MenuItem, Box, Typography, Button, Tabs, Tab } from '@mui/material';
import SkeletonCard from 'components/cards/SkeltonCard';
import moment from 'moment';

// assets
import { showToast } from 'utils/utils';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { ArrowLeftOutlined, ArrowRightOutlined, DollarOutlined, EyeOutlined, HomeFilled, SyncOutlined } from '@ant-design/icons';
import { addZeroPrefix, curl_post, getNextMonthYear, getPreviousMonthYear, get_data_value, get_utc_timestamp, get_utc_timestamp_ms, priceFormat } from 'utils/misc';
import { RANK_TYPE_TEXT, TIER_TYPE_TEXT } from 'config/constants';

import LinearWithLabel from 'components/@extended/Progress/LinearWithLabel';
import IconButton from 'components/@extended/IconButton';
import { DownloadOutlined } from '@ant-design/icons';
import { apiUserGetRankStatsData } from 'services/userRankStatsService';
import { urlUserExportRankStatsPageData, urlUserExportResidualsPageData } from 'services/constants';
import IRISMerchantListTableBlock from './inc/IRISMerchantListTableBlock';
import { apiUserGetResidualsPageData } from 'services/userResidualsService';
import YearMonthPicker from './inc/YearMonthPicker';
import ResidualReportTable from './inc/ResidualReportTable';
import ProcessorResidaulBox from './inc/ProcessorResidaulBox';
import MainCard from 'components/MainCard';
import GrandTotalBox from './inc/GrandTotalBox';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

const ResidualsPage = (props) => {
  const momentTwoMonthsAgo = moment().subtract(2, 'months');
  const currentYear = Number(momentTwoMonthsAgo.format('YYYY'));
  const currentMonth = Number(momentTwoMonthsAgo.format('MM'));

  const [allProcessorResidualData, setAllProcessorResidualData] = useState({})
  const totalProcessorResidualData = useRef({})
  const setTotalProcessorResidualData = (data) => {
    console.log(`setTotalProcessorResidualData::::`, data)
    totalProcessorResidualData.current = data
    setAllProcessorResidualData(data)
  }

  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  const defaultPageData = {}
  const [pageData, setPageData] = useState(defaultPageData)
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async (params = {}) => {
    setApiLoading(true)
    const payload = {
      year: yearOption,
      month: monthOption,
      ...params
    }
    const apiRes = await apiUserGetResidualsPageData(payload)
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setPageData({ ...apiRes['data'] })
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])
  const [monthOption, setMonthOption] = useState(`${currentMonth}`)
  const [yearOption, setYearOption] = useState(`${currentYear}`)
  const [refreshTimestamp, setRefreshTimestamp] = useState(get_utc_timestamp_ms())

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const onClickExport = async () => {
    const payload = {
      token: userDataStore?.token,
      year: yearOption,
      month: monthOption
    }
    curl_post(urlUserExportResidualsPageData, payload, 'post')
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <PageLayout title="Residuals" cardType="">
      <Grid container spacing={1}>
        <Grid item xs={12} md={12}>
          <Stack direction="row" justifyContent={`space-between`} alignItems={`center`}>
            <div></div>
            <Button variant="contained" size="small" onClick={() => onClickExport()} startIcon={<DownloadOutlined />}>Export All</Button>
          </Stack>
        </Grid>
        <Grid item container xs={12} md={12} spacing={1} justifyContent={`space-between`}>
          <>
            <YearMonthPicker
              monthOption={monthOption}
              setMonthOption={setMonthOption}
              yearOption={yearOption}
              setYearOption={setYearOption}
              loadPageData={(v) => loadPageData(v)}
              refreshTimestamp={refreshTimestamp}
              setRefreshTimestamp={setRefreshTimestamp}
            />
          </>
        </Grid>
        <Grid item xs={12} md={12}>
          <Box sx={{ pt: 2 }}>
            <Stack direction={`column`} spacing={4}>
              {
                (apiLoading) ? (
                  <>
                    <MainCard>
                      <Stack direction={`row`} justifyContent={`center`}>
                        <Typography variant="p">Loading...</Typography>
                      </Stack>
                    </MainCard>
                  </>
                ) : (
                  <>
                    {
                      (pageData.processorResidual && pageData.processorResidual.length > 0) ? (
                        <>
                          {
                            pageData.processorResidual.map((item, index) => {
                              return (
                                <Box key={index}>
                                  <ProcessorResidaulBox
                                    processorResidualItem={item}
                                    month={monthOption}
                                    year={yearOption}
                                    loading={apiLoading}
                                    refreshTimestamp={refreshTimestamp}
                                    setRefreshTimestamp={setRefreshTimestamp}
                                    totalProcessorResidualData={totalProcessorResidualData}
                                    setTotalProcessorResidualData={(data) => setTotalProcessorResidualData(data)}
                                  />
                                </Box>
                              )
                            })
                          }
                        </>
                      ) : (
                        <>
                          <MainCard>
                            <Stack direction={`row`} justifyContent={`center`}>
                              <Typography variant="p" align="center">No data found</Typography>
                            </Stack>
                          </MainCard>
                        </>
                      )
                    }
                  </>
                )
              }
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} md={12}>
          <Box sx={{ pt: 4 }}>
            <Stack direction={`column`} spacing={4}>
              {
                (apiLoading) ? (
                  <>
                    <MainCard>
                      <Stack direction={`row`} justifyContent={`center`}>
                        <Typography variant="p">Loading...</Typography>
                      </Stack>
                    </MainCard>
                  </>
                ) : (
                  <>
                    {
                      (pageData.processorResidual && pageData.processorResidual.length > 0) ? (
                        <>
                          <GrandTotalBox
                            processorResidual={pageData.processorResidual}
                            month={monthOption}
                            year={yearOption}
                            loading={apiLoading}
                            refreshTimestamp={refreshTimestamp}
                            setRefreshTimestamp={setRefreshTimestamp}
                            totalProcessorResidualData={allProcessorResidualData}
                          />
                        </>
                      ) : (
                        <>
                        </>
                      )
                    }
                  </>
                )
              }
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </PageLayout>
  )
}

export default ResidualsPage;
