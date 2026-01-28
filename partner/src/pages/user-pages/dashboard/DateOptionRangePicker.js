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
import { apiUserGetDashboardPerformanceData } from 'services/userDashboardService';
import { useEffect } from 'react';

const DateOptionRangePicker = (props) => {
  const { dateOption, setDateOption, dateOptionList, hidePeriod } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);

  const onChangeDateRangeOption = (e) => {
    const v = e.target.value
    console.log(`onChangeDateRangeOption v:::`, v)
    setDateOption(v)
  }

  return (
    <>
      <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`}>
        <Typography>Top Performers</Typography>

        {!hidePeriod && <Select size="small" labelId="demo-simple-select-label" id="demo-simple-select" value={dateOption} onChange={(v) => onChangeDateRangeOption(v)}>
          {
            dateOptionList.map((item, index) => {
              return (
                <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
              )
            })
          }
        </Select>}
      </Stack>
    </>
  )
}

export default DateOptionRangePicker;
