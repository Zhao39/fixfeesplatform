import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, ClickAwayListener, Grid, List, ListItemButton, ListItemText, Paper, Popper, Typography, useMediaQuery } from '@mui/material';

// project import

import Transitions from 'components/@extended/Transitions';
import useConfig from 'hooks/useConfig';

// assets
import { useDispatch, useSelector } from 'react-redux';
import { get_data_value } from 'utils/misc';
import { setSettingData } from 'store/reducers/settingPersist';

// ==============================|| HEADER CONTENT - StoreSelector ||============================== //

const StoreSelector = () => {
  const dispatch = useDispatch()
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  //console_log("StoreSelector settingPersistDataStore::::", settingPersistDataStore)
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreName = get_data_value(settingPersistDataStore, 'currentStoreName')
  const storeUpdatetimestamp = get_data_value(settingPersistDataStore, 'storeUpdatetimestamp')

  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const { i18n, onChangeLocalization } = useConfig();

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
  };

  const handleListItemClick = (row) => {
    initSetCurrentStore(row);
    setOpen(false);
  };

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

  const [storeList, setStoreList] = useState([])
  const loadStoreList = async () => {
     
  }
  const initSetCurrentStore = (row) => {
    const settingData = {
      currentStoreId: row?.id,
      currentStoreName: row?.name,
      currentStore:row
    }
    dispatch(setSettingData(settingData))
  }
  const checkCurrentStoreIsValid = (storeId, dataList) => {
    if (dataList && dataList.length > 0) {
      for(let k in dataList) {
        const row = dataList[k]
        if(storeId === row['id']) {
          return true
        }
      }
      initSetCurrentStore(dataList[0])
    }else{
      initSetCurrentStore({})
    }
  }

  useEffect(() => {

  }, [storeUpdatetimestamp])

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <>
        {
          (storeList.length > 0) ? (
            <>
              <Button
                color="secondary"
                variant="light"
                sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
                aria-label="open localization"
                ref={anchorRef}
                aria-controls={open ? 'localization-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
              >
                <span className="text-emphasis" style={{ maxWidth: 'calc(50vw - 145px)' }}>{currentStoreName}</span>
              </Button>
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
                            (storeList.map((item, index) => {
                              return (
                                <ListItemButton key={index} selected={currentStoreId === item['id']} onClick={() => handleListItemClick(item)}>
                                  <ListItemText
                                    primary={
                                      <Grid container>
                                        <Typography color="textPrimary">{item['name']}</Typography>
                                      </Grid>
                                    }
                                  />
                                </ListItemButton>
                              )
                            }))
                          }
                        </List>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </Popper>
            </>
          ) : (
            <>
            </>
          )
        }
      </>
    </Box>
  );
};

export default StoreSelector;
