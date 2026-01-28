import React, { useState, useEffect, useMemo, Fragment } from "react"
import { alpha, useTheme } from '@mui/material/styles';
import { useTable, usePagination, useSortBy } from "react-table"
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import axios from 'axios'
import {
  useMediaQuery,
  Link,
  Button,
  Chip,
  Dialog,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { HeaderSort } from "components/third-party/ReactTable"
import ReactTablePagination from './ReactTablePagination'
import TableFilter from "./TableFilter";

const queryClient = new QueryClient()

const initialState = {
  queryPageIndex: 0,
  queryPageSize: 5,
  totalCount: 0,
  queryPageFilter: "",
  queryPageSortBy: [],
};

const PAGE_CHANGED = 'PAGE_CHANGED';
const PAGE_SIZE_CHANGED = 'PAGE_SIZE_CHANGED';
const PAGE_SORT_CHANGED = 'PAGE_SORT_CHANGED';
const PAGE_FILTER_CHANGED = 'PAGE_FILTER_CHANGED';
const TOTAL_COUNT_CHANGED = 'TOTAL_COUNT_CHANGED';

const reducer = (state, { type, payload }) => {
  switch (type) {
    case PAGE_CHANGED:
      return {
        ...state,
        queryPageIndex: payload,
      };
    case PAGE_SIZE_CHANGED:
      return {
        ...state,
        queryPageSize: payload,
      };
    case PAGE_SORT_CHANGED:
      return {
        ...state,
        queryPageSortBy: payload,
      };
    case PAGE_FILTER_CHANGED:
      return {
        ...state,
        queryPageFilter: payload,
      };
    case TOTAL_COUNT_CHANGED:
      return {
        ...state,
        totalCount: payload,
      };
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
};



const DataTable = (props) => {
  const {
    dataListApiUrl,
    tableName,
    tableColumns,
    defaultQueryPageSize = 10,
    defaultQueryPageSortBy = [],
    showFilter = true,
    showTableHead = true,
    renderAddItemComponent = null,
    showHeaderBar = true,
    tableTimestamp,
    setTableTimestamp,
    noBackground,
    striped = true,
    fixFirstColumn = true,
    otherParams
  } = props
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const defaultLoadingText = "" //"Loading..."

  const [tableApiIsLoading, setTableApiIsLoading] = useState(false);
  const fetchItemsData = async (datatableApiUrl, page, pageSize, pageFilter, pageSortBy, params = {}) => {
    let paramStr = ''
    if (pageFilter.trim().length > 1) {
      paramStr = `&keyword=${pageFilter}`
    }
    if (pageSortBy.length > 0) {
      const sortParams = pageSortBy[0];
      const sortyByDir = sortParams.desc ? 'desc' : 'asc'
      paramStr = `${paramStr}&sortby=${sortParams.id}&direction=${sortyByDir}`
    }
    if (params) {
      for (let k in params) {
        paramStr = `${paramStr}&${k}=${params[k]}`
      }
    }
    try {
      setTableApiIsLoading(true)

      const url = new URL(datatableApiUrl);
      const urlQueryString = url.search
      //console_log(`urlQueryString::::`, datatableApiUrl, url, urlQueryString)
      const apiUrl = `${datatableApiUrl}${urlQueryString ? '&' : '?'}page=${page + 1}&limit=${pageSize}${paramStr}`
      const response = await axios.get(
        apiUrl
      );

      setTableApiIsLoading(false)
      const results = response.data.data;
      const data = {
        results: results,
        count: response.data.total
      };
      return data;
    } catch (e) {
      throw new Error(`API error:${e?.message}`);
    }
  };

  const [keyword, setKeyword] = useState('');
  const [useFilter, setUseFilter] = useState(false);
  const onClickFilterCallback = (filter) => {
    // if (filter.trim() === "") {
    //   alert('Please enter a keyword to search!')
    //   return
    // }
    // if (filter === keyword) {
    //   alert('No change in search')
    //   return
    // }
    setUseFilter(true)
    setKeyword(filter)
  }

  let columns = useMemo(() => tableColumns, [])

  const [{ queryPageIndex, queryPageSize, totalCount, queryPageFilter, queryPageSortBy }, dispatch] = React.useReducer(reducer, { ...initialState, queryPageSize: defaultQueryPageSize, queryPageSortBy: defaultQueryPageSortBy });

  const { isLoading, error, data, isSuccess } = useQuery(
    [tableName, queryPageIndex, queryPageSize, queryPageFilter, queryPageSortBy, tableTimestamp],
    () => fetchItemsData(dataListApiUrl, queryPageIndex, queryPageSize, queryPageFilter, queryPageSortBy, otherParams),
    {
      keepPreviousData: true,
      staleTime: Infinity,
    }
  );

  const totalPageCount = Math.ceil(totalCount / queryPageSize)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    pageCount,
    pageOptions,
    gotoPage,
    previousPage,
    canPreviousPage,
    nextPage,
    canNextPage,
    setPageSize,
    state: { globalFilter, pageIndex, pageSize, sortBy },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable({
    columns,
    data: data?.results || [],
    initialState: {
      pageIndex: queryPageIndex,
      pageSize: queryPageSize,
      sortBy: queryPageSortBy,
    },
    manualPagination: true,
    pageCount: data ? totalPageCount : null,
    autoResetSortBy: false,
    autoResetExpanded: false,
    autoResetPage: false
  },
    useSortBy,
    usePagination,
  );
  const manualPageSize = []

  useEffect(() => {
    dispatch({ type: PAGE_CHANGED, payload: pageIndex });
  }, [pageIndex]);

  useEffect(() => {
    dispatch({ type: PAGE_SIZE_CHANGED, payload: pageSize });
    gotoPage(0);
  }, [pageSize, gotoPage]);

  useEffect(() => {
    dispatch({ type: PAGE_SORT_CHANGED, payload: sortBy });
    gotoPage(0);
  }, [sortBy, gotoPage]);

  useEffect(() => {
    if (useFilter) {
      dispatch({ type: PAGE_FILTER_CHANGED, payload: keyword });
      gotoPage(0);
    }
  }, [keyword, gotoPage, useFilter]);

  React.useEffect(() => {
    if (data) {
      if (data?.count) {
        dispatch({
          type: TOTAL_COUNT_CHANGED,
          payload: data.count,
        });
      } else if (data?.count === 0) {
        setTableIndicatorString("No result found")
      }
    }

  }, [data?.count]);

  React.useEffect(() => {
    if (isLoading) {
      if (data?.count) {
        setTableIndicatorString(defaultLoadingText)
      }
    }
  }, [isLoading]);

  const [tableIndicatorString, setTableIndicatorString] = useState(defaultLoadingText)

  // if (error) {
  //   return <p>Error</p>;
  // }

  //if (isSuccess)

  return (
    <div className={`react-table-container ${tableApiIsLoading ? 'loading' : ''}`}>
      <Stack spacing={3}>
        <div className='react-table-main-container'>
          {
            (showHeaderBar) && (
              <Stack
                direction={matchDownSM ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={matchDownSM ? 'flex-start' : 'center'}
                spacing={1}
                sx={{ p: 3 }}
              >
                {
                  (showFilter) ? (<TableFilter onClickFilterCallback={onClickFilterCallback} defaultKeyword={keyword} />) : (<></>)
                }
                {
                  (renderAddItemComponent !== null) && renderAddItemComponent()
                }
              </Stack>
            )
          }

          {(data?.count !== null) &&
            <>
              {
                (data?.count > 0) ? (
                  <Table {...getTableProps()}>
                    {
                      (showTableHead) ? (
                        <TableHead>
                          {headerGroups.map((headerGroup, i) => (
                            <TableRow key={i} {...headerGroup.getHeaderGroupProps()} sx={ fixFirstColumn ? { '& > th:first-of-type': { width: '58px' } } : {}}>
                              {headerGroup.headers.map((column, index) => (
                                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())} key={index}>
                                  {column.isSorted ? <></> : column.render('Header')}
                                  {column.isSorted ? <HeaderSort column={column} /> : ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableHead>
                      ) : (
                        <></>
                      )
                    }

                    <TableBody {...getTableBodyProps()} {...(striped && { className: 'striped' })}>
                      {page.map((row, i) => {
                        prepareRow(row);
                        const rowProps = row.getRowProps();
                        return (
                          <Fragment key={i}>
                            <TableRow
                              {...row.getRowProps()}
                              // onClick={() => {
                              //   row.toggleRowSelected();
                              // }}
                              sx={{
                                cursor: 'pointer',
                                bgcolor: noBackground ? 'transparent !important' : (row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit')
                              }}
                            >
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
                  </Table>
                ) : (
                  <>
                    <Typography sx={{ p: 3, textAlign: 'center' }}>{tableIndicatorString}</Typography>
                  </>
                )
              }
            </>
          }
        </div>
        {(rows.length > 0) && (
          <>
            <ReactTablePagination
              page={page}
              gotoPage={gotoPage}
              previousPage={previousPage}
              nextPage={nextPage}
              canPreviousPage={canPreviousPage}
              canNextPage={canNextPage}
              pageOptions={pageOptions}
              pageSize={pageSize}
              pageIndex={pageIndex}
              pageCount={pageCount}
              setPageSize={setPageSize}
              manualPageSize={manualPageSize}
              dataLength={totalCount}
            />
          </>
        )}
      </Stack>
    </div>
  )
}

const DataTableWrapper = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataTable
        {...props}
      />
    </QueryClientProvider>
  )
}

export default DataTableWrapper;