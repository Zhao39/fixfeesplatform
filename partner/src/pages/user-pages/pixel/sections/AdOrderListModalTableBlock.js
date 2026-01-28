import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import { Table, TableBody, TableCell, TableHead, TableRow, TableFooter, Typography, Link } from '@mui/material';

// third-party
import { useTable, useSortBy } from 'react-table';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { HeaderSort } from 'components/third-party/ReactTable';
import { useDispatch, useSelector } from 'react-redux';
import { get_data_value, isoDateToTimezoneDate, priceFormat } from 'utils/misc';
import AdOrderDetailModal from '../modals/AdOrderDetailModal';
import TableRowSkelton from 'components/TableRowSkelton';

// ==============================|| REACT TABLE ||============================== // This is table for modal
const TableLoadingSkeleton = () => {
  return (
    <>
      {[0].map((item) => (
        <TableRow key={item}>
          {[0].map((col) => (
            <TableCell key={col} colSpan={4}>
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
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, footerGroups } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );

  const sortingRow = rows//.slice(0, 9);

  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup, i) => (
          <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, index) => (
              <TableCell key={index} {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])}>
                <HeaderSort column={column} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>

      {
        (loading) ?
          (
            <TableBody {...getTableBodyProps()}>
              {TableLoadingSkeleton()}
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

              <TableFooter>
                {footerGroups.map((group, i) => (
                  <TableRow key={i} {...group.getFooterGroupProps()}>
                    {group.headers.map((column, index) => (
                      <TableCell key={index} {...column.getFooterProps([{ className: column.className }])}>
                        {column.render('Footer')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableFooter>
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

const AdOrderListModalTableBlock = (props) => {
  const { currentRow, source } = props
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)
  const currentDateRange = get_data_value(settingPersistDataStore, 'currentDateRange')

  const defaultItemList = []
  const [itemList, setItemList] = useState(defaultItemList)
  const [loading, setLoading] = useState(true)

  const loadPageData = async () => {
    
  }

  const [sumRow, setSumRow] = useState(null)
  const initItemList = (item_list) => {
    let totalRowItem = {
      "order_number": 0,
      "total_price": 0,
    }
    const keys = Object.keys(totalRowItem)
    if (item_list) {
      for (let k in item_list) {
        const item = item_list[k]
        if (item) {
          for (let k in item) {
            const value = item[k]
            if (value) {
              if (k === 'order_number') {
                totalRowItem['order_number'] = totalRowItem['order_number'] + 1
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
        "order_number",
      ]
      const trimKeys2 = [
        "total_price",
      ]

      for (let key in totalRowItem) {
        if (trimKeys0.includes(key)) {
          totalRowItem[key] = totalRowItem[key].toFixed(0)
        }
        else if (trimKeys2.includes(key)) {
          totalRowItem[key] = totalRowItem[key].toFixed(2)
        }
      }
      totalRowItem['order_number'] = `( ${totalRowItem['order_number']} Orders )`
      setSumRow(totalRowItem)
    }
    setItemList(item_list)
    return item_list
  }

  const [orderRow, setOrderRow] = useState(null)
  const [openAdOrderDetailModal, setOpenAdOrderDetailModal] = useState(false)
  const showAdOrderDetailModal = (row) => {
    const order = { ...row.original }
    order.order_data = JSON.parse(order.order_data)
    order.ads_data = JSON.parse(order.ads_data)
    order.pixel_event_data = JSON.parse(order.pixel_event_data)
    setOrderRow(order)
    setOpenAdOrderDetailModal(true)
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const TDViewOrderDetailCompoment = (props, field_name) => {
    const { value, row } = props
    let componentType = 'p'
    let color = 'textPrimary'
    let valueAdjusted = value
    if (field_name === 'order_number') {
      valueAdjusted = `#${value}`
      color = 'primary'
      componentType = 'link'
    }
    else if (field_name === 'customer_name') {
      color = 'primary'
      componentType = 'link'
    }
    else if (field_name === 'order_created_date') {
      valueAdjusted = isoDateToTimezoneDate(value)
    }
    else if (field_name === 'total_price') {
      valueAdjusted = <span className="es-pixel-value">{`${value} ${row.original.currency}`}</span>
    }

    if (valueAdjusted) {
      if (componentType === 'link') {
        return <Link
          variant="h6"
          color={color}
          title={`View Detail`}
          sx={{ display: 'block', cursor: 'pointer' }}
          onClick={() => { showAdOrderDetailModal(row) }}
        >
          {valueAdjusted}
        </Link>
      } else {
        return <Typography
          variant="h6"
          color={color}
        >
          {valueAdjusted}
        </Typography>
      }
    } else {
      return <></>
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Order',
        Footer: sumRow ? sumRow['order_number'] : '',
        accessor: 'order_number',
        className: 'cell-center',
        Cell: (props) => {
          return TDViewOrderDetailCompoment(props, 'order_number')
        },
      },
      {
        Header: 'Date',
        accessor: 'order_created_date',
        className: 'cell-center',
        Cell: (props) => {
          return TDViewOrderDetailCompoment(props, 'order_created_date')
        },
      },
      {
        Header: 'Customer',
        accessor: 'customer_name',
        className: 'cell-center',
        Cell: (props) => {
          return TDViewOrderDetailCompoment(props, 'customer_name')
        },
      },
      {
        Header: 'Total',
        Footer: sumRow ? (`${sumRow['total_price'] ? priceFormat(sumRow['total_price'], '$') : '-'}`) : '',
        accessor: 'total_price',
        className: 'cell-center',
        Cell: (props) => {
          return TDViewOrderDetailCompoment(props, 'total_price')
        },
      },
    ],
    [sumRow]
  );

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
        (orderRow) && (
          <>
            <AdOrderDetailModal
              currentRow={currentRow}
              orderRow={orderRow}
              open={openAdOrderDetailModal}
              setOpen={setOpenAdOrderDetailModal}
              source={source}
            />
          </>
        )
      }
    </>
  )
};

export default AdOrderListModalTableBlock;
