import PropTypes from 'prop-types';

// material-ui
import { Grid, Stack, Typography, Select, MenuItem } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { useEffect, useState } from 'react';



// ============================|| ROUND ICON CARD ||============================ //

const RoundIconCard = ({ primary, secondary, content, iconPrimary, color, bgcolor, dateDrpView }) => {
  const IconPrimary = iconPrimary;
  const primaryIcon = iconPrimary ? <IconPrimary fontSize="large" /> : null;

  let isDateDrpView = dateDrpView || false;

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


  return (
    <MainCard sx={{ position: 'static' }}>
      {
        (isDateDrpView) ? (
          <Grid container alignItems="center" spacing={0} justifyContent="flex-start">
            <Grid item>
              <Stack direction="row">
                <Select size="small" labelId="demo-simple-select-label" id="demo-simple-select" value={dateOption} onChange={(v) => onChangeDateRangeOption(v)}>
                  {
                    dateOptionList.map((item, index) => {
                      return (
                        <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
                      )
                    })
                  }
                </Select>
              </Stack>
            </Grid>
          </Grid>
        ) : (<></>)
      }

      <Grid container alignItems="center" spacing={0} justifyContent="space-between">
        <Grid item>
          <Stack spacing={1}>
            <Typography variant="p" color="textSecondary">
              {primary}
            </Typography>
            <Typography variant="h3">
              {
                secondary
              }
            </Typography>
            {
              (content) ? (
                <Typography variant="subtitle2" color="inherit">
                  {content}
                </Typography>
              ) : (
                <></>
              )
            }
          </Stack>
        </Grid>
        <Grid item>
          <IconButton disabled sx={{ bgcolor, color, position: 'static', '&.MuiIconButton-root.Mui-disabled': { bgcolor: bgcolor, color: color }, '& .MuiSvgIcon-root': { fontSize: '1.5rem' } }} size="large">
            {primaryIcon}
          </IconButton>
        </Grid>
      </Grid>
    </MainCard>
  );
};

RoundIconCard.propTypes = {
  primary: PropTypes.string,
  secondary: PropTypes.any,
  content: PropTypes.string,
  iconPrimary: PropTypes.object,
  color: PropTypes.string,
  bgcolor: PropTypes.string
};

export default RoundIconCard;
