// material-ui
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { Container, Draggable } from "react-smooth-dnd";
import { arrayMoveImmutable } from "array-move";

import { copyObject, formatDate, get_data_value, is_empty } from 'utils/misc';

import StatsBlock from 'sections/summary/StatsBlock';
import PageLayout from 'layout/UserLayout/PageLayout';
import { STATS_BLOCK_LIST } from 'config/stats_constants';
import { HolderOutlined } from '@ant-design/icons';
import { setSettingData } from 'store/reducers/settingPersist';
import StatsSectionMenu from 'sections/summary/StatsSectionMenu';

const useStyles = makeStyles((theme) =>
  createStyles({
    blockItem: {
      flex: 1,
      marginBottom: '32px',
      padding: '16px',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    moveIcon: {
      padding: '6px 10px',
      opacity: 1,
      cursor: 'move',
    },
    menuIcon: {
      padding: '6px 10px',
      opacity: 1,
      cursor: 'pointer'
    }
  })
);

const Summary = () => {
  const dispatch = useDispatch()
  const classes = useStyles();
  const theme = useTheme();
  const themeMode = theme.palette.mode ?? "light"

  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreName = get_data_value(settingPersistDataStore, 'currentStoreName')
  const storeUpdatetimestamp = get_data_value(settingPersistDataStore, 'storeUpdatetimestamp')
  const currentDateRange = get_data_value(settingPersistDataStore, 'currentDateRange')

  const defaultPageData = {}
  const [pageData, setPageData] = useState(defaultPageData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentStoreId) {
      loadPageData()
    }
  }, [currentStoreId, currentDateRange])

  const loadPageData = async () => {
    if (is_empty(currentStoreId)) {
      return false
    }
    setLoading(true)
    const payload = {
      store_id: currentStoreId,
      start_date: formatDate(currentDateRange['startDate']),
      end_date: formatDate(currentDateRange['endDate'])
    }
     
  }

  const [shopCurrencySymbol, setShopCurrencySymbol] = useState('')

  useEffect(() => {
    if (pageData?.statsData) {
      const currencySymbol = pageData?.statsData?.shopCurrencySymbol
      setShopCurrencySymbol(currencySymbol ?? '$')
    }

  }, [pageData])

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const defaultBlockData = {
    blockList: [...STATS_BLOCK_LIST]
  }
  const summaryBlockData = get_data_value(settingPersistDataStore, 'summaryBlockData', defaultBlockData)
  const saveBlockData = (blockData) => {
    //console.log("saveBlockData blockData::::", blockData)
    const block_data = copyObject(blockData)
    const settingData = {
      ...settingPersistDataStore,
      summaryBlockData: {
        ...block_data
      }
    }
    dispatch(setSettingData(settingData))
  }

  const movableBlockList = summaryBlockData.blockList.filter((item) => item.is_hidden !== true)
  const onDrop = ({ removedIndex, addedIndex }) => {
    const block_list = copyObject(movableBlockList)
    const newMovableBlockList = arrayMoveImmutable(block_list, removedIndex, addedIndex);
    saveBlockData({ ...summaryBlockData, blockList: newMovableBlockList })
  }

  return (
    <PageLayout title="" cardType="">
      <Grid container spacing={5} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Container dragHandleSelector=".drag-handle" nonDragAreaSelector=".non-drag-handle" lockAxis="y" onDrop={onDrop}>
            {
              movableBlockList.map((item, index) => {
                return (
                  <Draggable key={index}>
                    {
                      (item) ? (
                        <Box className={classes.blockItem} style={{ backgroundColor: themeMode === 'light' ? 'rgba(247, 247, 247, 0.6)' : 'rgba(18, 18, 18, 0.8)' }}>
                          <Stack direction={`column`} alignItems={`spacing-between`} justifyContent={`flex-start`} spacing={4}>
                            <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                <Typography variant="h4">{item.text}</Typography>
                              </Stack>
                              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                <Box>
                                  <StatsSectionMenu summaryBlockData={summaryBlockData} blockData={item} saveBlockData={(d) => saveBlockData(d)} />
                                </Box>
                                <Box className={`drag-handle`}>
                                  <Box className={classes.moveIcon} title="Move" style={{ color: themeMode === 'light' ? '#262626' : 'rgba(255, 255, 255, 0.87)' }}>
                                    <HolderOutlined style={{ fontSize: '20px' }} />
                                  </Box>
                                </Box>
                              </Stack>
                            </Stack>
                            <div>
                              <StatsBlock
                                blockData={item}
                                pageData={pageData}
                                setPageData={setPageData}
                                loading={loading}
                                setLoading={setLoading}
                                shopCurrencySymbol={shopCurrencySymbol}
                              />
                            </div>
                          </Stack>
                        </Box>
                      ) : (
                        <></>
                      )
                    }
                  </Draggable>
                )
              })
            }
          </Container>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

export default Summary;
