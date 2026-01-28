import { useMemo } from 'react';

// material-ui
import { Box, useMediaQuery } from '@mui/material';

// project import
import useConfig from 'hooks/useConfig';
import Search from './Search';
import Message from './Message';
import Profile from './Profile';
import Localization from './Localization';
import Notification from './Notification';
import Customization from './Customization';
import MobileSection from './MobileSection';
import MegaMenuSection from './MegaMenuSection';
import NavDateRangePicker from './NavDateRangePicker';
import ThemeSwitcher from 'layout/CommonLayout/ThemeSwitcher';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { i18n } = useConfig();
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navDateRangePicker = useMemo(() => <NavDateRangePicker />, []);
  return (
    <>
      {!matchesXs && <Search />}
      {/* {navDateRangePicker} */}
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}
      <Notification />
      <ThemeSwitcher />

      {/* <Customization /> */}
      {/* {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />} */}
    </>
  );
};

export default HeaderContent;
