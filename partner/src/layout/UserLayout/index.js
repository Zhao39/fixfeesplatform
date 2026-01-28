import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Container, Toolbar } from '@mui/material';

// project import
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import navigation from 'menu-items';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { openDrawer } from 'store/reducers/menu';
import ThemeCustomization from "themes";
import useConfig from 'hooks/useConfig';
import config from '../../config';
import CustomThemeLayout from 'layout/CommonLayout/CustomThemeLayout';
import TopBanner from './TopBanner';
import { useLocation } from 'react-router-dom';
import AutoRefresh from 'components/AutoRefresh/AutoRefresh';

// ==============================|| MAIN LAYOUT ||============================== //

const UserLayout = () => {
  const { mode, onChangeMode } = useConfig();   //const mode = config.mode ?? 'light'

  // useEffect(()=>{
  //   if(mode !== "dark") {
  //     onChangeMode('dark')
  //   }
  // }, [])

  const userDataStore = useSelector((x) => x.auth);

  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('xl'));

  const { container, miniDrawer } = useConfig();
  const dispatch = useDispatch();

  const menu = useSelector((state) => state.menu);
  const { drawerOpen } = menu;

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      setOpen(!matchDownLG);
      dispatch(openDrawer({ drawerOpen: !matchDownLG }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownLG]);

  useEffect(() => {
    if (open !== drawerOpen) setOpen(drawerOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  // const [pageLoaded, setPageLoaded] = useState(false)
  // const pageTimestamp = useSelector((state) => state.page.pageTimestamp);
  // useEffect(() => {
  //   refreshPageLoad()
  // }, [pageTimestamp])

  // const refreshPageLoad = () => {
  //   console.log("refreshPageLoad:::", pageTimestamp)
  //   const timeoutStep = pageTimestamp > 0 ? 700 : 0
  //   setPageLoaded(false)
  //   setTimeout(()=>{
  //     setPageLoaded(true)
  //   }, timeoutStep)
  // }

  const bannerLayoutClass = () => {
    let layoutClassName = "no-banner-layout"
    if (userDataStore?.bannerMessage) {
      layoutClassName = "active-banner-layout"
    } else {
      layoutClassName = "no-banner-layout"
    }
    return layoutClassName
  }

  //const location = useLocation();
  const backgroundStyle = '' // location.pathname === '/user/leads/pipeline-list' ? 'linear-gradient(180deg, #0000 2%, #ffff 95%)' : ''; // Default background

  return (
    <ThemeCustomization mode={`${mode}`}>
      <CustomThemeLayout>
        <Box className={`user-layout ${mode}-layout ${bannerLayoutClass()}`} sx={{ display: 'flex', width: '100%' }}>
          <TopBanner />
          <Header open={open} handleDrawerToggle={handleDrawerToggle} />
          <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />
          <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 }, background: backgroundStyle }}>
            <Toolbar />
            {container && (
              <Container
                maxWidth="xl"
                sx={{ px: { xs: 0, sm: 2 }, position: 'relative', minHeight: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}
              >
                <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />
                <Outlet />
                <Footer />
              </Container>
            )}
            {!container && (
              <Box sx={{ position: 'relative', minHeight: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}>
                <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />
                <Outlet />
                <Footer />
              </Box>
            )}
          </Box>
        </Box>
        
        <AutoRefresh />

      </CustomThemeLayout>
    </ThemeCustomization>

  );
};

export default UserLayout;
