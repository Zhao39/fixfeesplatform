import * as React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  useScrollTrigger
} from '@mui/material';


// elevation scroll
const ElevationScroll = (props) => {
  const { layout, children, window } = props
  const theme = useTheme();
  // const theme = useTheme();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window ? window() : undefined
  });

  const backColorScroll = theme.palette.mode === 'dark' ? '#000000' : '#ffffff'
  const backColor = layout !== 'landing' ? backColorScroll : 'transparent';

  return React.cloneElement(children, {
    style: {
      backgroundColor: trigger ? backColorScroll : backColor
    }
  });
}


export default ElevationScroll;
