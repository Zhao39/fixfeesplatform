import { APP_NAME, BASE_API_URL, KYC_STATUS } from "config/constants";
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { format_phone, get_utc_timestamp_ms } from "utils/misc";
import { useState } from "react";
import { Button, Chip, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { CheckCircleOutlined, CloseOutlined, EditOutlined, KeyOutlined, PlusCircleOutlined, PlusOutlined, SendOutlined, StopOutlined, IdcardOutlined, SafetyOutlined, EyeOutlined, CommentOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import PageLayout from "layout/AdminLayout/PageLayout";
import UserInfoModal from "./inc/UserInfoModal";
import UserTmpPasswordModal from "./inc/UserTmpPasswordModal";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { showToast } from "utils/utils";
import { apiAdminGetUserKycDoc, apiAdminSetUserTmpPassword, apiAdminUpdateUserStatus } from "services/adminService";
import UserKycDocModal from "./inc/UserKycDocModal";
import moment from "moment";
import LeadStatusModal from "./inc/LeadStatusModal";
import TicketAddModal from "./inc/TicketAddModal";

const UserListPage = (props) => {
  const handleAdd = () => {

  }

  const TABLE_COLUMNS = [
    {
      Header: "#",
      accessor: "id",
    },
    {
      Header: "MID",
      accessor: "mid",
    },
    {
      Header: "DBA",
      accessor: "business_dba",
    },
    {
      Header: "Legal Business Name",
      accessor: "business_legal_name",
    },
    {
      Header: "Email",
      accessor: "business_email",
    },
    {
      Header: "Phone",
      accessor: "business_phone",
      Cell: (c_props) => renderPhoneCell(c_props),
    },
    {
      Header: "Signup Date",
      accessor: "createdAt",
      Cell: (c_props) => renderRegisterDateCell(c_props),
    },
    {
      Header: "Action",
      accessor: "encrypted_id",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    },
  ]
  const renderActionCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <Stack direction={`row`} spacing={1}>
        {/* <IconButton title="Set temporary password" color="primary" variant="outlined" size="small" onClick={() => onClickSetUserTmpPassword(row)}>
          <KeyOutlined />
        </IconButton> */}
        <IconButton title="Edit" color="info" variant="outlined" size="small" onClick={() => onClickEditUser(row)}>
          <EditOutlined />
        </IconButton>
        <IconButton title="View" color="info" variant="outlined" size="small" onClick={() => onClickViewLead(row)}>
          <EyeOutlined />
        </IconButton>
        <IconButton title="Ticket" color="info" variant="outlined" size="small" onClick={() => onClickTicket(row)}>
          <CommentOutlined />
        </IconButton>
        {/* <IconButton title="Delete" color="error" variant="outlined" size="small">
          <CloseOutlined />
        </IconButton> */}
      </Stack>
    )
  }

  const renderStatusCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    const statusText = row?.status === '1' ? 'Active' : 'Blocked'
    const statusColor = row?.status === '1' ? 'success' : 'error'
    return (
      <Stack direction={`row`} spacing={1}>
        <Chip
          label={statusText}
          variant="light"
          size="small"
          //sx={{ cursor: 'pointer' }}
          color={statusColor}
        />
      </Stack>
    )
  }
  const renderRegisterDateCell = (c_props) => {
    const row = c_props.row.original
    return (
      <>{moment(row.createdAt).format('LLL')}</>
    )
  }
  const renderPhoneCell = (c_props) => {
    const row = c_props.row.original
    return (
      <>{format_phone(row?.business_phone)}</>
    )
  }

  const [currentRow, setCurrentRow] = useState(null)

  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const onClickEditUser = (row) => {
    setCurrentRow(row)
    setShowUserInfoModal(true)
  }

  const [showLeadStatusModal, setShowLeadStatusModal] = useState(false)
  const onClickViewLead = (row) => {
    setCurrentRow(row)
    setShowLeadStatusModal(true)
  }

  const [showTicketModal, setShowTicketModal] = useState(false)
  const onClickTicket = (row) => {
    setCurrentRow(row)
    setShowTicketModal(true)
  }

  const [showUserTmpPasswordModal, setShowUserTmpPasswordModal] = useState(false)
  const onClickSetUserTmpPassword = (row) => {
    setCurrentRow(row)
    setShowUserTmpPasswordModal(true)
  }

  const [apiCalling, setApiCalling] = useState(false)

  const [showUserKycDocModal, setShowUserKycDocModal] = useState(false)
  const [userKycDoc, setUserKycDoc] = useState({})


  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [confirmAction, setConfirmAction] = useState("")

  const onClickYesConfirm = () => {
    if (confirmAction === "block_user") {
      submitBlockUser()
    }
    else if (confirmAction === "activate_user") {
      submitActivateUser()
    }
  }
  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }
  const submitBlockUser = () => {
    const status = "0"
    updateUserStatus(status)
  }
  const submitActivateUser = () => {
    const status = "1"
    updateUserStatus(status)
  }
  const updateUserStatus = async (status) => {
    const payload = {
      id: currentRow.id,
      status: status
    }
    setApiCalling(true)
    const apiRes = await apiAdminUpdateUserStatus(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      setTableTimestamp(get_utc_timestamp_ms())

      showToast(apiRes.message, 'success');
    } else {
      showToast(apiRes.message, 'error');
    }
    setShowConfirmModal(false)
  }

  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  return (
    <PageLayout title="Merchants">
      <ScrollX>
        <DataTableWrapper
          tableName={`users`}
          dataListApiUrl={`${BASE_API_URL}/business-admin/users/get-data-list`}
          handleAdd={handleAdd}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'id', desc: false }]}
          showHeaderBar={true}
          showFilter={true}
          //renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
        />
      </ScrollX>

      {
        (showUserInfoModal) && (
          <>
            <UserInfoModal
              show={showUserInfoModal}
              setShow={setShowUserInfoModal}
              title="Merchant Detail"
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        )
      }

      {
        (showUserTmpPasswordModal) && (
          <>
            <UserTmpPasswordModal
              show={showUserTmpPasswordModal}
              setShow={setShowUserTmpPasswordModal}
              title="Set temporary password"
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        )
      }
      {
        (showLeadStatusModal) ? (
          <>
            <LeadStatusModal
              show={showLeadStatusModal}
              setShow={setShowLeadStatusModal}
              title={`${currentRow?.business_legal_name}`}
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        ) : (
          <></>
        )
      }
       {
        (showTicketModal) ? (
          <>
            <TicketAddModal
              show={showTicketModal}
              setShow={setShowTicketModal}
              title={`New Ticket for ${currentRow?.business_legal_name}`}
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        ) : (
          <></>
        )
      }
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

export default UserListPage;