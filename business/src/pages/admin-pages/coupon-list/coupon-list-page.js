import { APP_NAME, BASE_API_URL } from "config/constants";
import ScrollX from 'components/ScrollX';
import { get_utc_timestamp_ms, timeConverter } from "utils/misc";
import { useState } from "react";
import { Button, IconButton, Stack } from "@mui/material";
import { CheckCircleOutlined, CloseOutlined, EditOutlined, KeyOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import PageLayout from "layout/AdminLayout/PageLayout";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { showToast } from "utils/utils";
import { apiAdminDeleteCouponInfo, apiAdminUpdateUserStatus } from "services/adminService";
import CouponInfoModal from "./inc/CouponInfoModal";
import AddCouponModal from "./inc/AddCouponModal";

const CouponListPage = (props) => {
  const [apiCalling, setApiCalling] = useState(false)

  const [currentRow, setCurrentRow] = useState(null)
  const [showCouponInfoModal, setShowCouponInfoModal] = useState(false)
  const [showAddCouponInfoModal, setShowAddCouponInfoModal] = useState(false)

  const handleAdd = () => {
    setCurrentRow({})
    setShowAddCouponInfoModal(true)
  }

  const TABLE_COLUMNS = [
    {
      Header: "#",
      accessor: "id"
    },
    {
      Header: "Coupon Code",
      accessor: "name",
    },
    {
      Header: "Coupon Type",
      accessor: "desc",
    },
    {
      Header: "Created at",
      accessor: "add_timestamp",
      Cell: ({ value, row }) => {
        return timeConverter(value)
      }
    },
    {
      Header: "Action",
      accessor: "status",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    },
  ]
  const renderActionCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <Stack direction={`row`} spacing={1}>
        <IconButton title="Edit" color="info" variant="outlined" size="small" onClick={() => onClickEditCoupon(row)}>
          <EditOutlined />
        </IconButton>

        <IconButton title="Delete" color="error" variant="outlined" size="small" onClick={() => onClickDeleteCoupon(row)}>
          <CloseOutlined />
        </IconButton>
      </Stack>
    )
  }

  const onClickEditCoupon = (row) => {
    setCurrentRow(row)
    setShowCouponInfoModal(true)
  }

  const onClickDeleteCoupon = (row) => {
    setCurrentRow(row)
    setConfirmText(`Are you sure you want to delete?`)
    setConfirmAction("delete_coupon")
    setShowConfirmModal(true)
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [confirmAction, setConfirmAction] = useState("")

  const onClickYesConfirm = () => {
    if (confirmAction === "delete_coupon") {
      submitDeleteCoupon()
    }
  }

  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const submitDeleteCoupon = async () => {
    const payload = {...currentRow}
    setApiCalling(true)
    let apiRes = await apiAdminDeleteCouponInfo(payload)
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
        Add Coupon
      </Button>
    )
  }
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())


  return (
    <PageLayout title="Coupons">
      <ScrollX>
        <DataTableWrapper
          tableName={`coupons`}
          dataListApiUrl={`${BASE_API_URL}/admin/coupon/get-data-list`}
          handleAdd={handleAdd}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'add_timestamp', desc: false }]}
          showHeaderBar={true}
          showFilter={true}
          renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
        />
      </ScrollX>

      {
        (showCouponInfoModal) && (
          <>
            <CouponInfoModal
              show={showCouponInfoModal}
              setShow={setShowCouponInfoModal}
              title="Edit Coupon"
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        )
      }
      {
        (showAddCouponInfoModal) && (
          <>
            <CouponInfoModal
              show={showAddCouponInfoModal}
              setShow={setShowAddCouponInfoModal}
              title="Add Coupon"
              info={{ id: 0, name: "", type: "" }}
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

export default CouponListPage;