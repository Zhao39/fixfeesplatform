import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid, Stack, Select, MenuItem, Box, Typography, Button, Tabs, Tab } from '@mui/material';
import moment from 'moment';

// assets
import { showToast } from 'utils/utils';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { ArrowLeftOutlined, ArrowRightOutlined, DollarOutlined, EyeOutlined, HomeFilled, SyncOutlined } from '@ant-design/icons';
import { addZeroPrefix, curl_post, getNextMonthYear, getPreviousMonthYear, get_data_value, get_utc_timestamp_ms, priceFormat } from 'utils/misc';
import { DownloadOutlined } from '@ant-design/icons';
import { urlUserExportRankStatsPageData } from 'services/constants';
import { apiUserGetResidualsPageData } from 'services/userResidualsService';


const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;


const YearMonthPicker = (props) => {
  const {loadPageData, monthOption, setMonthOption, yearOption, setYearOption, refreshTimestamp, setRefreshTimestamp} = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  const monthOptionList = [
    {
      value: '1',
      text: 'January'
    },
    {
      value: '2',
      text: 'February'
    },
    {
      value: '3',
      text: 'March'
    },
    {
      value: '4',
      text: 'April'
    },
    {
      value: '5',
      text: 'May'
    },
    {
      value: '6',
      text: 'June'
    },
    {
      value: '7',
      text: 'July'
    },
    {
      value: '8',
      text: 'August'
    },
    {
      value: '9',
      text: 'September'
    },
    {
      value: '10',
      text: 'October'
    },
    {
      value: '11',
      text: 'November'
    },
    {
      value: '12',
      text: 'December'
    }
  ]

  const onChangeMonthRangeOption = (e) => {
    const v = e.target.value
    console.log(`onChangeMonthRangeOption v:::`, v)
    const nextMoment = moment(`${yearOption}-${addZeroPrefix(v)}-01`, 'YYYY-MM-DD')
    if (nextMoment > moment()) {
      return false
    }
    setMonthOption(v)
    loadPageData({ month: v })
  }

  const createYearOptionList = () => {
    const yearStep = 3
    const yearList = []
    for (let i = currentYear - yearStep; i <= currentYear; i++) {
      yearList.push(
        {
          value: `${i}`,
          text: `${i}`
        }
      )
    }
    return yearList
  }

  const yearOptionList = createYearOptionList()

  const onChangeYearRangeOption = (e) => {
    const v = e.target.value
    console.log(`onChangeYearRangeOption v:::`, v)
    const nextMoment = moment(`${v}-${addZeroPrefix(monthOption)}-01`, 'YYYY-MM-DD')
    if (nextMoment > moment()) {
      return false
    }
    setYearOption(v)
    loadPageData({ year: v })
  }

  const currentMoment = moment(`${yearOption}-${addZeroPrefix(monthOption)}-01`, 'YYYY-MM-DD')

  const goPreviousMonthYear = () => {
    const newYear = `${getPreviousMonthYear(currentMoment, "YYYY")}`
    const newMonth = `${Number(getPreviousMonthYear(currentMoment, "MM"))}`
    const nextMoment = moment(`${newYear}-${addZeroPrefix(newMonth)}-01`, 'YYYY-MM-DD')
    if (nextMoment > moment()) {
      return false
    }
    const minYear = Number(yearOptionList[0]['value'])
    if (nextMoment.format('YYYY') < minYear) {
      return false
    }
    setYearOption(newYear)
    setMonthOption(newMonth)
    loadPageData({ year: newYear, month: newMonth })
  }
  const goNextMonthYear = () => {
    const newYear = `${getNextMonthYear(currentMoment, "YYYY")}`
    const newMonth = `${Number(getNextMonthYear(currentMoment, "MM"))}`
    const nextMoment = moment(`${newYear}-${addZeroPrefix(newMonth)}-01`, 'YYYY-MM-DD')
    if (nextMoment > moment()) {
      return false
    }
    setYearOption(newYear)
    setMonthOption(newMonth)
    loadPageData({ year: newYear, month: newMonth })
  }
  const refreshData = () => {
    loadPageData()
    setRefreshTimestamp(get_utc_timestamp_ms())
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <>
      <Grid item container xs={12} md={12} spacing={1} justifyContent={`space-between`}>
        <Grid item>
          <Button variant="contained" size="small" startIcon={<ArrowLeftOutlined />} onClick={() => goPreviousMonthYear()}>
            {getPreviousMonthYear(currentMoment)}
          </Button>
        </Grid>
        <Grid item>
          <Stack direction="row" justifyContent={`center`} alignItems={`center`} style={{ width: '100%' }}>
            <Stack direction="row" justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
              <Select size="small" labelId="demo-simple-select-label" id="demo-simple-select" value={monthOption} onChange={(v) => onChangeMonthRangeOption(v)}>
                {
                  monthOptionList.map((item, index) => {
                    return (
                      <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
                    )
                  })
                }
              </Select>
              <Select size="small" labelId="demo-simple-select-label" id="demo-simple-select" value={yearOption} onChange={(v) => onChangeYearRangeOption(v)}>
                {
                  yearOptionList.map((item, index) => {
                    return (
                      <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
                    )
                  })
                }
              </Select>
              <Button variant="contained" size="small" startIcon={<SyncOutlined />} onClick={() => refreshData()}>Refresh</Button>
            </Stack>
          </Stack>
        </Grid>
        <Grid item>
          <Button variant="contained" size="small" endIcon={<ArrowRightOutlined />} onClick={() => goNextMonthYear()}>
            {getNextMonthYear(currentMoment)}
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default YearMonthPicker;
