import { Fragment, useEffect, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, ButtonBase, CardContent, Divider, Grid, Link, MenuItem, Modal, Select, Skeleton, Stack, Typography } from '@mui/material';
// material-ui

import { console_log, numberFormat, priceFormat } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import ReactBasicTable from 'components/ReactTable/ReactBasicTable';
import ScrollX from 'components/ScrollX';
import { apiUserGetMerchantResidualProfitDetail } from 'services/userResidualsService';
import { apiUserGetMerchantResidualData } from 'services/userMerchantService';
import { showToast } from 'utils/utils';
import HoverSocialCard from 'components/cards/statistics/HoverSocialCard';
import { BarChartOutlined, CalendarOutlined, DollarOutlined, FacebookOutlined, FileTextOutlined, PercentageOutlined, SyncOutlined } from '@ant-design/icons';
import ReportCard from 'components/cards/statistics/ReportCard';

const MerchantResidualDetailModal = (props) => {
  const { show, setShow, title = "", info = {}, processor_id } = props
  const { mid } = info

  const theme = useTheme();
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  const [apiLoading, setApiLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (show) {
      setOpen(true)
      if (mid) {
        loadMerchantResidualProfitDetail(mid)
        loadMerchantResidualData(mid)
      }
    }
  }, [show])


  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    setShow(false)
  }

  const defaultMerchantResidualProfitData = {
    ytd_profit: 0,
    lifetime_profit: 0,
    ytd_profit_bps: 0,
    lifetime_profit_bps: 0,
  }
  const [merchantResidualProfitData, setMerchantResidualProfitData] = useState(defaultMerchantResidualProfitData)
  const loadMerchantResidualProfitDetail = async (mid) => {
    const payload = {
      mid: mid
    }
    setApiLoading(true)
    const apiRes = await apiUserGetMerchantResidualProfitDetail(payload)
    setApiLoading(false)
    if (apiRes['status'] === '1') {
      setMerchantResidualProfitData(apiRes['data']['residual_profit_data'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  const [merchantResidualData, setMerchantResidualData] = useState([])

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
      Header: 'BP Net',
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
    {
      Header: 'BPS',
      Footer: () => <span>{`${numberFormat(getColumnTotalBpsValue(), 2)}%`}</span>,
      accessor: 'bps',
      className: 'cell-right',
      Cell: (c_props) => <span>{`${numberFormat(c_props.value, 2)}%`}</span>
    }
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
    for (let k in merchantResidualData) {
      const row = merchantResidualData[k]
      sum += row[field]
    }
    return sum
  }

  const getColumnTotalBpsValue = () => {
    let sales_amount = 0
    let net = 0
    for (let k in merchantResidualData) {
      const row = merchantResidualData[k]
      sales_amount += Number(row['sales_amount'])
      net += Number(row['net'])
    }
    let bps = 100 * net / sales_amount
    bps = Number(bps.toFixed(2))
    return bps
  }

  const dateRangeOptionList = [
    {
      value: 'last_3_month',
      text: 'Last 3 Months'
    },
    {
      value: 'last_6_month',
      text: 'Last 6 Months'
    },
    {
      value: 'last_12_month',
      text: 'Last 12 Months'
    }
  ]

  const defaultDateRangeOption = dateRangeOptionList[0]['value']
  const [dateRangeOption, setDateRangeOption] = useState(defaultDateRangeOption)
  const onChangeDateRangeOption = (e) => {
    const v = e.target.value
    console.log(`onChangeDateRangeOption v:::`, v)
    setDateRangeOption(v)
  }

  const loadMerchantResidualData = async () => { // load table data
    const payload = {
      processor_id: processor_id,
      mid: mid,
      date_range: dateRangeOption
    }
    setTableLoading(true)
    const apiRes = await apiUserGetMerchantResidualData(payload)
    setTableLoading(false)
    if (apiRes['status'] === '1') {
      setMerchantResidualData(apiRes['data']['residual_report_data'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  const refreshData = () => {
    if (tableLoading) {
      return false
    }
    loadMerchantResidualData()
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
        <MainCard title={title} modal darkTitle content={false} >
          <CardContent sx={{ maxWidth: '100%', width: '1024px' }}>
            <Grid container spacing={3} direction="column">
              <Grid item xs={12} md={12}>
                <Box sx={{ width: '100%' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={6} sm={6}>
                      <ReportCard
                        primary="YTD Profit"
                        secondary={
                          apiLoading ? <><Skeleton animation="wave" height={38} /></> : <><Typography variant="h2">{priceFormat(merchantResidualProfitData['ytd_profit'], '$')}</Typography></>
                        }
                        color={theme.palette.primary.main}
                        iconPrimary={DollarOutlined}
                      />
                    </Grid>
                    <Grid item xs={12} lg={6} sm={6}>
                      <ReportCard
                        primary="Lifetime Profit"
                        secondary={
                          apiLoading ? <><Skeleton animation="wave" height={38} /></> : <><Typography variant="h2">{priceFormat(merchantResidualProfitData['lifetime_profit'], '$')}</Typography></>
                        }
                        color={theme.palette.primary.main}
                        iconPrimary={DollarOutlined}
                      />
                    </Grid>
                    <Grid item xs={12} lg={6} sm={6}>
                      <ReportCard
                        primary="YTD Profit (BPS)"
                        secondary={
                          apiLoading ? <><Skeleton animation="wave" height={38} /></> : <><Typography variant="h2">{numberFormat(merchantResidualProfitData['ytd_profit_bps'], 2)}%</Typography></>
                        }
                        color={theme.palette.primary.main}
                        iconPrimary={PercentageOutlined}
                      />
                    </Grid>
                    <Grid item xs={12} lg={6} sm={6}>
                      <ReportCard
                        primary="Lifetime Profit (BPS)"
                        secondary={
                          apiLoading ? <><Skeleton animation="wave" height={38} /></> : <><Typography variant="h2">{numberFormat(merchantResidualProfitData['lifetime_profit_bps'], 2)}%</Typography></>
                        }
                        color={theme.palette.primary.main}
                        iconPrimary={PercentageOutlined}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Typography variant="h5">Residual Earnings</Typography>
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack direction="column" justifyContent={`flex-start`} alignItems={`flex-start`} spacing={2}>
                  <Box sx={{ width: '100%' }}>
                    <Stack direction="row" justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                      <Select size="small" labelId="demo-simple-select-label" id="demo-simple-select" value={dateRangeOption} onChange={(v) => onChangeDateRangeOption(v)}>
                        {
                          dateRangeOptionList.map((item, index) => {
                            return (
                              <MenuItem key={index} value={item.value}>{item.text}</MenuItem>
                            )
                          })
                        }
                      </Select>
                      <Button variant="contained" size="small" startIcon={<SyncOutlined />} disabled={tableLoading} onClick={() => refreshData()}>Reload</Button>
                    </Stack>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <ScrollX>
                      <ReactBasicTable columns={columns} data={merchantResidualData} hasFooter={true} loading={tableLoading} />
                    </ScrollX>
                  </Box>
                </Stack>
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

export default MerchantResidualDetailModal;
