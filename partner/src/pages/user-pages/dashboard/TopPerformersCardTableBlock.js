import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Chip, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material';

// third-party
import { useTable } from 'react-table';

// project import
import LinearWithLabel from 'components/@extended/Progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import makeData from 'data/react-table';
import { numberFormat } from 'utils/misc';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, loading }) {
  const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup) => {
          const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();

          return (
            <TableRow key={headerGroupKey} {...headerGroupProps}>
              {headerGroup.headers.map((column) => {
                const { key: columnKey, ...columnProps } = column.getHeaderProps([{ className: column.className }]);
                return (
                  <TableCell key={columnKey} {...columnProps}>
                    {column.render('Header')}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableHead>
      <TableBody {...getTableBodyProps()}>
        {loading ? (
          <TableRow>
            <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
              <span>Loading...</span>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => {
            prepareRow(row);
            const { key, ...rowProps } = row.getRowProps();
            return (
              <TableRow key={key} {...rowProps}>
                {row.cells.map((cell) => {
                  const { key: cellKey, ...cellProps } = cell.getCellProps([{ className: cell.column.className }]);
                  return (
                    <TableCell key={cellKey} {...cellProps}>
                      {cell.render('Cell')}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
      <TableFooter>
        {footerGroups.map((footerGroup) => {
          const { key: footerGroupKey, ...footerGroupProps } = footerGroup.getFooterGroupProps();
          return (
            <TableRow key={footerGroupKey} {...footerGroupProps}>
              {footerGroup.headers.map((column) => {
                const { key: columnKey, ...columnProps } = column.getFooterProps([{ className: column.className }]);
                return (
                  <TableCell key={columnKey} {...columnProps}>
                    {column.render('Footer')}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableFooter>
    </Table>
  );
}


ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  loading: PropTypes.bool
};


// ==============================|| REACT TABLE - BASIC FOOTER ||============================== //

const TopPerformersCardTableBlock = (props) => {
  const { pageData, loading } = props
  const data = pageData?.userBusinessList?.topPerformerCardTypeList ?? []

  const generateSumRowData = (row_data) => {
    let totalAmount = 0
    let totalCount = 0
    for (let k in row_data) {
      totalAmount += Number(row_data[k]['amount'])
      totalCount += Number(row_data[k]['count'])
    }
    const sumRow = {
      totalAmount,
      totalCount
    }
    return sumRow
  }

  const columns = [
    {
      Header: 'Card Type',
      Footer: 'Total',
      accessor: 'type',
      Cell: (c_props) => renderCardTypeCell(c_props)
    },
    {
      Header: 'Total',
      Footer: () => renderTotalFooter(),
      accessor: 'amount',
      className: 'cell-right',
      Cell: (c_props) => renderTotalCell(c_props)
    },
    {
      Header: 'Transactions',
      Footer: () => renderTransactionsFooter(),
      accessor: 'count',
      className: 'cell-right',
      Cell: (c_props) => renderCountCell(c_props)
    }
  ]

  const renderCardTypeCell = (c_props) => {
    const row = c_props.row.original
    return (
      <>
        {
          (row.type === "OT") ? (
            <div className="card-table-str-container">
              <span>Other</span>
            </div>
          ) : (
            <div className="card-table-image-container">
              <img src={`/assets/global/images/card-type/${row.type}.svg`} className="card-table-img" alt="card type" />
            </div>
          )
        }
      </>
    )
  }

  const renderTotalCell = (c_props) => {
    const row = c_props.row.original
    return <span>{`$${numberFormat(row.amount, 2)}`}</span>
  }

  const renderCountCell = (c_props) => {
    const row = c_props.row.original
    return <span>{`${row.count}`}</span>
  }

  const renderTotalFooter = () => {
    const sumRow = generateSumRowData(data)
    return <div className="footer-td-div">{`$${numberFormat(sumRow.totalAmount, 2)}`}</div>
  }

  const renderTransactionsFooter = () => {
    const sumRow = generateSumRowData(data)
    return <div className="footer-td-div">{sumRow.totalCount}</div>
  }

  return (
    <Box sx={{ width: '100%' }}>
      <ScrollX>
        <ReactTable columns={columns} data={data} loading={loading} />
      </ScrollX>
    </Box>
  );
};

export default TopPerformersCardTableBlock;
