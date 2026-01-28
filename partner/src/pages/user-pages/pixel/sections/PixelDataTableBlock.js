import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Table, TableBody, TableCell, TableHead, TableRow, Link, TableFooter, Skeleton } from '@mui/material';

import { useTable, useSortBy, useBlockLayout, useResizeColumns } from "react-table";

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { HeaderSort } from 'components/third-party/ReactTable';
import { priceFormat } from 'utils/misc';
import { Link as RouterLink } from 'react-router-dom';
import TableColumnResizer from 'components/DataTable/TableColumnResizer';
import TableRowSkelton from 'components/TableRowSkelton';
import { showAdValue } from 'utils/ad-table-utils';

// ==============================|| REACT TABLE ||============================== //

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
      defaultColumn
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
              <TableCell key={index} {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])}>
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
              {[0].map((item) => (
                <TableRow key={item}>
                  {[0].map((col) => ( //[0, 1, 2, 3, 4, 5, 6, 7]
                    <TableCell key={col}>
                      {/* <Skeleton animation="wave" /> */}
                      <TableRowSkelton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
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
  loading: PropTypes.bool
};

// ==============================|| REACT TABLE - SORTING ||============================== //

const PixelDataTableBlock = ({ data, sumRow, loading }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Source',
        Footer: sumRow ? sumRow['name'] : '',
        accessor: 'name',
        className: 'cell-center',
        // eslint-disable-next-line
        Cell: ({ value }) => {
          switch (value) {
            case 'Facebook':
              return <Link
                variant="h6"
                component={RouterLink}
                to={'/user/pixel/ads?source=facebook'}
                color="text.primary"
              >
                {value}
              </Link>
            case 'Tiktok':
              return <Link
                variant="h6"
                component={RouterLink}
                to={'/user/pixel/ads?source=tiktok'}
                color="text.primary"
              >
                {value}
              </Link>
            default:
              return <>{value}</>
          }
        }
      },
      {
        Header: 'clicks',
        Footer: sumRow ? sumRow['clicks'] : '',
        accessor: 'clicks',
        className: 'cell-center',
        Cell: ({ value }) => {
          return <span className="es-pixel-value">{showAdValue(value)}</span>
        }
      },
      {
        Header: 'cpc',
        Footer: sumRow ? sumRow['cpc'] : '',
        accessor: 'cpc',
        className: 'cell-center',
        minWidth: 80,
        Cell: ({ value }) => {
          return <span className="es-pixel-value">{showAdValue(value)}</span>
        }
      },
      {
        Header: 'cpm',
        Footer: sumRow ? sumRow['cpm'] : '',
        accessor: 'cpm',
        className: 'cell-center',
        Cell: ({ value }) => {
          return <span className="es-pixel-value">{showAdValue(value)}</span>
        }
      },
      // {
      //   Header: 'cpp',
      //   Footer: sumRow ? sumRow['cpp'] : '',
      //   accessor: 'cpp',
      //   className: 'cell-center'
      // },
      {
        Header: 'ctr',
        Footer: sumRow ? sumRow['ctr'] : '',
        accessor: 'ctr',
        className: 'cell-center',
        Cell: ({ value }) => {
          return <span className="es-pixel-value">{showAdValue(value)}</span>
        }
      },
      {
        Header: 'impressions',
        Footer: sumRow ? sumRow['impressions'] : '',
        accessor: 'impressions',
        className: 'cell-center',
        Cell: ({ value }) => {
          return <span className="es-pixel-value">{showAdValue(value)}</span>
        }
      },
      {
        Header: 'reach',
        Footer: sumRow ? sumRow['reach'] : '',
        accessor: 'reach',
        className: 'cell-center',
        Cell: ({ value }) => {
          return <span className="es-pixel-value">{showAdValue(value)}</span>
        }
      },
      {
        Header: 'Spend',
        Footer: sumRow ? (<span className="es-pixel-value">{`${sumRow['spend'] ? showAdValue(sumRow['spend'], { unit: 'price', unitPosition: 'before' }) : "-"}`}</span>) : '',
        accessor: 'spend',
        className: 'cell-center',
        Cell: ({ value }) => {
          return <span className="es-pixel-value">{`${value ? showAdValue(value, { unit: 'price', unitPosition: 'before' }) : "-"}`}</span>
        }
      },
    ],
    [sumRow]
  );

  return (
    <MainCard content={false}>
      <ScrollX>
        <div className="skicky-table-container" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <ReactTable columns={columns} data={data} getHeaderProps={(column) => column.getSortByToggleProps()} sumRow={sumRow} loading={loading} />
        </div>
      </ScrollX>
    </MainCard>
  )
}

PixelDataTableBlock.propTypes = {
  data: PropTypes.any,
  sumRow: PropTypes.object,
  loading: PropTypes.bool
};
export default PixelDataTableBlock;
