import React from 'react';
import PropTypes from 'prop-types';
import {
  PaginationItem,
  PaginationLink,
  FormGroup,
  Input,
} from 'reactstrap';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';
import ChevronDoubleRightIcon from 'mdi-react/ChevronDoubleRightIcon';
import ChevronLeftIcon from 'mdi-react/ChevronLeftIcon';
import ChevronDoubleLeftIcon from 'mdi-react/ChevronDoubleLeftIcon';
import { FormControl, Grid, MenuItem, Pagination, Select, Stack, TextField, Typography } from '@mui/material';

const ReactTablePagination = ({
  dataLength,
  page,
  gotoPage,
  canPreviousPage,
  pageOptions,
  pageSize,
  pageIndex,
  previousPage,
  nextPage,
  canNextPage,
  setPageSize,
  manualPageSize,
}) => {
  // console.log(pageOptions)
  const arrayPageIndex = (pageIndex - 2) < 0
    ? pageOptions.slice(0, pageIndex + 3)
    : pageOptions.slice((pageIndex - 2), (pageIndex + 3));

  return (
    <Grid container alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 3, width: 'auto' }} style={{ marginTop: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <Grid item>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="secondary">
              Row per page
            </Typography>
            <FormControl sx={{ m: 1 }}>
              <Select
                id="demo-controlled-open-select"
                value={pageSize}
                onChange={(event) => setPageSize(+event.target.value)}
                size="small"
                sx={{ '& .MuiSelect-select': { py: 0.75, px: 1.25 } }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Typography variant="caption" color="secondary">
            Go to
          </Typography>
          <TextField
            size="small"
            type="number"
            // @ts-ignore
            value={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) : 0;
              gotoPage(page - 1);
            }}
            sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1.25, width: 36 } }}
          />
        </Stack>
      </Grid>
      <Grid item sx={{ mt: { xs: 2, sm: 0 } }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Typography variant="caption" color="secondary" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            Showing {pageSize * pageIndex + 1} to {pageSize * pageIndex + page.length} of {dataLength}
          </Typography>
          <Pagination
            count={Math.ceil(dataLength / pageSize)}
            page={pageIndex + 1}
            onChange={(event, value) => gotoPage(value - 1)}
            color="primary"
            variant="combined"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

ReactTablePagination.propTypes = {
  dataLength: PropTypes.number.isRequired,
  page: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  gotoPage: PropTypes.func.isRequired,
  canNextPage: PropTypes.bool.isRequired,
  canPreviousPage: PropTypes.bool.isRequired,
  pageOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  pageSize: PropTypes.number.isRequired,
  pageIndex: PropTypes.number.isRequired,
  previousPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  setPageSize: PropTypes.func.isRequired,
  manualPageSize: PropTypes.arrayOf(PropTypes.number),
};

ReactTablePagination.defaultProps = {
  manualPageSize: [10, 20, 30, 40],
};

export default ReactTablePagination;