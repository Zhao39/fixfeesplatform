import PropTypes from 'prop-types';
import { useEffect, useMemo, Fragment } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Chip
} from '@mui/material';

// third-party
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// project import
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import ScrollX from 'components/ScrollX';
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';
import { HeaderSort, TablePagination } from 'components/third-party/ReactTable';

// assets
import { CloseOutlined, EyeTwoTone, EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { get_data_value, priceFormat, timeConverter } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, getHeaderProps, handleAdd, striped = true }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);
  const sortBy = { id: 'fatherName', desc: false };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setHiddenColumns,
    allColumns,
    visibleColumns,
    rows,
    // @ts-ignore
    page,
    // @ts-ignore
    gotoPage,
    // @ts-ignore
    setPageSize,
    // @ts-ignore
    state: { globalFilter, selectedRowIds, pageIndex, pageSize },
    // @ts-ignore
    preGlobalFilteredRows,
    // @ts-ignore
    setGlobalFilter,
    // @ts-ignore
    setSortBy
  } = useTable(
    {
      columns,
      data,
      // @ts-ignore
      filterTypes,
      // @ts-ignore
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['avatar', 'email'], sortBy: [sortBy] }
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  useEffect(() => {
    if (matchDownSM) {
      //   setHiddenColumns(['age', 'contact', 'visits', 'email', 'status', 'avatar']);
    } else {
      //   setHiddenColumns(['avatar', 'email']);
    }
    // eslint-disable-next-line
  }, [matchDownSM]);

  return (
    <>
      {/* <TableRowSelection selected={Object.keys(selectedRowIds).length} /> */}
      <Stack spacing={3}>
        <Stack
          direction={matchDownSM ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ p: 3, pb: 0 }}
        >
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            size="small"
          />
        </Stack>

        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup, i) => (
              <TableRow key={i} {...headerGroup.getHeaderGroupProps()} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell key={index} {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])}>
                    <HeaderSort column={column} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()} {...(striped && { className: 'striped' })}>
            {page.map((row, i) => {
              prepareRow(row);
              const rowProps = row.getRowProps();

              return (
                <Fragment key={i}>
                  <TableRow
                    {...row.getRowProps()}
                    onClick={() => {
                      row.toggleRowSelected();
                    }}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit'
                    }}
                  >
                    {row.cells.map((cell, index) => (
                      <TableCell key={index} {...cell.getCellProps([{ className: cell.column.className }])}>
                        {cell.render('Cell')}
                      </TableCell>
                    ))}
                  </TableRow>
                </Fragment>
              );
            })}
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
};

// ==============================|| CUSTOMER - LIST VIEW ||============================== //

const CellCustomerDetails = ({ row }) => {
  const { values } = row;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar alt="Avatar 1" size="sm" src={avatarImage(`./avatar-${!values.avatar ? 1 : values.avatar}.png`)} />
      <Stack spacing={0}>
        <Typography variant="subtitle1">{values.fatherName}</Typography>
        <Typography variant="caption" color="textSecondary">
          {values.email}
        </Typography>
      </Stack>
    </Stack>
  );
};

CellCustomerDetails.propTypes = {
  row: PropTypes.object
};

const CellActions = ({ row }) => {
  const theme = useTheme();
  const collapseIcon = row.isExpanded ? (
    <CloseOutlined style={{ color: theme.palette.error.main }} />
  ) : (
    <EyeTwoTone twoToneColor={theme.palette.secondary.main} />
  );
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      <Tooltip title="View">
        <IconButton
          color="secondary"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleRowExpanded();
          }}
        >
          {collapseIcon}
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            // setCustomer(row.values);          
          }}
        >
          <EditTwoTone twoToneColor={theme.palette.primary.main} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DeleteTwoTone twoToneColor={theme.palette.error.main} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

CellActions.propTypes = {
  row: PropTypes.object
};

const WithdrawalHistorySection = (props) => {
  const { data, tableTimestamp, setTableTimestamp } = props
  const dispatch = useDispatch()
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const theme = useTheme();

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ value }) => {
          return priceFormat(value)
        }
      },
      {
        Header: 'Status',
        accessor: 'status_str',
        Cell: ({ value, row }) => {
          return <Chip
            variant="light"
            size="small"
            label={value}
            color={
              row.original.status === 0 ? "primary" :
                row.original.status === 1 ? "success" :
                  row.original.status === 2 ? "error" :
                    row.original.status === 3 ? "success" :
                      "info"
            }
          />
        }
      },
      {
        Header: 'Processing time',
        accessor: 'processing_time',
        // eslint-disable-next-line
        Cell: ({ value }) => {
          return value > 0 ? timeConverter(value) : ""
        }
      },
      {
        Header: 'Created at',
        accessor: 'add_timestamp',
        // eslint-disable-next-line
        Cell: ({ value }) => {
          return value > 0 ? timeConverter(value) : ""
        }
      },
      // {
      //   Header: 'Actions',
      //   className: 'cell-center',
      //   disableSortBy: true,
      //   // eslint-disable-next-line
      //   Cell: ({ row }) => {
      //     const theme = useTheme();
      //     // eslint-disable-next-line
      //     const { values, isExpanded, toggleRowExpanded } = row;
      //     const collapseIcon = isExpanded ? (
      //       <CloseOutlined style={{ color: theme.palette.error.main }} />
      //     ) : (
      //       <EyeTwoTone twoToneColor={theme.palette.secondary.main} />
      //     );
      //     return (
      //       <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      //         <Tooltip title="Delete">
      //           <IconButton
      //             color="error"
      //             onClick={(e) => {
      //               e.stopPropagation();
      //               onClickDeleteStore(values)
      //             }}
      //           >
      //             <DeleteTwoTone twoToneColor={theme.palette.error.main} />
      //           </IconButton>
      //         </Tooltip>
      //       </Stack>
      //     );
      //   }
      // }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  )

  return (
    <>
      <ScrollX>
        <ReactTable
          columns={columns}
          data={data}
          getHeaderProps={(column) => column.getSortByToggleProps()}
        />
      </ScrollX>
    </>
  )
}

export default WithdrawalHistorySection;