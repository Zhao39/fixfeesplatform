import { Fragment, useEffect, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, ButtonBase, CardContent, Divider, Grid, Link, Modal, Stack, Typography } from '@mui/material';
// material-ui

import { console_log, numberFormat } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import ReactBasicTable from 'components/ReactTable/ReactBasicTable';
import ScrollX from 'components/ScrollX';

const MerchantResidualModal = (props) => {
  const { show, setShow, title = "", info, merchantResidualData } = props
  const theme = useTheme();
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (show) {
      setOpen(true)
    }
  }, [show])

  const [apiCalling, setApiCalling] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    setShow(false)
  }

  const columns = [
    // {
    //   Header: 'Total',
    //   Footer: () => renderTotalFooter(),
    //   accessor: 'total_paid_by_us',
    //   className: 'cell-right',
    //   Cell: (c_props) => renderTotalCell(c_props)
    // },
    {
      Header: 'Month',
      Footer: () => 'Total',
      accessor: 'month',
      className: 'cell-left',
      Cell: (c_props) => renderMonthCell(c_props)
    },
    {
      Header: 'Income',
      Footer: () => <span>{`$${numberFormat(getColumnTotalValue('income'), 2)}`}</span>,
      accessor: 'income',
      className: 'cell-right',
      Cell: (c_props) => <span>{`$${numberFormat(c_props.value, 2)}`}</span>
    },
    {
      Header: 'Expense',
      Footer: () => <span>{`$${numberFormat(getColumnTotalValue('expense'), 2)}`}</span>,
      accessor: 'expense',
      className: 'cell-right',
      Cell: (c_props) => <span>{`$${numberFormat(c_props.value, 2)}`}</span>
    },
    {
      Header: 'Adjusted Net',
      Footer: () => <span>{`$${numberFormat(getColumnTotalValue('net'), 2)}`}</span>,
      accessor: 'net',
      className: 'cell-right',
      Cell: (c_props) => <span>{`$${numberFormat(c_props.value, 2)}`}</span>
    },
    {
      Header: 'Agent Net',
      Footer: () => <span>{`$${numberFormat(getColumnTotalValue('agent_net'), 2)}`}</span>,
      accessor: 'agent_net',
      className: 'cell-right',
      Cell: (c_props) => <span>{`$${numberFormat(c_props.value, 2)}`}</span>
    },
    {
      Header: 'Processing Volume',
      Footer: () => <span>{`$${numberFormat(getColumnTotalValue('sales_amount'), 2)}`}</span>,
      accessor: 'sales_amount',
      className: 'cell-right',
      Cell: (c_props) => <span>{`$${numberFormat(c_props.value, 2)}`}</span>
    },
    {
      Header: 'Transaction Count',
      Footer: () => <span>{`${numberFormat(getColumnTotalValue('transactions'), 0)}`}</span>,
      accessor: 'transactions',
      className: 'cell-right',
      Cell: (c_props) => <span>{`${numberFormat(c_props.value, 0)}`}</span>
    },
  ]

  const renderMonthCell = (c_props) => {
    const row = c_props.row.original
    return (
      <>
        <span>{`${row.month}`}</span>
      </>
    )
  }

  const getColumnTotalValue = (field) => {
    let sum = 0
    for(let k in merchantResidualData) {
      const row = merchantResidualData[k]
      sum += row[field]
    }
    return sum
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
        <MainCard title={title} modal darkTitle content={false} >
          <CardContent sx={{ maxWidth: '100%', width: '1024px' }}>
            <Grid container spacing={3} direction="column">
              <Grid item xs={12} md={12}>
                <Box sx={{ width: '100%' }}>
                  <ScrollX>
                    <ReactBasicTable columns={columns} data={merchantResidualData} hasFooter={true} loading={false} />
                  </ScrollX>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
            <Button color="error" size="medium" onClick={handleClose}>
              Close
            </Button>
          </Stack>
        </MainCard>
      </Modal>
    </>
  );
};

export default MerchantResidualModal;
