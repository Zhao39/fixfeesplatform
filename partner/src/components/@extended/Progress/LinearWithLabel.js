import PropTypes from 'prop-types';

// material-ui
import { Box, LinearProgress, Typography } from '@mui/material';
import { is_null } from 'utils/misc';

// ==============================|| PROGRESS - LINEAR WITH LABEL ||============================== //

export default function LinearWithLabel({ value, showLabel = true, ...others }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: showLabel ? 1 : 0 }}>
        <LinearProgress variant="determinate" value={value} {...others} />
      </Box>
      {
        (showLabel) ? (
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</Typography>
          </Box>
        ) : (
          <></>
        )
      }
    </Box>
  )
}