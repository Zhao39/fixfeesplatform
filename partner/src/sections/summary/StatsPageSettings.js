import { useRef, useState } from 'react';

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

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import { BellOutlined, CheckCircleOutlined, GiftOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import PageSettingsCommon from 'layout/UserLayout/Header/HeaderContent/PageSettingsCommon';
import SectionPickerModal from './SectionPickerModal';
import SectionCreateModal from './SectionCreateModal';

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

const StatsPageSettings = (props) => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false)
  }

  const [showSectionPickerModal, setShowSectionPickerModal] = useState(false)

  const onClickCustomizeSummary = () => {
    setShowSectionPickerModal(true)
    handleClose()
  }

  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false)

  const onClickCreateSection = () => {
    setShowCreateSectionModal(true)
    handleClose()
  }

  return (
    <>
      <PageSettingsCommon open={open} setOpen={setOpen} minWidth={180} maxWidth={285} maxWidthXs={285}>
        <MainCard
          elevation={0}
          border={false}
          content={false}
        >
          <List
            component="nav"
            sx={{
              p: 0,
              '& .MuiListItemButton-root': {
                py: 0.5,
                '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                '& .MuiAvatar-root': avatarSX,
                '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
              }
            }}
          >
            <ListItemButton sx={{ textAlign: 'left', py: `${12}px !important` }} onClick={() => onClickCreateSection()}>
              <ListItemText
                primary={
                  <Typography color="primary" variant="h6">
                    Create Section
                  </Typography>
                }
              />
            </ListItemButton>
            <ListItemButton sx={{ textAlign: 'left', py: `${12}px !important` }} onClick={() => onClickCustomizeSummary()}>
              <ListItemText
                primary={
                  <Typography color="primary" variant="h6">
                    Customize summary
                  </Typography>
                }
              />
            </ListItemButton>
          </List>
        </MainCard>
      </PageSettingsCommon>

      {
        (showSectionPickerModal) && (
          <>
            <SectionPickerModal
              open={showSectionPickerModal}
              setOpen={setShowSectionPickerModal}
            />
          </>
        )
      }
      {
        (showCreateSectionModal) && (
          <>
            <SectionCreateModal
              open={showCreateSectionModal}
              setOpen={setShowCreateSectionModal}
            />
          </>
        )
      }
    </>
  )
}

export default StatsPageSettings;
