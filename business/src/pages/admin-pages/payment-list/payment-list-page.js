import { APP_NAME, BASE_API_URL } from "config/constants";
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { get_utc_timestamp_ms, timeConverter } from "utils/misc";
import { useState } from "react";
import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import PageLayout from "layout/AdminLayout/PageLayout";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { apiAdminDeleteTransaction } from "services/adminService";
import { showToast } from "utils/utils";

const PaymentListPage = (props) => {
  const handleAdd = () => {

  }

  const TABLE_COLUMNS = [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "Username",
      accessor: "name",
    },
    {
      Header: "Trans ID",
      accessor: "trans_id",
    },
    {
      Header: "Paid Amount ($)",
      accessor: "paid_amount",
    },
    {
      Header: "Created at",
      accessor: "created_at",
      Cell: (c_props) => renderCreatedAtCell(c_props),
    },
    {
      Header: "Action",
      accessor: "updated_at",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    },
  ]

  const renderActionCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <Stack direction={`row`} spacing={1}>
        <IconButton title="Delete" color="error" variant="outlined" size="small" onClick={() => onClickAdminDeleteTransaction(row)}>
          <CloseOutlined />
        </IconButton>
      </Stack>
    )
  }

  const renderCreatedAtCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <span>{timeConverter(row.created_at)}</span>
    )
  }

  const renderAddItemComponent = () => {
    return (
      <>
        {/* <Button variant="contained" startIcon={<PlusOutlined />} size="medium" onClick={() => handleAdd()}>
          Add New
        </Button> */}
      </>
    )
  }
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  const [apiCalling, setApiCalling] = useState(false)
  const [currentRow, setCurrentRow] = useState(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [confirmAction, setConfirmAction] = useState("")
  const onClickAdminDeleteTransaction = (row) => {
    console.log(`row::::::::`, row)
    setCurrentRow(row)
    setConfirmText(`Are you sure you want to delete?`)
    setConfirmAction("delete_transaction")
    setShowConfirmModal(true)
  }

  const onClickYesConfirm = () => {
    if (confirmAction === "delete_transaction") {
      adminDeleteTransaction()
    }
  }

  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const adminDeleteTransaction = async () => {
    const payload = {
      id: currentRow.id,
    }
    setApiCalling(true)
    const apiRes = await apiAdminDeleteTransaction(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      setTableTimestamp(get_utc_timestamp_ms())
      showToast(apiRes.message, 'success');
    } else {
      showToast(apiRes.message, 'error');
    }
    setShowConfirmModal(false)
  }

  return (
    <PageLayout title="Payments">
      <ScrollX>
        <DataTableWrapper
          tableName={`transaction`}
          dataListApiUrl={`${BASE_API_URL}/admin/transaction/get-data-list`}
          handleAdd={handleAdd}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'created_at', desc: true }]}
          showHeaderBar={true}
          showFilter={true}
          renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
        />
      </ScrollX>

      {
        (showConfirmModal) ? (
          <>
            <ConfirmDialog
              open={showConfirmModal}
              setOpen={setShowConfirmModal}
              title={APP_NAME}
              content={confirmText}
              textYes={`Yes`}
              textNo={`No`}
              onClickYes={() => onClickYesConfirm()}
              onClickNo={() => onClickNoConfirm()}
            />
          </>
        ) : (
          <></>
        )
      }
    </PageLayout>
  )
}

export default PaymentListPage;