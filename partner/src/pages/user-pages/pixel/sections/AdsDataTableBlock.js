import PropTypes from 'prop-types';
import { useCallback, useEffect, useState, Fragment, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Alert, Stack, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, Typography, useMediaQuery } from '@mui/material';

// third-party
import { useTable, useSortBy, useExpanded, useBlockLayout, useResizeColumns } from "react-table";

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { HeaderSort } from 'components/third-party/ReactTable';

// assets
import { get_data_value } from 'utils/misc';
import { useSelector } from 'react-redux';
import { AdsDataTableForm } from './AdsDataTableForm/AdsDataTableForm';

import TableColumnResizer from 'components/DataTable/TableColumnResizer';
import TableRowSkelton from 'components/TableRowSkelton';

const TableLoadingSkeleton = (columns) => {
  const skeltonColumnLength = columns.length - 1
  let skeltonColumns = []
  // for (let i = 0; i < skeltonColumnLength; i++) {
  //   skeltonColumns.push(i)
  // }
  skeltonColumns = [0]

  return (
    <>
      {[0].map((item) => (
        <TableRow key={item}>
          {/* <TableCell /> */}
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
// ==============================|| REACT TABLE - SUB ROW ||============================== //

function SubRows({ row, rowProps, data, loading, columns }) {
  const theme = useTheme();

  if (loading) {
    return (
      <>
        {TableLoadingSkeleton(columns)}
      </>
    )
  }

  return (
    <>
      {data.map((x, i) => (
        <TableRow
          key={`sub-${data.id}-${i}`}
          {...{ ...rowProps, key: `${i}-${rowProps.key}` }}
        //sx={{ bgcolor: alpha(theme.palette.primary.lighter, 0.95) }}
        >
          {row.cells.map((cell, index) => (
            <TableCell key={index} {...cell.getCellProps([{ className: cell.column.className }])}>
              {cell.render(cell.column.SubCell ? 'SubCell' : 'Cell', {
                value: cell.column.accessor && cell.column.accessor(x, i),
                row: { ...row, original: x }
              })}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

SubRows.propTypes = {
  row: PropTypes.object,
  rowProps: PropTypes.any,
  data: PropTypes.array,
  loading: PropTypes.bool
};

// ==============================|| SUB ROW - ASYNC DATA ||============================== //

function SubRowAsync({ row, rowProps, columns, source = 'facebook' }) {
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)
  const currentDateRange = get_data_value(settingPersistDataStore, 'currentDateRange')

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    loadAdsetInsightData()
    // eslint-disable-next-line
  }, []);

  const loadAdsetInsightData = async () => {
     
  }

  return <SubRows row={row} rowProps={rowProps} data={data} loading={loading} columns={columns} />;
}

SubRowAsync.propTypes = {
  row: PropTypes.object,
  rowProps: PropTypes.any,
  source: PropTypes.string,
  columns: PropTypes.any
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns: userColumns, data, renderRowSubComponent, getHeaderProps, loading, striped = true }) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 140,
      //width: 150,
      maxWidth: 800
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, visibleColumns, footerGroups, resetResizing } = useTable(
    {
      columns: userColumns,
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
    useExpanded,
    useBlockLayout,
    useResizeColumns
  )

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
              {TableLoadingSkeleton(userColumns)}
            </TableBody>
          ) : (
            <>
              <TableBody {...getTableBodyProps()} {...(striped && { className: 'striped' })}>
                {rows.map((row, i) => {
                  prepareRow(row);
                  const rowProps = row.getRowProps();
                  return (
                    <Fragment key={i}>
                      <TableRow {...row.getRowProps()}>
                        {row.cells.map((cell, index) => (
                          <TableCell key={index} {...cell.getCellProps([{ className: cell.column.className }])}>
                            {cell.render('Cell')}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.isExpanded && renderRowSubComponent({ row, rowProps, visibleColumns })}
                    </Fragment>
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
  renderRowSubComponent: PropTypes.any,
  getHeaderProps: PropTypes.func,
  sumRow: PropTypes.object,
  loading: PropTypes.bool
};
// ==============================|| REACT TABLE - EXPANDING TABLE ||============================== //

const AdsDataTableBlock = (props) => {
  const { title, columns, data, sumRow, loading, source = 'facebook', error } = props

  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [searchKeyword, setSearchKeyword] = useState("")
  const tableData = useMemo(() => data.filter((item) => item.name.includes(searchKeyword)), [searchKeyword, data])

  const renderRowSubComponent = useCallback(({ row, rowProps }) => <SubRowAsync row={row} rowProps={rowProps} source={source} columns={columns} />, [columns]);

  return (
    <Stack direction={`column`} spacing={3}>
      <Stack direction={matchesXs ? `column` : `row`} spacing={3} justifyContent={`space-between`}>
        <Typography variant="h4">{title}</Typography>
        <AdsDataTableForm
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
        />
      </Stack>

      {
        (error) ? (
          <>
            <Alert severity="error" icon={false} sx={{ display: "flex", justifyContent: "flex-start", fontSize: '1.15em' }}>{error}</Alert>
          </>
        ) : (
          <></>
        )
      }

      <MainCard content={false}>
        <ScrollX>
          <div className="skicky-table-container" style={{maxHeight: 'calc(100vh - 300px)'}}>
            <ReactTable
              columns={columns}
              data={tableData}
              renderRowSubComponent={renderRowSubComponent}
              getHeaderProps={(column) => column.getSortByToggleProps()}
              sumRow={sumRow}
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
              loading={loading}
            />
          </div>
        </ScrollX>
      </MainCard>
    </Stack>
  )
}

AdsDataTableBlock.propTypes = {
  columns: PropTypes.any,
  data: PropTypes.any,
  sumRow: PropTypes.object,
  loading: PropTypes.bool,
  source: PropTypes.string,
};

export default AdsDataTableBlock;
