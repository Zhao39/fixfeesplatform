import React, { useState, useEffect, useMemo, Fragment } from "react"
import { alpha, useTheme } from '@mui/material/styles';
import { useTable, usePagination, useSortBy } from "react-table"
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ToggleButtonGroup, ToggleButton, Select, MenuItem } from '@mui/material';

import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';

import useConfig from 'hooks/useConfig';

import axios from 'axios'
import {
  useMediaQuery,
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
import { MERCHANT_COLORS, PARTNER_COLORS } from "config/constants";
import { getPartnerStatusTextColor, getStatusTextColor } from "config/global_functions";
import { boxSizing } from "@mui/system";

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
    anotherFilter = false,
    levelDrop = false,
    showPartnerFilter = false,
    showTableHead = true,
    renderAddItemComponent = null,
    showHeaderBar = true,
    tableTimestamp,
    fixFirstColumn = true,
    otherParams,
    type = "",
    tableBackColor,
    onClickViewLead,
    filterOption,
    setEnableClickRow
  } = props;

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const defaultLoadingText = "" //"Loading..."

  const [merchantType, setMerchantType] = useState("");
  const [filterResults, setFilterResults] = useState([]);
  const [tableApiIsLoading, setTableApiIsLoading] = useState(false);
  const [curLevel, setCurLevel] = useState("all");
  const [curPartnerFilter, setCurPartnerFilter] = useState("all");

  const dropList = [
    {
      value: 'all',
      text: 'All'
    },
    {
      value: 'level_1',
      text: 'Level 1'
    },
    {
      value: 'level_2',
      text: 'Level 2'
    },
    {
      value: 'level_3',
      text: 'Level 3'
    }
  ]

  const partnerFilterOptionList = [
    {
      value: 'all',
      text: 'All'
    },
    {
      value: 'level_1',
      text: 'Level 1'
    },
    {
      value: 'level_2',
      text: 'Level 2'
    },
    {
      value: 'tier_1',
      text: 'Tier 1'
    },
    {
      value: 'tier_2',
      text: 'Tier 2'
    },
    {
      value: 'tier_3',
      text: 'Tier 3'
    },
    {
      value: 'tier_4',
      text: 'Tier 4'
    },
    {
      value: 'silver',
      text: 'Silver Status'
    },
    {
      value: 'gold',
      text: 'Gold Status'
    },
    {
      value: 'platinum',
      text: 'Platinum Status'
    }
  ]

  const onChangeLevel = (v) => {
    const level = v.target.value
    setCurLevel(level)
    updateFetchData(merchantType, pageIndex, { curLevel: level })
  }

  const onChangeCurPartnerFilter = (v) => {
    const partnerFilter = v.target.value
    setCurPartnerFilter(partnerFilter)
    updateFetchData(merchantType, pageIndex, { curPartnerFilter: partnerFilter })
  }

  const fetchItemsData = async (
    datatableApiUrl,
    page,
    pageSize,
    pageFilter,
    pageSortBy,
    merchantType,  // Add merchantType as a parameter
    params = {},
    sponsorKeyword = ''
  ) => {
    let paramStr = '';

    // Add filtering by keyword (pageFilter)
    if (pageFilter.trim().length > 1) {
      paramStr = `&keyword=${pageFilter}`;
    }

    // Add sorting params
    if (pageSortBy.length > 0) {
      const sortParams = pageSortBy[0];
      const sortyByDir = sortParams.desc ? 'desc' : 'asc';
      paramStr = `${paramStr}&sortby=${sortParams.id}&direction=${sortyByDir}`;
    }

    // Add any other params

    if (params) {
      for (let k in params) {
        paramStr = `${paramStr}&${k}=${params[k]}`;
      }
    }
    if (merchantType != null) {
      paramStr = `${paramStr}&merchantType=${merchantType}`;
    }

    if (sponsorKeyword != null) {
      paramStr = `${paramStr}&sponsorKeyword=${sponsorKeyword}`;
    }

    try {
      setTableApiIsLoading(true);

      const url = new URL(datatableApiUrl);
      const apiUrl = `${datatableApiUrl}${url.search ? '&' : '?'}page=${page + 1}&limit=${pageSize}${paramStr}`;

      const response = await axios.get(apiUrl);
      let results = response.data.data;

      setTableApiIsLoading(false);

      const data = {
        results: results,
        count: response.data.total
      };

      return data;
    } catch (e) {
      setTableApiIsLoading(false);
      throw new Error(`API error: ${e?.message}`);
    }
  };

  const [keyword, setKeyword] = useState('');
  const [useFilter, setUseFilter] = useState(false);

  const onClickFilterCallback = (filter) => {
    setUseFilter(true)
    setKeyword(filter)
  }

  const [sponsorKeyword, setSponsorKeyword] = useState('');
  const [useSponsorFilter, setUseSponsorFilter] = useState(false);

  const onClickSponsorFilterCallback = (filter) => {
    setUseSponsorFilter(true)
    setSponsorKeyword(filter)
  }

  let columns = useMemo(() => tableColumns, [])

  const [{ queryPageIndex, queryPageSize, totalCount, queryPageFilter, queryPageSortBy }, dispatch] = React.useReducer(reducer, { ...initialState, queryPageSize: defaultQueryPageSize, queryPageSortBy: defaultQueryPageSortBy });

  const { isLoading, error, data, isSuccess } = useQuery(
    [tableName, queryPageIndex, queryPageSize, queryPageFilter, queryPageSortBy, tableTimestamp, sponsorKeyword],
    () => fetchItemsData(dataListApiUrl, queryPageIndex, queryPageSize, keyword, queryPageSortBy, merchantType, otherParams, sponsorKeyword), // Use keyword for filtering
    {
      keepPreviousData: true,
      staleTime: Infinity,
    }
  );

  const totalPageCount = Math.ceil(totalCount / queryPageSize)

  const dataToDisplay = useMemo(() => {
    // Use filtered results if available, otherwise fallback to API data

    // return filterResults.length > 0 ? filterResults : firstRenderData || [];
    var tempData = filterResults.length > 0 ? filterResults : [];
    return tempData;
  }, [filterResults]);

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
  } = useTable({
    columns,
    data: dataToDisplay,  // Use filtered data or API data
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
  }, useSortBy, usePagination);
  const manualPageSize = []

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: PAGE_CHANGED, payload: pageIndex });
      await updateFetchData(merchantType, pageIndex); // Wait for the data to be fetched
    };

    fetchData(); // Call the async function
  }, [pageIndex, tableTimestamp]);

  useEffect(() => {
    gotoPage(0);
    const fetchData = async () => {
      dispatch({ type: PAGE_CHANGED, payload: 0 });
      await updateFetchData(merchantType, 0); // Wait for the data to be fetched
    }
    fetchData();
  }, [merchantType]);

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

  const updateFetchData = async (newView, pageIndex, restParams = {}) => {
    const updatedData = await fetchItemsData(
      dataListApiUrl,
      pageIndex,
      queryPageSize,
      keyword,
      queryPageSortBy,
      newView, // Pass the selected merchant type (newView) to fetchItemsData
      { ...otherParams, ...restParams }
    );

    // Update the filter results to reflect the newly fetched data
    setFilterResults(updatedData.results || []); // Ensure it's an empty array if no results
    dispatch({ type: TOTAL_COUNT_CHANGED, payload: updatedData.count }); // Update the total count
  }

  const handleChange = async (event, newView) => {

    if (newView !== null) {
      setMerchantType(newView === merchantType ? -1 : newView); // Update the state with the selected merchant type
    }
    // Fetch data based on the selected merchant type (newView)
    await updateFetchData(newView, pageIndex);
  };

  const renderToggleButtonOptions = () => {
    if (filterOption === "merchants") {
      return [
        <ToggleButton value="" key="">All</ToggleButton>,
        <ToggleButton value="-1" key="-1">Prospects</ToggleButton>,
        <ToggleButton value="0" key="0">Onboarding</ToggleButton>,
        <ToggleButton value="1" key="1">Underwriting</ToggleButton>,
        <ToggleButton value="2" key="2">Install</ToggleButton>,
        <ToggleButton value="3" key="3">Active Merchant</ToggleButton>,
        <ToggleButton value="4" key="4">Closed Merchant</ToggleButton>
      ];
    } else if (filterOption === "brand_partners") {
      return [
        <ToggleButton key="" value="">All</ToggleButton>,
        <ToggleButton key="3" value="3">Prospects</ToggleButton>,
        <ToggleButton key="2" value="2">Opt-in</ToggleButton>,
        <ToggleButton key="1" value="1">Active</ToggleButton>,
        <ToggleButton key="0" value="0">Inactive</ToggleButton>,
      ];
    }
    return null;
  }


  const { mode } = useConfig();
  const [alignment, setAlignment] = React.useState('1');

  const handleAlignment = (event, newAlignment) => {
    setMerchantType(newAlignment);
  };

  return (
    <div className={`react-table-container ${tableApiIsLoading ? 'loading' : ''}`}>
      <Stack spacing={3}>
        <div className='react-table-main-container'>
          {showHeaderBar && (
            <Stack
              direction={matchDownSM ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems={matchDownSM ? 'flex-start' : 'center'}
              spacing={1}
              sx={{ p: 3 }}
            >
              {showFilter && (
                <>
                  <Stack direction={'row'}
                    spacing={1}
                  >
                    <TableFilter onClickFilterCallback={onClickFilterCallback} defaultKeyword={keyword} />
                    {anotherFilter && (
                      <>
                        <TableFilter onClickFilterCallback={onClickSponsorFilterCallback} defaultKeyword={sponsorKeyword} placeholder={"Search By Sponsor"} />
                      </>
                    )}
                  </Stack>

                  {levelDrop && <Stack direction={'row'}
                    spacing={1}
                    alignItems="end"
                    justifyContent={"end"}
                    justifySelf={"end"}
                    style={{ float: 'right', width: '70%' }}
                  >
                    <Select size="small" style={{ width: 120 }} labelId="demo-simple-select-label" id="demo-simple-select" value={curLevel} onChange={(v) => onChangeLevel(v)}>
                      {
                        dropList.map((item, index) => {
                          return (
                            <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
                          )
                        })
                      }
                    </Select>
                  </Stack>}

                  {showPartnerFilter && <Stack direction={'row'}
                    spacing={1}
                    alignItems="end"
                    justifyContent={"end"}
                    justifySelf={"end"}
                    style={{ float: 'right', width: '100%' }}
                  >
                    <Select size="small" style={{ width: 120 }} labelId="demo-simple-select-label" id="demo-simple-select1" value={curPartnerFilter} onChange={(v) => onChangeCurPartnerFilter(v)}>
                      {
                        partnerFilterOptionList.map((item, index) => {
                          return (
                            <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
                          )
                        })
                      }
                    </Select>
                  </Stack>}
                  <ToggleButtonGroup
                    color="primary"
                    exclusive
                    value={merchantType}
                    onChange={handleAlignment}
                    aria-label="Platform"
                  >
                    {renderToggleButtonOptions()}
                  </ToggleButtonGroup>

                </>
              )}

              {renderAddItemComponent !== null && renderAddItemComponent()}
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
                          {headerGroups.map((headerGroup, headerIndex) => {
                            const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                            return (
                              <TableRow
                                key={`headerGroup-${headerIndex}`} // Explicitly set key for header group
                                {...headerGroupProps}
                                sx={fixFirstColumn ? { '& > th:first-of-type': { width: '58px' } } : {}}
                              >
                                {headerGroup.headers.map((column, columnIndex) => {
                                  const { key: columnKey, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                                  return (
                                    < TableCell
                                      key={`column-${columnIndex}`
                                      } // Explicitly set key for column
                                      {...columnProps}
                                    >
                                      {column.isSorted ? <HeaderSort column={column} /> : column.render('Header')}
                                    </TableCell>

                                  )
                                })}
                              </TableRow>
                            )
                          })}
                        </TableHead>
                      ) : null
                    }
                    <TableBody {...getTableBodyProps()}>
                      {page.map((row, rowIndex) => {
                        prepareRow(row);
                        const { key: rowKey, ...rowProps } = row.getRowProps(); // Extract the `key` property
                        const rowStatus = row.original.status;
                        const getTextColor = (status) => {
                          if (status === 2 || status === 3) {
                            return 'white';
                          } else if (status === 0 || status === 1) {
                            return 'black';
                          }
                          return 'black';
                        };

                        const textColor = getTextColor(rowStatus);
                        let bgColor = 'transparent';

                        if (tableBackColor == true) {
                          if (type == "merchant")
                            bgColor = MERCHANT_COLORS[`${rowStatus}`];
                          else {
                            bgColor = PARTNER_COLORS[`${rowStatus}`];
                          }
                        } else {
                          bgColor = tableBackColor;
                        }

                        let tdColor = 'white';
                        if (tableBackColor == true) {
                          if (type == "merchant") {
                            tdColor = getStatusTextColor(parseInt(rowStatus), mode);
                          } else {
                            tdColor = getPartnerStatusTextColor(parseInt(rowStatus), mode);
                          }
                        } else {
                          tdColor = tableBackColor
                        }

                        return (
                          <TableRow
                            key={rowKey} // Pass key directly
                            {...rowProps} // Spread other props
                            sx={{
                              '& td': {
                                color: tdColor,
                              },
                              background: bgColor,
                              '&:hover': {
                                background: 'none',
                                color: 'white',
                                '& td': {
                                  color: mode === "dark" ? "white" : "black",
                                  background: '#3a3a3a36'
                                },
                              },
                            }}
                            onClick={() => setEnableClickRow ? onClickViewLead(row.original) : ''}
                          >
                            {row.cells.map((cell, cellIndex) => {
                              const { key: cellKey, ...cellProps } = cell.getCellProps();
                              return (
                                <TableCell
                                  key={cellKey}
                                  {...cellProps}
                                  sx={{ color: tableBackColor ? 'tdColor' : mode === "dark" ? "white" : "black" }}
                                >
                                  {cell.render('Cell')}
                                </TableCell>
                              );
                            })}
                          </TableRow>
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
        {
          (rows.length > 0) && (
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
          )
        }
      </Stack >
    </div >
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