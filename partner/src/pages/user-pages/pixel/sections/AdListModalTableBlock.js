import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Link, Tooltip, Stack, Button } from '@mui/material';

// third-party
import { useTable, useSortBy, useBlockLayout, useResizeColumns } from "react-table";

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { HeaderSort } from 'components/third-party/ReactTable';
import { useDispatch, useSelector } from 'react-redux';
import { get_data_value } from 'utils/misc';
import AdOrderListModal from '../modals/AdOrderListModal';
import { getDefaultAdTableFormData } from './AdsDataTableForm/AdsDataTableForm';
import { checkTableColumnIsDefault, getCurrentColumnPresetData, getTableColumnInfo, showAdValue } from 'utils/ad-table-utils';
import { THCompoment } from './AdsTableCompoment';
import TableColumnResizer from 'components/DataTable/TableColumnResizer';
import AdPreviewModal from '../modals/AdPreviewModal';
import TableRowSkelton from 'components/TableRowSkelton';
import { AD_ORDER_RELATED_COLUMNS } from 'config/ad_constants';
import Lightbox from 'react-image-lightbox';

// ==============================|| REACT TABLE ||============================== // This is table for modal
const TableLoadingSkeleton = (columns) => {
  const skeltonColumnLength = columns.length
  let skeltonColumns = []
  // for (let i = 0; i < skeltonColumnLength; i++) {
  //   skeltonColumns.push(i)
  // }
  skeltonColumns = [0]
  return (
    <>
      {[0].map((item) => (
        <TableRow key={item}>
          {skeltonColumns.map((col, index) => (
            <TableCell key={index}>
              {/* <Skeleton animation="wave" /> */}
              <TableRowSkelton />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}


function ReactTable({ columns, data, getHeaderProps, sumRow, loading, striped = true }) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 140,
      //width: 150,
      maxWidth: 800
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, footerGroups, resetResizing } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: {
        sortBy: [
          {
            id: 'status',
            desc: false
          }
        ]
      }
    },
    useSortBy,
    useBlockLayout,
    useResizeColumns
  );

  const sortingRow = rows//.slice(0, 9);

  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup, i) => (
          <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, index) => (
              <TableCell key={index} {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])} title="">
                <HeaderSort column={column} />
                <TableColumnResizer column={column} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>

      {
        (loading) ?
          (
            <TableBody {...getTableBodyProps()}>
              {TableLoadingSkeleton(columns)}
            </TableBody>
          ) : (
            <>
              <TableBody {...getTableBodyProps()} {...(striped && { className: 'striped' })}>
                {sortingRow.map((row, i) => {
                  prepareRow(row);
                  return (
                    <TableRow key={i} {...row.getRowProps()}>
                      {row.cells.map((cell, index) => (
                        <TableCell key={index} {...cell.getCellProps([{ className: cell.column.className }])}>
                          {cell.render('Cell')}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>

              {/* <TableFooter>
                {footerGroups.map((group, i) => (
                  <TableRow key={i} {...group.getFooterGroupProps()}>
                    {group.headers.map((column, index) => (
                      <TableCell key={index} {...column.getFooterProps([{ className: column.className }])}>
                        {column.render('Footer')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableFooter> */}
            </>
          )
      }
    </Table>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
  sumRow: PropTypes.object,
  loading: PropTypes.bool,
};

// ==============================|| REACT TABLE - SORTING ||============================== //

const AdListModalTableBlock = (props) => {
  const { source, currentRow, onClickGPTButton } = props
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)
  const currentDateRange = get_data_value(settingPersistDataStore, 'currentDateRange')

  const defaultTableFormData = getDefaultAdTableFormData()
  const adsTableFormData = get_data_value(settingPersistDataStore, 'adsTableFormData', defaultTableFormData)
  const currentColumnPresetData = getCurrentColumnPresetData(adsTableFormData)

  const [showAdPreviewModal, setShowAdPreviewModal] = useState(false)
  const [adId, setAdId] = useState("")
  const onClickAdText = (row) => {
    //console.log('row::::', row)
    const ad_id = row.original.ad_id
    setAdId(ad_id)
    setShowAdPreviewModal(true)
  }

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [adCreativeThumbnail, setAdCreativeThumbnail] = useState("")
  
  const loadAdCreativeThumbnail = async (ad_id, creative_id) => {
     
  }

  const onClickAdCreativeThumbnail = (row) => {
    console.log('row::::', row)
    const ad_id = row.original.ad_id
    const creative_id = row.original.creative?.id
    loadAdCreativeThumbnail(ad_id, creative_id)
  }

  const generateColumns = () => {
    const columnList = [
      {
        Header: 'Status',
        accessor: 'status',
        className: 'cell-center',
        // eslint-disable-next-line
        Cell: ({ value, row }) => {
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
        Header: 'Name',
        accessor: 'name',
        className: 'cell-left',
        minWidth: 180,
        // eslint-disable-next-line
        Cell: ({ value, row }) => {
          return (
            <>
              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                <span className="ad-thumbnail-img-wrapper" role="button" tabIndex="0" onClick={() => onClickAdCreativeThumbnail(row)} onKeyDown={() => onClickAdCreativeThumbnail(row)}>
                  <img className="ad-thumbnail-img" src={row?.original?.thumbnail_url} alt="AD Thumbnail" />
                </span>
                <Link
                  variant="h6"
                  color="text.primary"
                  sx={{ display: 'block', cursor: 'pointer' }}
                  className="text-emphasis"
                  onClick={() => onClickAdText(row)}
                  title={value}
                >
                  {value}
                </Link>
                <Tooltip title="Enhance Ad Copy with A.I.">
                  <Button
                    variant="dashed"
                    size="extraSmall"
                    color="info"
                    sx={{ minWidth: '24px' }}
                    onClick={() => onClickGPTButton(row?.original?.creative_text)}>
                    GPT
                  </Button>
                </Tooltip>
              </Stack>
            </>
          )
        },
        //Footer: sumRow ? sumRow['name'] : '',
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
        let columnItem = null
        if (item.value.includes('gst_pixel_')) { // this is gst pixel
          if (AD_ORDER_RELATED_COLUMNS.includes(item.value)) {
            columnItem = {
              Header: () => THCompoment(item.value, item.columnText, item.columnDesc),
              //Footer: sumRow ? sumRow['spend'] : '',
              accessor: item.value,
              className: 'cell-center',
              Cell: (props) => {
                return <span className="es-pixel-value">{TDViewOrderCompoment(props, showAdOrderListModal, item)}</span>
              }
            }
          } else {
            columnItem = {
              Header: () => THCompoment(item.value, item.columnText, item.columnDesc),
              //Footer: sumRow ? sumRow['spend'] : '',
              accessor: item.value,
              className: 'cell-center',
              Cell: (props) => {
                return <span className="es-pixel-value">{TDViewOrderCompoment(props, () => { }, item)}</span>
              }
            }
          }
        } else {
          columnItem = {
            Header: () => THCompoment(item.value, item.columnText, item.columnDesc, source),
            //Footer: sumRow ? (`${sumRow['spend'] ? priceFormat(sumRow['spend'], '$') : '-'}`) : '',
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
  const [sumRow, setSumRow] = useState(null)
  const [currentAdRow, setCurrentAdRow] = useState(null)
  const [openAdOrderListModal, setOpenAdOrderListModal] = useState(false)
  const showAdOrderListModal = (row) => {
    setCurrentAdRow(row)
    setOpenAdOrderListModal(true)
  }
  const TDViewOrderCompoment = (props, callback, itemProperty) => {
    const { value, row } = props
    if (value && Number(value) !== 0) {
      const item_id = row.original.item_type === 'campaign' ? row.original.fb_pixel_campaign_id : row.original.fb_pixel_adset_id
      const item_type = row.original.item_type === 'campaign' ? 'campaign_id' : 'adset_id'
      return <Link
        variant="h6"
        color="primary"
        title={`View Orders`}
        sx={{ display: 'block', cursor: 'pointer' }}
        onClick={() => { showAdOrderListModal(row) }}
      >
        {showAdValue(value, itemProperty)}
      </Link>
    } else {
      return <></>
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const defaultItemList = []
  const [itemList, setItemList] = useState(defaultItemList)
  const [loading, setLoading] = useState(true)

  const loadPageData = async () => {
     
  }

  const initItemList = (item_list) => {
    let totalRowItem = {
      "name": 0,
      "clicks": 0,
      "cpc": 0,
      "cpm": 0,
      "cpp": 0,
      "ctr": 0,
      "impressions": 0,
      "reach": 0,
      "spend": 0,
    }
    const keys = Object.keys(totalRowItem)
    if (item_list) {
      for (let k in item_list) {
        const item = item_list[k]
        if (item) {
          for (let k in item) {
            const value = item[k]
            if (value) {
              if (k === 'name') {
                totalRowItem['name'] = totalRowItem['name'] + 1
              }
              else {
                if (keys.includes(k)) {
                  totalRowItem[k] = totalRowItem[k] + Number(item[k])
                }
              }
            }
          }
        }
      }
      const trimKeys0 = [
        "name",
        "clicks",
        "impressions",
        "reach",
      ]
      const trimKeys2 = [
        "spend",
        "cpc",
        "cpm",
        "cpp",
        "ctr",
      ]
      for (let key in totalRowItem) {
        if (trimKeys0.includes(key)) {
          totalRowItem[key] = totalRowItem[key].toFixed(0)
        }
        else if (trimKeys2.includes(key)) {
          totalRowItem[key] = totalRowItem[key].toFixed(2)
        }
        else if (trimKeys6.includes(key)) {
          totalRowItem[key] = totalRowItem[key].toFixed(6)
        }
      }
      totalRowItem['name'] = `( ${totalRowItem['name']} Ads )`
      setSumRow(totalRowItem)
    }
    setItemList(item_list)
    return item_list
  }

  useEffect(() => {
    loadPageData()
  }, [source])

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <div className="skicky-table-container" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <ReactTable columns={columns} data={itemList} sumRow={sumRow} getHeaderProps={(column) => column.getSortByToggleProps()} loading={loading} />
          </div>
        </ScrollX>
      </MainCard>
      {
        (currentAdRow) && (
          <>
            <AdOrderListModal
              currentRow={currentAdRow}
              open={openAdOrderListModal}
              setOpen={setOpenAdOrderListModal}
              source={source}
            />
          </>
        )
      }

      {
        (showAdPreviewModal && adId) ? (
          <>
            <AdPreviewModal
              adId={adId}
              open={showAdPreviewModal}
              setOpen={setShowAdPreviewModal}
              source={source}
            />
          </>
        ) : (
          <></>
        )
      }

      {
        (imageModalOpen) ? (
          <Lightbox
            mainSrc={adCreativeThumbnail}
            onCloseRequest={() => setImageModalOpen(false)}
          />
        ) : (
          <></>
        )
      }

    </>
  )
};

export default AdListModalTableBlock;
