import { APP_NAME, BASE_API_URL } from "config/constants";
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { get_utc_timestamp_ms } from "utils/misc";
import { useState } from "react";
import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import { CloseOutlined, EditOutlined, PlusCircleOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import PageLayout from "layout/AdminLayout/PageLayout";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { showToast } from "utils/utils";
import { apiAdminDeleteSubscriber, apiAdminGetCompanyStats } from "services/adminService";

const SubscriberListPage = (props) => {
  const handleAdd = () => {

  }

  const TABLE_COLUMNS = [
    {
      Header: "#",
      accessor: "id",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Action",
      accessor: "timestamp",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    },
  ]
  const renderActionCell = (c_props) => {
    const rowValues = c_props.row.values
    return (
      <Stack direction={`row`} spacing={1}>
        {/* <IconButton title="Edit" color="info" variant="contained" size="small">
          <EditOutlined />
        </IconButton> */}
        <IconButton title="Delete" color="error" variant="outlined" size="small" onClick={() => onClickDeleteSubscriber(rowValues.id)}>
          <CloseOutlined />
        </IconButton>
      </Stack>
    )
  }
  const renderAddItemComponent = () => {
    return (
      <Button variant="contained" startIcon={<PlusOutlined />} size="medium" onClick={() => handleAdd()}>
        Add User
      </Button>
    )
  }
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())


  ///////////////////////////// table actions //////////////////////////////////
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [currentId, setCurrentId] = useState(0)

  const onClickDeleteSubscriber = (id) => {
    setCurrentId(id)
    setShowConfirmModal(true)
  }
  const onClickYesConfirm = () => {
    callApiDeleteSubscriber()
  }
  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const callApiDeleteSubscriber = async () => {
    const payload = {id: currentId}
    setLoading(true)
    const apiRes = await apiAdminDeleteSubscriber(payload)
    setLoading(false)
    if (apiRes['status'] === '1') {
      setTableTimestamp(get_utc_timestamp_ms())
      setShowConfirmModal(false)
      showToast(apiRes['message'], "success")
    } else {
      showToast(apiRes['message'], "error")
    }
  }


  return (
    <PageLayout title="Subscribed Email List">
      <ScrollX>
        <DataTableWrapper
          tableName={`users`}
          dataListApiUrl={`${BASE_API_URL}/admin/subscribers/get-data-list`}
          handleAdd={handleAdd}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'id', desc: false }]}
          showHeaderBar={true}
          showFilter={true}
          // renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
        />
      </ScrollX>

      {/* <Button onClick={() => setTableTimestamp(get_utc_timestamp_ms())}>TEST</Button> */}

      {/* add customer dialog */}
      {/* <Dialog maxWidth="sm" fullWidth onClose={handleAdd} open={add} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
        {add && <AddStore customer={customer} onClickDeleteStore={onClickDeleteStore} onCancel={onCloseModal} />}
      </Dialog> */}

      {
        (showConfirmModal) ? (
          <>
            <ConfirmDialog
              open={showConfirmModal}
              setOpen={setShowConfirmModal}
              title={APP_NAME}
              content={`Are you sure you want to delete?`}
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

export default SubscriberListPage;