import { useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid, Stack, Select, MenuItem, Box, Button } from '@mui/material';

// assets
import { useSelector } from 'react-redux';
import { curl_post } from 'utils/misc';

import { DownloadOutlined } from '@ant-design/icons';
import { urlUserExportRankStatsPageData } from 'services/constants';
import StatsFieldGroupBox from './StatsFieldGroupBox';

const StatsBox = (props) => {
  const { showDateOption, showExportButton, showProgressBar } = props
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

  const dateOptionList = [
    {
      value: 'today',
      text: 'Today'
    },
    {
      value: 'last_7',
      text: 'Last 7 days'
    },
    {
      value: 'last_30',
      text: 'Last 30 days'
    },
    {
      value: 'last_90',
      text: 'Last 90 days'
    },
    {
      value: 'ytd',
      text: 'YTD (Year To Date)'
    },
    {
      value: 'lifetime',
      text: 'Lifetime'
    }
  ]

  const [dateOption, setDateOption] = useState(dateOptionList[dateOptionList.length - 1]['value'])
  const onChangeDateRangeOption = (e) => {
    const v = e.target.value
    console.log(`onChangeDateRangeOption v:::`, v)
    setDateOption(v)
  }

  const onClickExport = async () => {
    const payload = {
      token: userDataStore?.token,
      dateOption: dateOption
    }
    curl_post(urlUserExportRankStatsPageData, payload, 'post')
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <Stack direction="row" justifyContent={`space-between`} alignItems={`center`}>
            {
              showDateOption ? (
                <>
                  <Select size="small" labelId="demo-simple-select-label" id="demo-simple-select" value={dateOption} onChange={(v) => onChangeDateRangeOption(v)}>
                    {
                      dateOptionList.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </>
              ) : (
                <div></div>
              )
            }

            {
              (showExportButton) ? (
                <>
                  <Button variant="contained" size="small" onClick={() => onClickExport()} startIcon={<DownloadOutlined />}>Export</Button>
                </>
              ) : (
                <div></div>
              )
            }
          </Stack>
        </Grid>
        <Grid item xs={12} md={12}>
          <StatsFieldGroupBox
            showProgressBar={showProgressBar}
            dateOption={dateOption}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default StatsBox;
