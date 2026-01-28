import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Box,
  Container,
  Drawer,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  Button
} from '@mui/material';

// project import
import IconButton from 'components/@extended/IconButton';
import Logo from 'components/logo';

// assets
import { MenuOutlined, LineOutlined } from '@ant-design/icons';
import { BASE_FRONT_URL } from 'config/constants';
import ElevationScroll from './ElevationScroll';
import AnimateButton from 'components/@extended/AnimateButton';

// ==============================|| COMPONENTS - APP BAR ||============================== //

const Header = ({ handleDrawerOpen, layout = 'landing', ...others }) => {
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
            <Stack direction="row" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} alignItems="center">
              <Typography component="div" sx={{ textAlign: 'left', display: 'inline-block' }}>
                <Logo to={`/`} width={220} src="/assets/global/images/logo-h.png" />
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{
                '& .header-link': { px: 1, '&:hover': { color: theme.palette.primary.main } },
                display: { xs: 'none', md: 'block' }
              }}
              spacing={2}
            >
              <Link
                className="header-link"
                color="textPrimary"
                component={RouterLink}
                to="/login"
                underline="none"
              >
                Login
              </Link>

              {
                (layout === "landing") ? (
                  <>
                    {/* <Link
                      className="header-link"
                      color="textPrimary"
                      href="#apply-now-block"
                      underline="none"
                    >
                      Apply Now
                    </Link> */}
                    <Link
                      className="header-link"
                      color="textPrimary"
                      href="#how-it-work-section"
                      underline="none"
                    >
                      What We Do
                    </Link>
                    <Link
                      className="header-link"
                      color="textPrimary"
                      href="#worked-company-section"
                      underline="none"
                    >
                      Case Studies
                    </Link>
                    <Link
                      className="header-link"
                      color="textPrimary"
                      href="#faq-section"
                      underline="none"
                    >
                      FAQ
                    </Link>
                  </>
                ) : (
                  <></>
                )
              }

              <Box sx={{ display: 'inline-block', pl: 1 }}>
                <AnimateButton>
                  <Button
                    component={RouterLink}
                    color="primary"
                    variant="contained"
                    className="btn-main"
                    to="/register"
                  >
                    Get Started
                  </Button>
                </AnimateButton>
              </Box>

            </Stack>
            <Box
              sx={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                display: { xs: 'flex', md: 'none' }
              }}
            >
              <Typography component="div" sx={{ textAlign: 'left', display: 'inline-block' }}>
                <Logo to={`/`} width={200} src="/assets/global/images/logo-h.png" />
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton
                  color="secondary"
                  {...(layout === 'component' ? { onClick: handleDrawerOpen } : { onClick: drawerToggler(true) })}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'secondary.lighter' : 'secondary.light',
                    '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'secondary.lighter' : 'secondary.dark' }
                  }}
                >
                  <MenuOutlined style={{ color: theme.palette.mode === 'dark' ? 'secondary.dark' : 'secondary.dark' }} />
                </IconButton>
              </Stack>
              <Drawer
                anchor="top"
                open={drawerToggle}
                onClose={drawerToggler(false)}
                sx={{ '& .MuiDrawer-paper': { backgroundImage: 'none' } }}
              >
                <Box
                  sx={{
                    width: 'auto',
                    '& .MuiListItemIcon-root': {
                      fontSize: '1rem',
                      minWidth: 28
                    }
                  }}
                  role="presentation"
                  onClick={drawerToggler(false)}
                  onKeyDown={drawerToggler(false)}
                >
                  <List>
                    <Link style={{ textDecoration: 'none' }} component={RouterLink} to="/login">
                      <ListItemButton component="span">
                        <ListItemIcon>
                          <LineOutlined />
                        </ListItemIcon>
                        <ListItemText primary="Login" primaryTypographyProps={{ variant: 'h6', color: 'text.primary' }} />
                      </ListItemButton>
                    </Link>

                    {
                      (layout === "landing") ? (
                        <>
                          <Link style={{ textDecoration: 'none' }} href="#how-it-work-section">
                            <ListItemButton component="span">
                              <ListItemIcon>
                                <LineOutlined />
                              </ListItemIcon>
                              <ListItemText primary="What We Do" primaryTypographyProps={{ variant: 'h6', color: 'text.primary' }} />
                            </ListItemButton>
                          </Link>
                          <Link style={{ textDecoration: 'none' }} href="#worked-company-section">
                            <ListItemButton component="span">
                              <ListItemIcon>
                                <LineOutlined />
                              </ListItemIcon>
                              <ListItemText primary="Case Studies" primaryTypographyProps={{ variant: 'h6', color: 'text.primary' }} />
                            </ListItemButton>
                          </Link>
                          <Link style={{ textDecoration: 'none' }} href="#faq-section">
                            <ListItemButton component="span">
                              <ListItemIcon>
                                <LineOutlined />
                              </ListItemIcon>
                              <ListItemText primary="FAQ" primaryTypographyProps={{ variant: 'h6', color: 'text.primary' }} />
                            </ListItemButton>
                          </Link>
                        </>
                      ) : (
                        <></>
                      )
                    }

                    <Link
                      style={{ textDecoration: 'none' }}
                      component={RouterLink}
                      to="/register"
                    // target="_blank"
                    >
                      <ListItemButton component="span">
                        <ListItemIcon>
                          <LineOutlined />
                        </ListItemIcon>
                        <ListItemText primary="Get Started" primaryTypographyProps={{ variant: 'h6', color: 'text.primary' }} />
                      </ListItemButton>
                    </Link>

                  </List>
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

Header.propTypes = {
  handleDrawerOpen: PropTypes.func,
  layout: PropTypes.string
};

export default Header;
