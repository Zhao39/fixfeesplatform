import { useEffect, useState } from 'react';

// material-ui
import { Chip, Link, Grid, Stack } from '@mui/material';

// project import
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { arrayUnderReset, copyObject, get_data_value, is_null } from 'utils/misc';
import { getDefaultAdTableFormData } from './AdsDataTableForm/AdsDataTableForm';
import { checkTableColumnIsDefault, generateAdsSumRowData, getCurrentColumnPresetData, getTableColumnInfo, showAdValue } from 'utils/ad-table-utils';
import { CellExpander, TDViewOrderCompoment, THCompoment } from './AdsTableCompoment';
import AdListModal from '../modals/AdListModal';
import AdOrderListModal from '../modals/AdOrderListModal';
import AdsDataTableBlock from './AdsDataTableBlock';
import { setSettingData } from 'store/reducers/settingPersist';
import { AD_ORDER_RELATED_COLUMNS, AD_SOURCE_LIST } from 'config/ad_constants';
import AdsAiModal from '../modals/AdsAiModal';


const AdsDataTableSection = (props) => {
  const { title } = props
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search);
  const location_source = query.get('source')
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)
  const currentDateRange = get_data_value(settingPersistDataStore, 'currentDateRange')

  const defaultTableFormData = getDefaultAdTableFormData()
  const adsTableFormData = get_data_value(settingPersistDataStore, 'adsTableFormData', defaultTableFormData)
  const currentColumnPresetData = getCurrentColumnPresetData(adsTableFormData)
  const source = adsTableFormData.source

  const saveTableFormData = (ads_table_form_data) => {
    const newData = copyObject(ads_table_form_data)
    const settingData = {
      ...settingPersistDataStore,
      adsTableFormData: {
        ...newData
      }
    }
    dispatch(setSettingData(settingData))
  }

  useEffect(() => {
    const locationSourceList = arrayUnderReset(AD_SOURCE_LIST, 'value')
    if (location_source && locationSourceList[location_source]) {
      if (location_source !== adsTableFormData?.source) {
        const ads_table_form_data = { ...adsTableFormData, source: location_source }
        saveTableFormData(ads_table_form_data)
      }
    }
  }, [location_source]);

  const [loading, setLoading] = useState(true)
  const defaultItemList = []
  const [itemList, setItemList] = useState(defaultItemList)
  const [pageData, setPageData] = useState({})
  const loadPageData = async () => {
     
  }

  const [sumRow, setSumRow] = useState(null)
  const initItemList = (item_list) => {
    let totalRowItem = {}
    if (item_list) {
      totalRowItem = generateAdsSumRowData(item_list)
      setSumRow(totalRowItem)
    }
    setItemList(item_list)
    return item_list
  }

  useEffect(() => {
    loadPageData()
  }, [currentStoreId, currentStoreUpdateTimestamp, currentDateRange, source])

  ///////////////////////////////////////////////////////////////////////////////////
  const [currentRow, setCurrentRow] = useState(null)
  const [openAdListModal, setOpenAdListModal] = useState(false)
  const [openAdOrderListModal, setOpenAdOrderListModal] = useState(false)
  const showAdListModal = (row) => {
    setCurrentRow(row)
    setOpenAdListModal(true)
  }
  const showAdOrderListModal = (row) => {
    setCurrentRow(row)
    setOpenAdOrderListModal(true)
  }

  const [userQuery, setUserQuery] = useState("")
  const [openAdsAiModal, setOpenAdsAiModal] = useState(false)

  const generateColumns = () => {
    const columnList = [
      {
        Header: () => null,
        id: 'expander',
        className: 'cell-center',
        Cell: CellExpander,
        SubCell: () => null,
        minWidth: 60,
        width: 70,
        maxWidth: 80
      },
      {
        Header: 'Status',
        accessor: 'status',
        className: 'cell-center',
        // eslint-disable-next-line
        Cell: ({ value }) => {
          if (value === 'ACTIVE') {
            return <Chip color="success" label="ACTIVE" size="small" variant="light" />;
          }
          else if (value === 'PAUSED') {
            return <Chip color="error" label="PAUSED" size="small" variant="light" />;
          }
          else {
            return <Chip color="error" label={value} size="small" variant="light" />;
          }
        }
      },
      {
        Header: 'Campaign',
        accessor: 'name',
        className: 'cell-center',
        // eslint-disable-next-line
        Cell: ({ value, row }) => {
          return (
            <>
              <Stack direction={`row`} justifyContent={`center`} alignItems={`center`} spacing={1}>
                {
                  (row.original.item_type === 'campaign') ? (
                    <>
                      <Link
                        variant="h6"
                        color="text.primary"
                        sx={{ display: 'block', cursor: 'pointer' }}
                        className="text-emphasis"
                        title={value}
                        {...row.getToggleRowExpandedProps()}
                      >
                        <span title={value}>{value}</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        variant="h6"
                        color="text.primary"
                        sx={{ display: 'block', cursor: 'pointer' }}
                        className="text-emphasis"
                        title={value}
                        onClick={() => { showAdListModal(row) }}
                      >
                        <span title={value}>{value}</span>
                      </Link>
                    </>
                  )
                }
              </Stack>
            </>
          )
        },
        Footer: sumRow ? sumRow['name'] : '',
      },
    ]
    const column_list = currentColumnPresetData.column_list
    for (let k in column_list) {
      const value = column_list[k]
      if (checkTableColumnIsDefault(value)) {
        continue
      }
      const item = getTableColumnInfo(value)
      if (item) {
        const footerVal = (sumRow && !is_null(sumRow[item.value])) ? sumRow[item.value] : `-`

        let columnItem = null
        if (item.value.includes('gst_pixel_')) { // this is gst pixel
          if (AD_ORDER_RELATED_COLUMNS.includes(item.value)) {
            columnItem = {
              Header: () => THCompoment(item.value, item.columnText, item.columnDesc),
              Footer: <span className="custom-td-footer">{footerVal ? showAdValue(footerVal, item) : '-'}</span>,
              accessor: item.value,
              className: 'cell-center',
              Cell: (props) => {
                return <span className="es-pixel-value">{TDViewOrderCompoment(props, showAdOrderListModal, item)}</span>
              },
            }
          } else {
            columnItem = {
              Header: () => THCompoment(item.value, item.columnText, item.columnDesc),
              Footer: <span className="custom-td-footer">{footerVal ? showAdValue(footerVal, item) : '-'}</span>,
              accessor: item.value,
              className: 'cell-center',
              Cell: (props) => {
                return <span className="es-pixel-value">{TDViewOrderCompoment(props, () => { }, item)}</span>
              },
            }
          }
        } else {
          columnItem = {
            Header: () => THCompoment(item.value, item.columnText, item.columnDesc, source),
            Footer: <span className="custom-td-footer">{footerVal ? showAdValue(footerVal, item) : '-'}</span>,
            accessor: item.value,
            className: 'cell-center',
            Cell: ({ value }) => {
              return <span className="es-pixel-value">{value ? showAdValue(value, item) : '-'}</span>
            }
          }
        }
        if (columnItem) {
          columnList.push(columnItem)
        }
      }
    }
    return columnList
  }
  const columns = generateColumns()

  return (
    <>
      <Grid container item xs={12} spacing={3}>
        <Grid item xs={12}>
          <AdsDataTableBlock
            title={title}
            columns={columns}
            data={itemList}
            sumRow={sumRow}
            loading={loading}
            source={source}
            error={(pageData['store_integration_error'] === "1" && !loading) ? pageData['store_integration_error_msg'] : ""}
          />
        </Grid>
        {/* {
          (pageData['store_integration_error'] === "1" && !loading) ? (
            <Grid item xs={12}>
              <Alert severity="error" icon={false} sx={{ display: "flex", justifyContent: "center", fontSize: '1.15em' }}>{pageData['store_integration_error_msg']}</Alert>
            </Grid>
          ) : (
            <></>
          )
        } */}
      </Grid>

      {
        (currentRow) && (
          <>
            <AdListModal
              currentRow={currentRow}
              open={openAdListModal}
              setOpen={setOpenAdListModal}
              source={source}
            />
          </>
        )
      }
      {
        (currentRow) && (
          <>
            <AdOrderListModal
              currentRow={currentRow}
              open={openAdOrderListModal}
              setOpen={setOpenAdOrderListModal}
              source={source}
            />
          </>
        )
      }

      {
        (userQuery) && (openAdsAiModal) && (
          <>
            <AdsAiModal
              userQuery={userQuery}
              open={openAdsAiModal}
              setOpen={setOpenAdsAiModal}
              source={source}
            />
          </>
        )
      }
    </>
  )
}

export default AdsDataTableSection;
