import { Fragment, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box, ClickAwayListener, Grid, List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper, Popper, Typography, useMediaQuery
} from '@mui/material';

// project import
import IconButton from 'components/@extended/IconButton';

import Transitions from 'components/@extended/Transitions';

// assets
import { AppstoreOutlined, BarsOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, EyeInvisibleOutlined, TableOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { copyObject, get_data_value } from 'utils/misc';
import SectionColumnPickerModal from './SectionColumnPickerModal';
import SectionCreateModal from './SectionCreateModal';

// ==============================|| HEADER CONTENT - StoreSelector ||============================== //

const StatsSectionMenu = (props) => {
  const { summaryBlockData = {}, blockData = {}, saveBlockData } = props
  const diplayMode = blockData.diplayMode ?? "display_tiles"
  const dispatch = useDispatch()
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreName = get_data_value(settingPersistDataStore, 'currentStoreName')
  const storeUpdatetimestamp = get_data_value(settingPersistDataStore, 'storeUpdatetimestamp')

  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }

  const onClickHideSection = () => {
    if (blockData.is_custom) {
      const summary_block_data = copyObject(summaryBlockData)
      const blockList = summary_block_data.blockList
      const blockDataUpdated = {
        ...blockData,
        is_hidden: true
      }
      for (let k in blockList) {
        if (blockList[k].value === blockDataUpdated.value) {
          blockList[k] = blockDataUpdated
        }
      }
      summary_block_data.blockList = blockList
      saveBlockData({ ...summary_block_data })
    } else {
      deleteSection()
    }
  }

  const onClickShowReorderTileModal = () => {
    setShowSectionColumnPickerModal(true)
  }

  const changeDisplayMode = (diplay_mode) => {
    const summary_block_data = copyObject(summaryBlockData)
    const blockList = summary_block_data.blockList
    for (let k in blockList) {
      if (blockData.value === blockList[k].value) {
        blockList[k].diplayMode = diplay_mode
        summary_block_data.blockList = blockList
        saveBlockData({ ...summary_block_data })
        return true
      }
    }
  }

  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false)

  const onClickEditSection = () => {
    setShowCreateSectionModal(true)
  }

  const onClickDeleteSection = () => {
    if (window.confirm("Are you sure you want to remove?")) {
      deleteSection()
    }
  }

  const deleteSection = () => {
    const summary_block_data = copyObject(summaryBlockData)
    const blockList = summary_block_data.blockList
    const newBlockList = blockList.filter((item) => item.value !== blockData.value)
    summary_block_data.blockList = newBlockList
    saveBlockData({ ...summary_block_data })
  }

  const handleListItemClick = (value) => {
    if (value === 'hide') {
      onClickHideSection()
    }
    else if (value === 'reorder') {
      onClickShowReorderTileModal()
    }
    else if (value === 'display_tiles') {
      changeDisplayMode(value)
    }
    else if (value === 'display_table') {
      changeDisplayMode(value)
    }
    else if (value === 'edit') {
      onClickEditSection()
    }
    else if (value === 'delete') {
      onClickDeleteSection()
    }
    setOpen(false);
  }

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

  const displayModeMenuList = [
    {
      value: 'display_tiles',
      text: 'Switch to Tiles Mode',
      icon: <AppstoreOutlined style={{ fontSize: '20px' }} />
    },
    {
      value: 'display_table',
      text: 'Switch to Table Mode',
      icon: <TableOutlined style={{ fontSize: '20px' }} />
    },
  ]
  const customMenuItemList = [
    {
      value: 'edit',
      text: 'Edit Section',
      icon: <EditOutlined style={{ fontSize: '20px' }} />
    },
    {
      value: 'delete',
      text: 'Remove Section',
      icon: <DeleteOutlined style={{ fontSize: '20px' }} />
    }
  ]
  const defaultMenuItemList = [
    {
      value: 'hide',
      text: 'Hide Section',
      icon: <EyeInvisibleOutlined style={{ fontSize: '20px' }} />
    },
    {
      value: 'reorder',
      text: 'Reorder Tiles',
      icon: <BarsOutlined style={{ fontSize: '20px' }} />
    }
  ]
  const menuItemList = blockData.is_custom ? [...defaultMenuItemList, ...customMenuItemList, ...displayModeMenuList] : [...defaultMenuItemList, ...displayModeMenuList]

  const [showSectionColumnPickerModal, setShowSectionColumnPickerModal] = useState(false)
  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
        aria-label="open localization"
        ref={anchorRef}
        aria-controls={open ? 'localization-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <EllipsisOutlined style={{ fontSize: '20px' }} />
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom-start' : 'bottom'}
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
                offset: [matchesXs ? 0 : 0, 9]
              }
            }
          ]
        }}
        sx={{zIndex: 1}}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  component="nav"
                  sx={{
                    p: 0,
                    width: '100%',
                    minWidth: 200,
                    maxWidth: 290,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 0.5,
                    [theme.breakpoints.down('md')]: {
                      maxWidth: 250
                    }
                  }}
                >

                  {
                    (menuItemList.map((item, index) => {
                      return (
                        <Fragment key={index}>
                          {
                            (diplayMode === item['value']) ? (
                              <></>
                            ) : (
                              <ListItemButton onClick={() => handleListItemClick(item['value'])}>
                                <ListItemAvatar style={{ minWidth: "36px" }}>
                                  {item['icon']}
                                </ListItemAvatar>

                                <ListItemText
                                  primary={
                                    <Grid container>
                                      <Typography color="textPrimary">{item['text']}</Typography>
                                    </Grid>
                                  }
                                />
                              </ListItemButton>
                            )
                          }
                        </Fragment>
                      )
                    }))
                  }
                </List>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>

      {
        (showSectionColumnPickerModal) && (
          <>
            <SectionColumnPickerModal
              open={showSectionColumnPickerModal}
              setOpen={setShowSectionColumnPickerModal}
              summaryBlockData={summaryBlockData}
              blockData={blockData}
              saveBlockData={(d) => saveBlockData(d)}
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
              mode="edit"
              blockData={blockData}
            />
          </>
        )
      }
    </Box>
  )
}

export default StatsSectionMenu;
