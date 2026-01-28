import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, ClickAwayListener, Grid, List, ListItem, ListItemButton, ListItemText, Paper, Popper, Stack, Typography, useMediaQuery } from '@mui/material';

// project import
import IconButton from 'components/@extended/IconButton';

import Transitions from 'components/@extended/Transitions';
import useConfig from 'hooks/useConfig';

// assets
import { TranslationOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { console_log, formatDate, getLocalTimezone, getMonthDate, get_data_value, timeConverter } from 'utils/misc';
import { setSettingData } from 'store/reducers/settingPersist';

import {
  addDays,
  endOfDay,
  startOfDay,
  startOfYear,
  startOfMonth,
  endOfMonth,
  endOfYear,
  addMonths,
  addYears,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInCalendarDays
} from "date-fns";

import { DateRangePicker, defaultStaticRanges } from 'react-date-range';
// ==============================|| HEADER CONTENT - StoreSelector ||============================== //

const NavDateRangePicker = () => {
  const dispatch = useDispatch()
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const storeUpdatetimestamp = get_data_value(settingPersistDataStore, 'storeUpdatetimestamp')
  const currentDateRange = get_data_value(settingPersistDataStore, 'currentDateRange')
  const shop_iana_timezone = get_data_value(settingPersistDataStore, 'shop_iana_timezone')

  // const local_iana_timezone = getLocalTimezone()
  // console.log(`local_iana_timezone::::`, local_iana_timezone)

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
  };

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

  const initSetCurrentStore = (row) => {
    const settingData = {
      currentStoreId: row['id'],
      currentStoreName: row['name'],
      currentStore: row
    }
    dispatch(setSettingData(settingData))
  }

  useEffect(() => {
  }, [storeUpdatetimestamp])


  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const defaultSelectionRange = {
    startDate: new Date(currentDateRange['startDate']),
    endDate: new Date(currentDateRange['endDate']),
    key: currentDateRange['key'],
  }
  const [selectionRange, setSelectionRange] = useState(defaultSelectionRange)

  const handleSelect = (ranges) => {
    const selection = ranges.selection

    // {
    //   selection: {
    //     startDate: [native Date Object],
    //     endDate: [native Date Object],
    //   }
    // }

    setSelectionRange(selection)
    const startDate = formatDate(selection.startDate)
    const endDate = formatDate(selection.endDate)
  }

  const applyDateRange = (e) => {
    const settingData = {
      ...settingPersistDataStore,
      currentDateRange: {
        ...selectionRange,
        startDate: selectionRange.startDate.getTime(),
        endDate: selectionRange.endDate.getTime()
      }
    }
    dispatch(setSettingData(settingData))
    handleClose(e)
  }

  const getDateRangeLabel = () => {
    const startDate = new Date(currentDateRange['startDate'])
    const endDate = new Date(currentDateRange['endDate'])
    const startDateTimestampUnix = Math.floor(startDate.getTime() / 1000)
    const endDateDateTimestampUnix = Math.floor(endDate.getTime() / 1000)
    const startDateStr = timeConverter(startDateTimestampUnix, false, false)
    const endDateStr = timeConverter(endDateDateTimestampUnix, false, false)
    const startMonthDateStr = getMonthDate(startDateTimestampUnix, false, false)
    const endMonthDateStr = getMonthDate(endDateDateTimestampUnix, false, false)
    const startYearStr = startDate.getFullYear();
    const endYearStr = endDate.getFullYear();
    let dateRangeStr = `${startDateStr} ~ ${endDateStr}`
    if (startYearStr === endYearStr) {
      dateRangeStr = `${startMonthDateStr} ~ ${endMonthDateStr}, ${startYearStr}`
    }
    return dateRangeStr
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
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
          <span className="text-emphasis" style={{ maxWidth: 'calc(50vw - 128px)' }}>{getDateRangeLabel()}</span>
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
              <Paper sx={{ boxShadow: theme.customShadows.z1, overflowY: 'auto', maxHeight: 'calc(100vh - 60px)' }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      width: '100%',
                      bgcolor: theme.palette.background.paper,
                      borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <ListItem>
                      <DateRangePicker
                        ranges={[selectionRange]}
                        onChange={handleSelect}
                        staticRanges={[
                          ...defaultStaticRanges.filter((item) => (item.label === 'Today' || item.label === 'Yesterday')),
                          {
                            label: "Last 7 Days",
                            range: () => ({
                              startDate: addDays(new Date(), -6),
                              endDate: addDays(new Date(), 0),
                            }),
                            isSelected(range) {
                              const definedRange = this.range();
                              return (
                                isSameDay(range.startDate, definedRange.startDate) &&
                                isSameDay(range.endDate, definedRange.endDate)
                              );
                            }
                          },
                          {
                            label: "Last 30 Days",
                            range: () => ({
                              startDate: addDays(new Date(), -29),
                              endDate: addDays(new Date(), 0),
                            }),
                            isSelected(range) {
                              const definedRange = this.range();
                              return (
                                isSameDay(range.startDate, definedRange.startDate) &&
                                isSameDay(range.endDate, definedRange.endDate)
                              );
                            }
                          },
                          {
                            label: "Last 90 Days",
                            range: () => ({
                              startDate: addDays(new Date(), -89),
                              endDate: addDays(new Date(), 0),
                            }),
                            isSelected(range) {
                              const definedRange = this.range();
                              return (
                                isSameDay(range.startDate, definedRange.startDate) &&
                                isSameDay(range.endDate, definedRange.endDate)
                              );
                            }
                          },
                          {
                            label: "Last 365 Days",
                            range: () => ({
                              startDate: addDays(new Date(), -364),
                              endDate: addDays(new Date(), 0),
                            }),
                            isSelected(range) {
                              const definedRange = this.range();
                              return (
                                isSameDay(range.startDate, definedRange.startDate) &&
                                isSameDay(range.endDate, definedRange.endDate)
                              );
                            }
                          },
                          ...defaultStaticRanges.filter((item) => !(item.label === 'Today' || item.label === 'Yesterday')),
                          {
                            label: "This year",
                            range: () => ({
                              startDate: startOfYear(addYears(new Date(), 0)),
                              endDate: endOfYear(addYears(new Date(), 0))
                            }),
                            isSelected(range) {
                              const definedRange = this.range();
                              return (
                                isSameDay(range.startDate, definedRange.startDate) &&
                                isSameDay(range.endDate, definedRange.endDate)
                              );
                            }
                          },
                          {
                            label: "Last year",
                            range: () => ({
                              startDate: startOfYear(addYears(new Date(), -1)),
                              endDate: endOfYear(addYears(new Date(), -1))
                            }),
                            isSelected(range) {
                              const definedRange = this.range();
                              return (
                                isSameDay(range.startDate, definedRange.startDate) &&
                                isSameDay(range.endDate, definedRange.endDate)
                              );
                            }
                          },

                        ]}
                      />
                    </ListItem>
                    <ListItem sx={{ textAlign: 'right', justifyContent: 'flex-end', paddingBottom: 2, marginTop: matchesXs ? '0px' : '-48px', float: 'right', width: matchesXs ? '100%' : 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Typography variant="h6" color="textSecondary" sx={{ mr: 1 }}>Store Timezone:</Typography>
                        <Typography variant="h6" color="primary">{shop_iana_timezone}</Typography>
                      </Box>
                    </ListItem>
                    <ListItem sx={{ textAlign: 'right', justifyContent: 'flex-end', paddingBottom: 2 }}>
                      <Button variant="contained" color="primary" onClick={(e) => { applyDateRange(e) }}>Apply</Button>
                    </ListItem>
                  </List>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </>
    </Box>
  )
}

export default NavDateRangePicker;
