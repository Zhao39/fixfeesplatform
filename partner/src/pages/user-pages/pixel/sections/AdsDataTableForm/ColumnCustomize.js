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
  useMediaQuery,
  Stack
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
// assets
import { BellOutlined, CheckCircleOutlined, GiftOutlined, MessageOutlined, EditOutlined, BarcodeOutlined, DeleteOutlined } from '@ant-design/icons';
import ColumnPickerModal from './ColumnPickerModal';
import { AD_TABLE_PRESET_COLUMNS } from 'config/ad_constants';
import { useSelector } from 'react-redux';
import { arrayUnderReset, copyObject } from 'utils/misc';
import ColumnPresetModal from './ColumnPresetModal';
import { showToast } from 'utils/utils';

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


const ColumnCustomize = (props) => {
  const { adsTableFormData, saveTableFormData } = props
  const adTablePresetColumns = adsTableFormData.adTablePresetColumns

  const theme = useTheme();

  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

  const [showColumnPickerModal, setShowColumnPickerModal] = useState(false)
  const onClickColumnPreset = (columnPresetName) => {
    if (columnPresetName) {
      const fieldName = "columnPresetName"
      const fieldValue = columnPresetName
      const ads_table_form_data = { ...adsTableFormData }
      ads_table_form_data[fieldName] = fieldValue
      saveTableFormData(ads_table_form_data)
    }
    else { // show customize columns modal
      setShowColumnPickerModal(true)
    }
    setOpen(false)
  }

  const checkIsCustomPreset = (v) => {
    if (v.is_custom) {
      return true
    } else {
      return false
    }
  }

  const systemPresetList = adTablePresetColumns.filter((v) => !checkIsCustomPreset(v))
  const customPresetList = adTablePresetColumns.filter((v) => checkIsCustomPreset(v))

  const [selectedCustomPreset, setSelectedCustomPreset] = useState()
  const [showColumnPresetModal, setShowColumnPresetModal] = useState(false)

  const onClickEditColumnPreset = (event, item) => {
    event.preventDefault();
    setSelectedCustomPreset(item)
    setShowColumnPresetModal(true)
    setOpen(false)
  }
  const saveColumnPreset = (item) => {
    const adTablePresetColumnsCopy = copyObject(adTablePresetColumns)
    for (let k in adTablePresetColumnsCopy) {
      if (adTablePresetColumnsCopy[k]['value'] === item.value) {
        adTablePresetColumnsCopy[k] = item
      }
    }
    //console.log("savedItem::::", item)
    const ads_table_form_data = { ...adsTableFormData }
    ads_table_form_data['adTablePresetColumns'] = adTablePresetColumnsCopy
    saveTableFormData(ads_table_form_data)
    setOpen(false)
    showToast("Preset updated!", "success")
    return true
  }

  const onClickDeleteColumnPreset = (event, item) => {
    event.preventDefault(false)
    if (window.confirm("Are you sure you want to remove this preset?")) {
      deleteColumnPreset(item.value)
    }
  }

  const deleteColumnPreset = (preset_value) => {
    const ads_table_form_data = { ...adsTableFormData }
    if (ads_table_form_data['columnPresetName'] === preset_value) {
      ads_table_form_data['columnPresetName'] = ads_table_form_data['adTablePresetColumns'][0]['value']
    }
    const newItemList = adTablePresetColumns.filter((v) => v.value !== preset_value)
    ads_table_form_data['adTablePresetColumns'] = copyObject(newItemList)
    saveTableFormData(ads_table_form_data)
    setOpen(false)
  }

  return (
    <Box>
      <Tooltip placement="top" title="Select Columns">
        <IconButton
          size="medium"
          color="secondary"
          variant="light"
          sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor, width: '40px', height: '40px', border: theme.palette.mode === 'dark' ? '1px solid #595959' : '1px solid #d9d9d9' }}
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <BarcodeOutlined />
        </IconButton>
      </Tooltip>

      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? -5 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title=""
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
                    {
                      customPresetList.map((item, index) => {
                        return (
                          <ListItemButton key={index} selected={adsTableFormData?.columnPresetName === item.value}>
                            <ListItemText
                              onClick={() => onClickColumnPreset(item.value)}
                              primary={
                                <Typography variant="h6">
                                  {item.text}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" component="p" sx={{
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55) !important' : 'rgba(38,38,38,0.55) !important'
                                }}>
                                  {item.desc}
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Stack direction={`row`} spacing={0.5}>
                                <IconButton color={`success`} onClick={(e) => onClickEditColumnPreset(e, item)}>
                                  <EditOutlined />
                                </IconButton>
                                <IconButton color={`error`} onClick={(e) => onClickDeleteColumnPreset(e, item)}>
                                  <DeleteOutlined />
                                </IconButton>
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        )
                      })
                    }
                    {
                      systemPresetList.map((item, index) => {
                        return (
                          <ListItemButton key={index} selected={adsTableFormData?.columnPresetName === item.value} onClick={() => onClickColumnPreset(item.value)}>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {item.text}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" component="p" sx={{
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55) !important' : 'rgba(38,38,38,0.55) !important'
                                }}>
                                  {item.desc}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        )
                      })
                    }

                    <Divider />

                    <ListItemButton selected={false} onClick={() => onClickColumnPreset("")}>
                      <ListItemText
                        primary={
                          <Box sx={{ py: 1 }}>
                            <Typography variant="h6">
                              {`Customize Columns`}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>

      {
        (showColumnPickerModal) && (
          <>
            <ColumnPickerModal
              open={showColumnPickerModal}
              setOpen={setShowColumnPickerModal}
              adsTableFormData={adsTableFormData}
              saveTableFormData={(d) => saveTableFormData(d)}
            />
          </>
        )
      }

      {
        (showColumnPresetModal) && (
          <ColumnPresetModal
            open={showColumnPresetModal}
            setOpen={setShowColumnPresetModal}
            selectedCustomPreset={selectedCustomPreset}
            saveColumnPreset={(d) => saveColumnPreset(d)}
          />
        )
      }

    </Box>
  );
};

export default ColumnCustomize;
