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
  Typography} from '@mui/material';

// project import
import IconButton from 'components/@extended/IconButton';

// assets
import { ArrowLeftOutlined } from '@ant-design/icons';
import { BASE_FRONT_URL } from 'config/constants';
import ElevationScroll from './ElevationScroll';

// ==============================|| COMPONENTS - APP BAR ||============================== //

const AuthHeader = ({ handleDrawerOpen, layout = 'landing', ...others }) => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerToggle, setDrawerToggle] = useState(false);

  /** Method called on multiple components with different event types */
  const drawerToggler = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerToggle(open);
  };

  return (
    <ElevationScroll layout={layout} {...others}>
      <AppBar sx={{ bgcolor: '#ffffff', color: theme.palette.text.primary, boxShadow: 'none' }}>
        <Container disableGutters={matchDownMd}>
          <Toolbar sx={{ px: { xs: 1.5, md: 0, lg: 0 }, py: 2 }}>
            <Stack direction="row" sx={{ flexGrow: 1, display: { xs: 'block', md: 'block' } }} alignItems="center">
              <Typography component="div" sx={{ textAlign: 'left', display: 'inline-block' }}>
                {/* <Logo reverse href={BASE_FRONT_URL} /> */}
                <a href={BASE_FRONT_URL}>
                  {/* <ArrowLeftOutlined /> */}
                  {/* <LeftCircleOutlined /> */}
                  <IconButton shape="rounded" variant="contained" className="btn-main">
                    <ArrowLeftOutlined />
                  </IconButton>
                </a>
              </Typography>
            </Stack>
            <div></div>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

AuthHeader.propTypes = {
  handleDrawerOpen: PropTypes.func,
  layout: PropTypes.string
};

export default AuthHeader;
