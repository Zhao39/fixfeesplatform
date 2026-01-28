import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, ButtonBase, Chip, Link, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material';

// third-party
import { useTable } from 'react-table';

// project import
import LinearWithLabel from 'components/@extended/Progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import makeData from 'data/react-table';
import { numberFormat, timeConverter } from 'utils/misc';
import { apiUserGetDashboardPerformanceData } from 'services/userDashboardService';
import { apiUserGetMerchantResidualData } from 'services/userMerchantService';
import { useState } from 'react';
import { showToast } from 'utils/utils';
import MerchantResidualModal from './MerchantResidualModal';
import ReactBasicTable from 'components/ReactTable/ReactBasicTable';

const MerchantListTableBlock = (props) => {
  const { pageData, loading } = props
  const data = pageData?.userBusinessList?.topPerformerList ?? []

  const [apiLoading, setApiLoading] = useState(false)
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
      Cell: (c_props) => renderMerchantName(c_props)
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
  const [currentRow, setCurrentRow] = useState()
  const [merchantResidualModalOpen, setMerchantResidualModalOpen] = useState(false)
  const [merchantResidualData, setMerchantResidualData] = useState([])
  const loadMerchantResidualData = async (mid) => {
    const payload = {
      mid: mid
    }
    setApiLoading(true)
    const apiRes = await apiUserGetMerchantResidualData(payload)
    setApiLoading(false)
    if (apiRes['status'] === '1') {
      setMerchantResidualData(apiRes['data']['residual_report_data'])
      setMerchantResidualModalOpen(true)
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  const onClickMerchantName = (row) => {
    console.log(`onClickMerchantName row:::`, row)
    setCurrentRow(row)
    const mid = row['mid']
    if (mid) {
      loadMerchantResidualData(mid)
    } else {
      alert(`Empty merchant id`)
    }
  }

  const renderMerchantName = (c_props) => {
    const row = c_props.row.original
    return (
      <>
        <Link onClick={() => onClickMerchantName(row)} sx={{ cursor: 'pointer' }}>
          <span>{`${row.name}`}</span>
        </Link>
      </>
    )
  }

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
        <ReactBasicTable columns={columns} data={data} loading={loading} />
      </ScrollX>

      {
        (merchantResidualModalOpen) ? (
          <>
            <MerchantResidualModal
              show={merchantResidualModalOpen}
              setShow={setMerchantResidualModalOpen}
              title={`${currentRow?.name}`}
              info={currentRow}
              merchantResidualData={merchantResidualData}
            />
          </>
        ) : (
          <></>
        )
      }
    </Box>
  );
};

export default MerchantListTableBlock;
