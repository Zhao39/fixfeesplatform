import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Typography, Tabs, Tab } from '@mui/material';

// assets
import { useSelector } from 'react-redux';
import { curl_post, get_utc_timestamp_ms } from 'utils/misc';

import { urlUserExportProcessorResidualsData, urlUserExportRankStatsPageData } from 'services/constants';
import ResidualReportTable from './ResidualReportTable';
import { apiUserGetProcessorResidualsData, apiUserGetResidualsPageData } from 'services/userResidualsService';
import { showToast } from 'utils/utils';

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

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const ProcessorResidaulBox = (props) => {
  const { processorResidualItem, year, month, refreshTimestamp, setRefreshTimestamp, loading, totalProcessorResidualData, setTotalProcessorResidualData } = props
  const processor_id = processorResidualItem?.sum?.processor_id

  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  const [apiLoading, setApiLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [hideNullMerchants, setHideNullMerchants] = useState(true)

  const defaultProcessorResidualData = {
    sum: {},
    residualMonthReports: []
  }
  const [processorResidualData, setProcessorResidualData] = useState(defaultProcessorResidualData)

  useEffect(() => {
    if (processor_id) {
      loadResidualSummaryWithMerchants()
    }
  }, [processor_id, year, month, searchText, hideNullMerchants, refreshTimestamp])

  const loadResidualSummaryWithMerchants = async () => {
    setApiLoading(true)
    const payload = {
      year: year,
      month: month,
      processor_id: processor_id,
      search: searchText,
      hide_null_merchants: hideNullMerchants ? 1 : 0
    }
    const apiRes = await apiUserGetProcessorResidualsData(payload)
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setProcessorResidualData({ ...apiRes['data'].processorResidualData })
      const currentTotalProcessorResidualData = {...totalProcessorResidualData.current}
      currentTotalProcessorResidualData[processor_id] = [...apiRes['data'].processorResidualData.residualMonthReports]
      setTotalProcessorResidualData(currentTotalProcessorResidualData)
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [tabValue, setTabValue] = useState(0)
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const onChangeSearchText = (e) => {
    console.log(`onChangeSearchText`, e)
    setSearchText(e.target.value)
  }

  const onChangeHideNullMerchants = (e) => {
    console.log(`onChangeHideNullMerchants`, e)
    setHideNullMerchants(e.target.checked)
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const onClickExport = async () => {
    const payload = {
      token: userDataStore?.token,
      year: year,
      month: month,
      processor_id: processor_id,
      search: searchText,
      hide_null_merchants: hideNullMerchants ? 1 : 0
    }
    curl_post(urlUserExportProcessorResidualsData, payload, 'post')
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Box>
      <Box sx={{ py: 2 }}>
        <Typography variant="h5">{processorResidualItem?.sum?.name}</Typography>
      </Box>
      <>
        <ResidualReportTable
          processorResidualItem={processorResidualItem}
          processorResidualData={processorResidualData}
          loading={apiLoading}
          onClickExport={() => onClickExport()}
          searchText={searchText}
          onChangeSearchText={(v) => onChangeSearchText(v)}
          hideNullMerchants={hideNullMerchants}
          onChangeHideNullMerchants={(e) => onChangeHideNullMerchants(e)}
          processor_id={processor_id}
        />
      </>

      {/* <Box>
        <Tabs value={tabValue} onChange={(e, v) => handleTabChange(e, v)} aria-label="basic tabs">
          <Tab label="Summary" {...a11yProps(0)} />
          <Tab label="Profitability" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          <>
            <ResidualReportTable
              processorResidualItem={processorResidualItem}
              processorResidualData={processorResidualData}
              loading={apiLoading}
              onClickExport={() => onClickExport()}
              searchText={searchText}
              onChangeSearchText={(v) => onChangeSearchText(v)}
              hideNullMerchants={hideNullMerchants}
              onChangeHideNullMerchants={(e) => onChangeHideNullMerchants(e)}
            />
          </>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">
            TEST
          </Typography>
        </TabPanel>
      </Box> */}
    </Box>
  )
}

export default ProcessorResidaulBox;
