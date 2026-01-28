import { ADMIN_TYPE, APP_NAME, BASE_API_URL, KYC_STATUS } from "config/constants";
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { get_utc_timestamp_ms } from "utils/misc";
import { useState } from "react";
import { Button, Chip, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { CheckCircleOutlined, CloseOutlined, EditOutlined, KeyOutlined, PlusCircleOutlined, PlusOutlined, SendOutlined, StopOutlined, IdcardOutlined, SafetyOutlined, BarsOutlined, DollarCircleOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import PageLayout from "layout/AdminLayout/PageLayout";
import UserInfoModal from "./inc/UserInfoModal";
import UserTmpPasswordModal from "./inc/UserTmpPasswordModal";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { showToast } from "utils/utils";
import { apiAdminGetUserKycDoc, apiAdminSetUserTmpPassword, apiAdminUpdateUserStatus } from "services/adminService";
import UserKycDocModal from "./inc/UserKycDocModal";
import UserLeadsModal from "./inc/UserLeadsModal";
import { MoneyOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

const UserListPage = (props) => {
  const userDataStore = useSelector((x) => x.auth);
  const user = userDataStore?.user

  const history = useNavigate()
  const handleAdd = () => {

  }

  const TABLE_COLUMNS = [
    {
      Header: "#",
      accessor: "id",
    },
    {
      Header: "Username",
      accessor: "name",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    // {
    //   Header: "Phone",
    //   accessor: "phone",
    // },
    {
      Header: "Sponsor",
      accessor: "ref_name",
    },
    {
      Header: "Wallet($)",
      accessor: "balance",
    },
    {
      Header: "KYC",
      accessor: "kyc_status",
      Cell: (c_props) => renderKYCCell(c_props),
    },
    {
      Header: "Status",
      accessor: "is_active",
      Cell: (c_props) => renderStatusCell(c_props),
    },
    {
      Header: "Action",
      accessor: "encrypted_id",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    },
  ]

  const getTableColumns = () => {
    const tableColumns = TABLE_COLUMNS
    if (user.admin_type === ADMIN_TYPE.ASSISTANT) {
      return tableColumns.filter((item) => item.Header !== 'Action')
    } else {
      return tableColumns
    }
  }

  const renderActionCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <Stack direction={`row`} spacing={0.5}>
        <IconButton title="Set temporary password" color="primary" variant="outlined" size="small" onClick={() => onClickSetUserTmpPassword(row)}>
          <KeyOutlined />
        </IconButton>
        <IconButton title="Edit" color="info" variant="outlined" size="small" onClick={() => onClickEditUser(row)}>
          <EditOutlined />
        </IconButton>
        <IconButton title="Check KYC" color="error" variant="outlined" size="small" onClick={() => onClickCheckUserKyc(row)}>
          <SafetyOutlined />
        </IconButton>
        <IconButton title="View Leads" color="info" variant="outlined" size="small" onClick={() => onClickViewLeads(row)}>
          <BarsOutlined />
        </IconButton>
        <IconButton title="View Payment History" color="warning" variant="outlined" size="small" onClick={() => onClickViewPayment(row)}>
          <DollarCircleOutlined />
        </IconButton>
        {
          (row.status === "1") ? (
            <IconButton title="Block User" color="warning" variant="outlined" size="small" onClick={() => onClickBlockUser(row)}>
              <StopOutlined />
            </IconButton>
          ) : (
            <IconButton title="Activate User" color="success" variant="outlined" size="small" onClick={() => onClickActivateUser(row)}>
              <CheckCircleOutlined />
            </IconButton>
          )
        }

        {/* <IconButton title="Delete" color="error" variant="outlined" size="small">
          <CloseOutlined />
        </IconButton> */}
      </Stack>
    )
  }

  const renderKYCCell = (c_props) => {
    const row = c_props.row.original
    const statusText = row?.kyc_status === KYC_STATUS.VERIVIED ? 'Verified' : row?.kyc_status === KYC_STATUS.NOT_VERIVIED ? 'Not verified' : 'Rejected'
    const statusColor = row?.kyc_status === 1 ? 'success' : 'error'
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

  const [currentRow, setCurrentRow] = useState(null)

  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const onClickEditUser = (row) => {
    setCurrentRow(row)
    setShowUserInfoModal(true)
  }

  const [showUserTmpPasswordModal, setShowUserTmpPasswordModal] = useState(false)
  const onClickSetUserTmpPassword = (row) => {
    setCurrentRow(row)
    setShowUserTmpPasswordModal(true)
  }

  const [apiCalling, setApiCalling] = useState(false)

  const [showUserKycDocModal, setShowUserKycDocModal] = useState(false)
  const [userKycDoc, setUserKycDoc] = useState({})
  const onClickCheckUserKyc = async (row) => {
    setCurrentRow(row)
    const user_kyc_doc = await getUserKyc(row)
    if (user_kyc_doc) {
      setShowUserKycDocModal(true)
    }
  }

  const getUserKyc = async (row) => {
    const payload = {
      user_id: row.id,
    }
    setApiCalling(true)
    const apiRes = await apiAdminGetUserKycDoc(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      const user_kyc_doc = apiRes['data']['userKycDoc']
      if (user_kyc_doc && user_kyc_doc.id) {
        setUserKycDoc(user_kyc_doc)
        return user_kyc_doc
      } else {
        showToast("No KYC document found.", 'error');
      }
    } else {
      showToast(apiRes.message, 'error');
      return null
    }
  }

  const [showLeadsModal, setShowLeadsModal] = useState(false)
  const onClickViewLeads = async (row) => {
    setCurrentRow(row)
    setShowLeadsModal(true)
  }
  const onClickViewPayment = async (row) => {
    setCurrentRow(row)
    history(`/admin/user-list/payment-list/${row.id}`)
  }
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [confirmAction, setConfirmAction] = useState("")
  const onClickBlockUser = (row) => {
    setCurrentRow(row)
    setConfirmText(`Are you sure you want to block this user?`)
    setConfirmAction("block_user")
    setShowConfirmModal(true)
  }
  const onClickActivateUser = (row) => {
    setCurrentRow(row)
    setConfirmText(`Are you sure you want to activate this user?`)
    setConfirmAction("activate_user")
    setShowConfirmModal(true)
  }
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

  const renderAddItemComponent = () => {
    return (
      <Button variant="contained" startIcon={<PlusOutlined />} size="medium" onClick={() => handleAdd()}>
        Add User
      </Button>
    )
  }

  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  return (
    <PageLayout title="Users">
      <ScrollX>
        <DataTableWrapper
          tableName={`users`}
          dataListApiUrl={`${BASE_API_URL}/admin/users/get-data-list`}
          handleAdd={handleAdd}
          tableColumns={getTableColumns()}
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
              title="Edit User"
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        )
      }
      {
        (showUserKycDocModal) && (
          <>
            <UserKycDocModal
              show={showUserKycDocModal}
              setShow={setShowUserKycDocModal}
              title="User KYC"
              info={currentRow}
              userKycDoc={userKycDoc}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        )
      }
      {
        (showLeadsModal) && (
          <>
            <UserLeadsModal
              show={showLeadsModal}
              setShow={setShowLeadsModal}
              title={`Leads of "${currentRow.name}"`}
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