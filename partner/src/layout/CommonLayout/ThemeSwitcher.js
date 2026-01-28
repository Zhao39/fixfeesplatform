import { useContext, useEffect, useMemo, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

import NightsStayIcon from '@mui/icons-material/NightsStay';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import { BellOutlined, CheckCircleOutlined, GiftOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';

import { console_log, empty, get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useConfig from 'hooks/useConfig';
import { refreshPageTimestamp } from 'store/reducers/page';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - ThemeSwitcher ||============================== //

const ThemeSwitcher = () => {
  const dispatch = useDispatch()

  const theme = useTheme();
  const { mode, onChangeMode } = useConfig();   //const mode = config.mode ?? 'light'

  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';


  const handleToggle = () => {
    dispatch(refreshPageTimestamp({ pageTimestamp: new Date().getTime() }))

    onChangeMode(mode === "light" ? "dark" : "light")
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: iconBackColor }}
        title={`Toggle light/dark mode`}
        onClick={handleToggle}
      >
        {
          (mode === "light") ? (
            <>
              <NightsStayIcon />
            </>
          ) : (
            <>
              <LightModeIcon />
            </>
          )
        }
      </IconButton>
    </Box>
  );
};

export default ThemeSwitcher;
