import { useEffect, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Typography } from '@mui/material';
// material-ui

import { numberFormat, priceFormat } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import ReactBasicTable from 'components/ReactTable/ReactBasicTable';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { ColumnHeightOutlined } from '@ant-design/icons';

const GrandTotalBox = (props) => {
  const { processorResidual = [], year, month, refreshTimestamp, setRefreshTimestamp, loading, totalProcessorResidualData } = props

  console.log(`totalProcessorResidualData::::`, totalProcessorResidualData)

  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  const [apiLoading, setApiLoading] = useState(false)

  const defaultGrandTotalData = []
  const [grandTotalData, setGrandTotalData] = useState(defaultGrandTotalData)
  const [expandStatus, setExpandStatus] = useState(false)

  useEffect(() => {
    generateTableData()
  }, [processorResidual, expandStatus, totalProcessorResidualData])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const getTotalSumRow = (data) => {
    let totalRow = {
      merchant: 0,
      transactions: 0,
      sales_amount: 0,
      income: 0,
      expense: 0,
      net: 0,
      bps: 0,
      percentage: 0,
      agent_net: 0,
    }
    for (let k in data) {
      const item = data[k]
      totalRow['merchant'] = totalRow['merchant'] + 1
      totalRow['transactions'] = totalRow['transactions'] + item['transactions']
      totalRow['sales_amount'] = totalRow['sales_amount'] + item['sales_amount']
      totalRow['income'] = totalRow['income'] + item['income']
      totalRow['expense'] = totalRow['expense'] + item['expense']
      totalRow['net'] = totalRow['net'] + item['net']
      totalRow['bps'] = totalRow['bps'] + item['bps']
      totalRow['percentage'] = totalRow['percentage'] + item['percentage']
      totalRow['agent_net'] = totalRow['agent_net'] + item['agent_net']
    }
    return totalRow
  }

  const generateTableData = () => {
    let data = []
    let totalGrossIncome = 0
    let grandTotalPaidOut = 0
    let isoNetIncome = 0

    for (let k in processorResidual) {
      const processorResidualItem = processorResidual[k]
      const sumRow = processorResidualItem['sum']
      const name = sumRow['name']
      const processor_id = sumRow['processor_id']
      const totalProcessorResidual = totalProcessorResidualData[processor_id]
      const totalSumRow = getTotalSumRow(totalProcessorResidual)
      const sum_net = totalSumRow['net']
      if (sum_net) {
        totalGrossIncome += Number(sum_net)
      }
      const sum_agent_net = totalSumRow['agent_net']
      if (sum_agent_net) {
        grandTotalPaidOut += Number(sum_agent_net)
      }
      if (expandStatus) {
        data.push(
          {
            type: `Net from ${name}`,
            amount: Number(sum_net)
          }
        )
        data.push(
          {
            type: `Brand Partner Residuals - ${name}`,
            amount: Number(sum_agent_net)
          }
        )
      }
    }
    grandTotalPaidOut = (-1) * grandTotalPaidOut
    isoNetIncome = totalGrossIncome + grandTotalPaidOut

    data = [
      ...data,
      {
        type: "Total Gross Income",
        amount: totalGrossIncome
      },
      {
        type: "Grand Total Paid Out",
        amount: grandTotalPaidOut
      },
      {
        type: "Brand Partner Net Income",
        amount: isoNetIncome
      }
    ]
    console.log(`setGrandTotalData:::: data`, data)
    setGrandTotalData(data)
  }

  const onClickExpandedView = () => {
    console.log(`onClickExpandedView:::`)
    setExpandStatus(!expandStatus)
  }

  const columns = [
    {
      Header: <Button startIcon={<ColumnHeightOutlined />} onClick={() => onClickExpandedView()}>Expanded View</Button>,
      accessor: 'action',
      className: 'cell-left',
    },
    {
      Header: 'Type',
      accessor: 'type',
      className: 'cell-right',
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      className: 'cell-right',
      Cell: (c_props) => <span>{`${priceFormat(c_props.value, '$')}`}</span>
    }
  ]

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ py: 2 }}>
        <Typography variant="h5">{`Grand Total`}</Typography>
      </Box>
      <MainCard content={false}>
        <ScrollX>
          <ReactBasicTable columns={columns} data={grandTotalData} hasFooter={false} loading={loading} />
        </ScrollX>
      </MainCard>
    </Box>
  )
}

export default GrandTotalBox;
