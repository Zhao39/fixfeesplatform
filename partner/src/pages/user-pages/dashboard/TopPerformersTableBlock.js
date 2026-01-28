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
import { numberFormat, timeConverter } from 'utils/misc';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, loading }) {
  const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } = useTable({
    columns,
    data
  });

  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup, headerGroupIndex) => {
          // Extract headerGroupProps without the key
          const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();

          return (
            <TableRow key={headerGroupIndex} {...headerGroupProps}>
              {headerGroup.headers.map((column, columnIndex) => {
                // Extract columnProps without the key
                const { key: columnKey, ...columnProps } = column.getHeaderProps([{ className: column.className }]);
                return (
                  <TableCell key={columnIndex} {...columnProps}>
                    {column.render('Header')}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableHead>


      {
        (loading) ? (
          <>
            <TableBody {...getTableBodyProps()}>
              <TableRow>
                <TableCell colSpan={3}>
                  <span>Loading...</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </>
        ) : (
          <>
            <TableBody {...getTableBodyProps()}>
              {rows.map((row, i) => {
                prepareRow(row);
                const { key, ...rowProps } = row.getRowProps(); // Separate key from rowProps
                return (
                  <TableRow key={key} {...rowProps}> {/* Pass key explicitly */}
                    {row.cells.map((cell, index) => {
                      const { key: cellKey, ...cellProps } = cell.getCellProps([{ className: cell.column.className }]); // Separate key from cellProps
                      return (
                        <TableCell key={cellKey} {...cellProps}> {/* Pass cell key explicitly */}
                          {cell.render('Cell')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>


            <TableFooter>
              {footerGroups.map((group, footerGroupIndex) => {
                const { key: footerGroupKey, ...footerGroupProps } = group.getFooterGroupProps(); // Extract the key

                return (
                  <TableRow key={footerGroupKey} {...footerGroupProps}>
                    {group.headers.map((column, columnIndex) => {
                      const { key: columnKey, ...columnProps } = column.getFooterProps([{ className: column.className }]); // Extract the key

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

          </>
        )
      }

    </Table>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  loading: PropTypes.bool
};

// ==============================|| REACT TABLE - BASIC FOOTER ||============================== //

const TopPerformersTableBlock = (props) => {
  const { pageData, loading } = props
  const data = pageData?.userBusinessList?.topPerformerList ?? []

  const generateSumRowData = (row_data) => {
    let totalAmount = 0
    let totalCount = 0
    for (let k in row_data) {
      totalAmount += Number(row_data[k]['total_paid_by_us'])
      totalCount += Number(row_data[k]['transactions_count'])
    }
    const sumRow = {
      totalAmount,
      totalCount
    }
    return sumRow
  }

  const columns = [
    {
      Header: 'Merchant',
      Footer: 'Top Performers Total',
      accessor: 'name',
    },
    {
      Header: 'Total',
      Footer: () => renderTotalFooter(),
      accessor: 'total_paid_by_us',
      className: 'cell-right',
      Cell: (c_props) => renderTotalCell(c_props)
    },
    {
      Header: 'Transactions',
      Footer: () => renderTransactionsFooter(),
      accessor: 'transactions_count',
      className: 'cell-right',
      Cell: (c_props) => renderCountCell(c_props)
    }
  ]

  const renderTotalCell = (c_props) => {
    const row = c_props.row.original
    return (
      <>
        <span>{`$${numberFormat(row.total_paid_by_us, 2)}`}</span>
      </>
    )
  }

  const renderCountCell = (c_props) => {
    const row = c_props.row.original
    return (
      <>
        <span>{`${row.transactions_count}`}</span>
      </>
    )
  }

  const renderTotalFooter = () => {
    const sumRow = generateSumRowData(data)
    return (
      <>
        <div className="footer-td-div">{`$${numberFormat(sumRow.totalAmount, 2)}`}</div>
      </>
    )
  }

  const renderTransactionsFooter = () => {
    const sumRow = generateSumRowData(data)
    return (
      <>
        <div className="footer-td-div">{sumRow.totalCount}</div>
      </>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <ScrollX>
        <ReactTable columns={columns} data={data} loading={loading} />
      </ScrollX>
    </Box>
  );
};

export default TopPerformersTableBlock;
