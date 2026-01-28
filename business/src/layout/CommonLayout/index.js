import "assets/global/css/base.css";
import "assets/global/css/global.css";
import "assets/global/css/custom.css";

import "assets/home/css/custom.css";
import "assets/home/css/desktop.css";
import "assets/home/css/mobile.css";
import "assets/user/css/custom.css";
import "assets/user/css/desktop.css";
import "assets/user/css/mobile.css";

import "assets/admin/css/custom.css";
import "assets/admin/css/desktop.css";
import "assets/admin/css/mobile.css";

import PropTypes from 'prop-types';
import { lazy, Suspense, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// material-ui
import { Box, Container, Toolbar } from '@mui/material';

// project import
import ComponentLayout from './ComponentLayout';
import { openComponentDrawer } from 'store/reducers/menu';

// material-ui
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import useConfig from 'hooks/useConfig';
import ThemeCustomization from "themes";
import CustomThemeLayout from "./CustomThemeLayout";
import { useSearchParams } from "react-router-dom";

const Header = lazy(() => import('./Header'));
const AuthHeader = lazy(() => import('./AuthHeader'));
const FooterBlock = lazy(() => import('./FooterBlock'));

// ==============================|| Loader ||============================== //

const LoaderWrapper = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 2001,
  width: '100%',
  '& > * + *': {
    marginTop: theme.spacing(2)
  }
}));

const Loader = () => (
  <LoaderWrapper>
    <LinearProgress color="primary" />
  </LoaderWrapper>
);

// ==============================|| MINIMAL LAYOUT ||============================== //

const CommonLayout = (props) => {
  const { layout = 'blank' } = props
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  // const [searchParams, setSearchParams] = useSearchParams()
  // const v = searchParams.get("v") ?? '1'
  // console.log("version:::::", v)

  const { affiliate_code } = useParams()
  console.log(`affiliate_code:::`, affiliate_code)

  const { mode, onChangeMode } = useConfig();   //const mode = config.mode ?? 'light'

  // useEffect(()=>{
  //   if(mode !== "dark") {
  //     onChangeMode('dark')
  //   }
  // }, [])

  const dispatch = useDispatch();
  const menu = useSelector((state) => state.menu);
  const { componentDrawerOpen } = menu;

  const handleDrawerOpen = () => {
    dispatch(openComponentDrawer({ componentDrawerOpen: !componentDrawerOpen }));
  };

  return (
    <ThemeCustomization mode={`${mode}`}>
      <CustomThemeLayout>
        <Box className={`home-layout common-layout ${mode}-layout ${matchDownSM ? 'matchDownSM' : ''}`}>
          {(layout === 'landing' || layout === 'simple') && (
            <Suspense fallback={<Loader />}>
              <Header layout={layout} />
              <Outlet />
              <FooterBlock isFull={layout === 'landing'} />
            </Suspense>
          )}
          {(layout === 'auth') && (
            <Suspense fallback={<Loader />}>
              {/* <AuthHeader layout={layout} /> */}
              <Outlet />
              {/* <FooterBlock isFull={layout === 'landing'} /> */}
            </Suspense>
          )}

          {layout === 'component' && (
            <Suspense fallback={<Loader />}>
              <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
                <Header handleDrawerOpen={handleDrawerOpen} layout="component" />
                <Toolbar sx={{ my: 2 }} />
                <ComponentLayout handleDrawerOpen={handleDrawerOpen} componentDrawerOpen={componentDrawerOpen} />
              </Container>
            </Suspense>
          )}


          {(layout === 'funnel') && (
            <Suspense fallback={<Loader />}>
              {
                (props.showHeader) ? (
                  <>
                    <Header layout={`landing`} />
                  </>
                ) : (
                  <></>
                )
              }
              <Outlet />
              <FooterBlock isFull={layout === 'landing'} />
            </Suspense>
          )}

          {layout === 'blank' && <Outlet />}
        </Box>
      </CustomThemeLayout>
    </ThemeCustomization>
  )
}

CommonLayout.propTypes = {
  layout: PropTypes.string
}

export default CommonLayout;
