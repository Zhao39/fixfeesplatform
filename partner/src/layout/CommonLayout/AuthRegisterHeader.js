import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';

// material-ui
import AppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Container,
  Stack,
  Toolbar,
  Typography,
  useScrollTrigger
} from '@mui/material';

// project import
import IconButton from 'components/@extended/IconButton';

// assets
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import { BASE_FRONT_URL } from 'config/constants';
import ElevationScroll from './ElevationScroll';

// ==============================|| COMPONENTS - APP BAR ||============================== //

const AuthRegisterHeader = ({ handleDrawerOpen, layout = 'landing', ...others }) => {
  const theme = useTheme();
  const history = useNavigate();
  const location = useLocation();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerToggle, setDrawerToggle] = useState(false);

  /** Method called on multiple components with different event types */
  const drawerToggler = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerToggle(open);
  };

  const onClickGoPreviousStep = () => {
    //console.log("location.key::::", location.key)
    if (location.key !== 'default') {
      history(-1)
    } else {
      console.log("can not go to previous route")
      window.location.href = BASE_FRONT_URL
    }
  }

  return (
    <ElevationScroll layout={layout} {...others}>
      <AppBar sx={{ bgcolor: '#ffffff', color: theme.palette.text.primary, boxShadow: 'none' }}>
        <Container disableGutters={matchDownMd}>
          <Toolbar sx={{ px: { xs: 1.5, md: 0, lg: 0 }, py: 2 }}>
            <Stack direction="row" sx={{ flexGrow: 1, display: { xs: 'block', md: 'block' } }} alignItems="center">
              <Typography component="div" sx={{ textAlign: 'left', display: 'inline-block' }}>
                <IconButton shape="rounded" variant="contained" className="btn-main" onClick={() => onClickGoPreviousStep()}>
                  <ArrowLeftOutlined />
                </IconButton>
              </Typography>
            </Stack>
            <div></div>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

AuthRegisterHeader.propTypes = {
  handleDrawerOpen: PropTypes.func,
  layout: PropTypes.string
};

export default AuthRegisterHeader;
