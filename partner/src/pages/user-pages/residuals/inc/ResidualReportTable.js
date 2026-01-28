import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

// material-ui
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, TableFooter, Skeleton, Stack, Grid, FormControl, FormGroup, FormControlLabel, Checkbox, Box, Button, OutlinedInput, InputAdornment, IconButton, Tooltip, Typography, ButtonBase } from '@mui/material';

// third-party
import { useTable, useSortBy } from 'react-table';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import LinearWithLabel from 'components/@extended/Progress/LinearWithLabel';
import { HeaderSort } from 'components/third-party/ReactTable';
import makeData from 'data/react-table';
import TableRowSkelton from 'components/TableRowSkelton';
import { numberFormat, priceFormat } from 'utils/misc';
import { number } from 'currency-codes';
import { DownloadOutlined, EyeInvisibleOutlined, SearchOutlined } from '@ant-design/icons';
import MerchantResidualDetailModal from './MerchantResidualDetailModal';

// ==============================|| REACT TABLE ||============================== //
const tableCellStyle = {
  //borderLeft: '1px solid rgba(156,156,156,0.2)',
}
const TableLoadingSkeleton = (columns) => {
  const skeltonColumnLength = columns.length
  let skeltonColumns = []
  for (let i = 0; i < skeltonColumnLength; i++) {
    skeltonColumns.push(i)
  }
  //skeltonColumns = [0]

  return (
    <>
      {[0].map((item) => (
        <TableRow key={item}>
          {/* <TableCell /> */}
          {skeltonColumns.map((col, index) => (
            <TableCell key={index}>
              <Skeleton animation="wave" />
              {/* <TableRowSkelton /> */}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function ReactTable({ columns, data, sum, searchText = "", getHeaderProps, loading }) {
  const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );

  const sortingRow = rows // rows.slice(0, 9);

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
        (loading) ? (
          <TableBody {...getTableBodyProps()}>
            {TableLoadingSkeleton(columns)}
          </TableBody>
        ) : (
          <TableBody {...getTableBodyProps()}>
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
        )
      }
      <TableFooter>
        {
          (data.length > 0) && (
            <>
              {headerGroups.map((headerGroup, i) => (
                <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column, index) => (
                    <TableCell key={index} {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])}>
                      <HeaderSort column={column} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          )
        }

        {
          (loading || searchText !== "") ? (
            <></>
          ) : (
            <>
              {footerGroups.map((group, i) => (
                <TableRow key={i} {...group.getFooterGroupProps()}>
                  {group.headers.map((column, index) => (
                    <TableCell key={index} {...column.getFooterProps([{ className: column.className }])} sx={index !== 0 ? tableCellStyle : null}>
                      {column.render('Footer')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          )
        }

      </TableFooter>
    </Table>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func
};

// ==============================|| REACT TABLE - SORTING ||============================== //

const ResidualReportTable = (props) => {
  const {
    processorResidualItem = {},
    processorResidualData = {},
    loading,
    onClickExport,
    searchText,
    onChangeSearchText,
    hideNullMerchants,
    onChangeHideNullMerchants,
    processor_id
  } = props

  //const data = useMemo(() => makeData(40), []);
  const data = processorResidualData?.residualMonthReports
  
  const getTotalSumRow = (data) => {
    let totalRow = {
      merchant: 0,
      transactions: 0,
      sales_amount: 0,
      income: 0,
      expense: 0,
      net: 0,
      bps: 0,
      percentage: 0,
      agent_net: 0,
    }
    for (let k in data) {
      const item = data[k]
      totalRow['merchant'] = totalRow['merchant'] + 1
      totalRow['transactions'] = totalRow['transactions'] + item['transactions']
      totalRow['sales_amount'] = totalRow['sales_amount'] + item['sales_amount']
      totalRow['income'] = totalRow['income'] + item['income']
      totalRow['expense'] = totalRow['expense'] + item['expense']
      totalRow['net'] = totalRow['net'] + item['net']
      totalRow['bps'] = totalRow['bps'] + item['bps']
      totalRow['percentage'] = totalRow['percentage'] + item['percentage']
      totalRow['agent_net'] = totalRow['agent_net'] + item['agent_net']
    }
    return totalRow
  }
  const getTableColumnData = (data, sum) => {
    let totalRow = getTotalSumRow(data)
    
    const columns = [
      {
        Header: 'Merchant/Individual',
        accessor: 'merchant',
        Cell: (c_props) => renderMerchantCell(c_props),
        Footer: `Total (${numberFormat(data.length)} rows)`,
      },
      {
        Header: 'Txn #',
        accessor: 'transactions',
        Cell: ({ value }) => <>{numberFormat(value)}</>,
        Footer: `${numberFormat(totalRow['transactions'])}`, //Footer: `${numberFormat(sum['sum_transactions'])}`,
      },
      {
        Header: 'Sales Amount',
        accessor: 'sales_amount',
        Cell: ({ value }) => <>{priceFormat(value, '$')}</>,
        Footer: `${priceFormat(totalRow['sales_amount'], '$')}`, //Footer: `${priceFormat(sum['sum_sales_amount'], '$')}`,
      },
      {
        Header: 'Income',
        accessor: 'income',
        Cell: ({ value }) => <>{priceFormat(value, '$')}</>,
        Footer: `${priceFormat(totalRow['income'], '$')}`, //Footer: `${priceFormat(sum['sum_income'], '$')}`,
      },
      {
        Header: 'Expense',
        accessor: 'expense',
        Cell: ({ value }) => <>{priceFormat(value, '$')}</>,
        Footer: `${priceFormat(totalRow['expense'], '$')}`, //Footer: `${priceFormat(sum['sum_expense'], '$')}`,
      },
      {
        Header: 'Net',
        accessor: 'net',
        Cell: ({ value }) => <>{priceFormat(value, '$')}</>,
        Footer: `${priceFormat(totalRow['net'], '$')}`, //Footer: `${priceFormat(sum['sum_net'], '$')}`,
      },
      {
        Header: 'BPS',
        accessor: 'bps',
        Cell: ({ value }) => <>{`${priceFormat(value)}%`}</>,
        Footer: data.length > 0 ? `${priceFormat((totalRow['bps'] / data.length).toFixed(2))}%` : 0, //Footer: `${priceFormat(sum['sum_bps'])}%`,
      },
      {
        Header: '%',
        accessor: 'percentage',
        Cell: ({ value }) => <>{`${priceFormat(value)}%`}</>,
        Footer: ``,
      },
      {
        Header: 'BP Net',
        accessor: 'agent_net',
        Cell: ({ value }) => <>{priceFormat(value, '$')}</>,
        Footer: `${priceFormat(totalRow['agent_net'], '$')}`, //Footer: `${priceFormat(sum['sum_agent_net'], '$')}`,
      }
    ]
    return columns
  }

  const renderMerchantCell = (c_props) => {
    const row = c_props.row.original
    return (
      <>
        <Stack direction={`row`} spacing={1}>
          <Tooltip enterDelay={0} arrow={true} title={row?.mid}><span>{row?.merchant}</span></Tooltip>
          <Tooltip enterDelay={0} arrow={true} title={`Profitability Report for ${row?.merchant} / ${row?.mid} `}>
            <ButtonBase disableRipple={true} onClick={() => onClickMerchantProfitabilityReport(row)}><Typography color="primary">{`$`}</Typography></ButtonBase>
          </Tooltip>
        </Stack>
      </>
    )
  }

  const [currentRow, setCurrentRow] = useState()
  const [merchantResidualModalOpen, setMerchantResidualModalOpen] = useState(false)

  const onClickMerchantProfitabilityReport = (row) => {
    console.log(`onClickMerchantProfitabilityReport::::`, row)
    setCurrentRow(row)
    const mid = row['mid']
    if (mid) {
      setMerchantResidualModalOpen(true)
    } else {
      alert(`Empty merchant id`)
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////
  const columns = getTableColumnData(data, processorResidualData.sum)

  return (
    <MainCard content={false}>
      <ScrollX>
        <Box sx={{ p: 2 }}>
          <Grid container justifyContent={`space-between`} alignItems={`center`} spacing={1}>
            {/* <Grid item>
            </Grid> */}
            <Grid item>
              <FormControl component="fieldset">
                <FormGroup aria-label="position" row>
                  <FormControlLabel
                    value="start"
                    control={<Checkbox checked={hideNullMerchants} onChange={(e) => onChangeHideNullMerchants(e)} />}
                    label="Hide Inactive Merchants"
                    labelPlacement="start"
                    sx={{ mr: 1 }}
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            {/* <Grid item>
              <Button variant="contained" size="small" onClick={() => onClickExport()} startIcon={<DownloadOutlined />}>Export</Button>
            </Grid> */}
            <Grid item>
              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                <OutlinedInput
                  type="search"
                  placeholder="Search"
                  startAdornment={
                    <SearchOutlined />
                  }
                  size="small"
                  value={searchText}
                  onChange={(v) => onChangeSearchText(v)}
                />
                <Button variant="contained" size="small" onClick={() => onClickExport()} startIcon={<DownloadOutlined />}>Export</Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <div className="skicky-table-container" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <ReactTable columns={columns} data={data} sum={processorResidualData.sum} loading={loading} searchText={searchText} getHeaderProps={(column) => column.getSortByToggleProps()} />
        </div>
      </ScrollX>

      <>
        <MerchantResidualDetailModal
          show={merchantResidualModalOpen}
          setShow={setMerchantResidualModalOpen}
          title={`${currentRow?.merchant}`}
          info={currentRow}
          processor_id={processor_id}
        />
      </>
    </MainCard>
  )
}

export default ResidualReportTable;
