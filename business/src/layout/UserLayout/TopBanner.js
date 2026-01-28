import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import useConfig from 'hooks/useConfig';

import Marquee from "react-fast-marquee";

// ==============================|| MAIN LAYOUT ||============================== //

const TopBanner = (props) => {
  const { mode, onChangeMode } = useConfig();   //const mode = config.mode ?? 'light'
  const userDataStore = useSelector((x) => x.auth);
  const dispatch = useDispatch();
  const theme = useTheme();

  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <div className="top-banner-container">
      <div className="top-banner-box">
        {
          (matchDownMD) ? (
            <>
              <Marquee gradient={false}>{userDataStore?.bannerMessage}</Marquee>
            </>
          ) : (
            <>
              {userDataStore?.bannerMessage}
            </>
          )
        }
      </div>
    </div>
  )
}

export default TopBanner;
