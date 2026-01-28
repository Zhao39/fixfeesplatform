import { APP_NAME, BASE_API_URL } from "config/constants";
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { get_utc_timestamp_ms, intval, priceFormat, timeConverter } from "utils/misc";
import { useState } from "react";
import { Button, Chip, Grid, IconButton, Stack, Typography } from "@mui/material";
import { CheckCircleOutlined, CheckOutlined, CloseOutlined, KeyOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import PageLayout from "layout/AdminLayout/PageLayout";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { showToast } from "utils/utils";
import { apiAdminUpdateWithdrawStatus } from "services/adminService";

const WithdrawalListPage = (props) => {
  const handleAdd = () => {

  }

  const [apiCalling, setApiCalling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [currentRow, setCurrentRow] = useState({});

  const [confirmedAction, setConfirmedAction] = useState("change_user_status");

  const onClickTBActionBtn = (row, actionName) => {
    setCurrentRow(row);
    if (actionName === "approve") {
      setConfirmText("Are you sure you want to approve?");
    } else if (actionName === "reject") {
      setConfirmText("Are you sure you want to reject?");
    } else if (actionName === "delete") {
      setConfirmText("Are you sure you want to delete?");
    }
    setConfirmedAction(actionName);
    setShowConfirmModal(true);
  }
  const onClickYesConfirm = async () => {
    let params = {
      id: currentRow["id"],
      action: "update",
    };
    if (confirmedAction === "approve") {
      params["status"] = "1";
    } else if (confirmedAction === "reject") {
      params["status"] = "2";
    } else if (confirmedAction === "delete") {
      params["action"] = "delete";
    }
    setApiCalling(true);
    const apiRes = await apiAdminUpdateWithdrawStatus(params)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      setTableTimestamp(get_utc_timestamp_ms())
      showToast(apiRes.message, 'success');
    } else {
      showToast(apiRes.message, 'error');
    }
    setShowConfirmModal(false)
  }

  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
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
      Header: "Amount($)",
      accessor: "amount",
      Cell: ({ value, row }) => {
        return priceFormat(value)
      }
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value, row }) => {
        return <Chip
          variant="light"
          size="small"
          label={
            row.original.status === 0 ? "Requested" :
              row.original.status === 1 ? "Approved" :
                row.original.status === 2 ? "Rejected" :
                  row.original.status === 3 ? "Completed" :
                    ""
          }
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
      Header: "Paypal Address",
      accessor: "paypal_address",
    },
    {
      Header: "Created at",
      accessor: "add_timestamp",
      Cell: ({ value, row }) => {
        return value > 0 ? timeConverter(value) : ""
      }
    },
    {
      Header: "Action",
      accessor: "admin_deleted",
      disableSortBy: true,
      Cell: ({ value, row }) => {
        return (
          <>
            {intval(row.original.status) === 0 && (
              <Stack direction={`row`} spacing={1}>
                <IconButton title="Approve" color="success" variant="outlined" size="small" onClick={() => onClickTBActionBtn(row.original, "approve")}>
                  <CheckCircleOutlined />
                </IconButton>
                <IconButton title="Reject" color="warning" variant="outlined" size="small" onClick={() => onClickTBActionBtn(row.original, "reject")}>
                  <StopOutlined />
                </IconButton>
              </Stack>
            )}
            {intval(row.original.status) === 2 && (
              <>
                <Stack direction={`row`} spacing={1}>
                  <IconButton title="Delete" color="error" variant="outlined" size="small" onClick={() => onClickTBActionBtn(row.original, "delete")}>
                    <CloseOutlined />
                  </IconButton>
                </Stack>
              </>
            )}
            {(intval(row.original.status) === 1 || intval(row.original.status) === 3) && (
              <>
                <Stack direction={`row`} spacing={1}>
                  <IconButton title="Delete" color="error" variant="outlined" size="small" onClick={() => onClickTBActionBtn(row.original, "delete")}>
                    <CloseOutlined />
                  </IconButton>
                </Stack>
              </>
            )}
          </>
        )
      }
    },

  ]
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
  return (
    <PageLayout title="Withdrawal">
      <ScrollX>
        <DataTableWrapper
          tableName={`withdrawal`}
          dataListApiUrl={`${BASE_API_URL}/admin/withdraw/get-data-list`}
          handleAdd={handleAdd}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'id', desc: true }]}
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

export default WithdrawalListPage;