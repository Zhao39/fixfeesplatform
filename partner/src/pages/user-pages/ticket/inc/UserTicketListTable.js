import { APP_NAME, BASE_API_URL } from "config/constants";
import ScrollX from 'components/ScrollX';
import { get_utc_timestamp_ms, timeConverter } from "utils/misc";
import { useEffect, useState } from "react";
import { Alert, AlertTitle, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import { CheckCircleOutlined, ClockCircleOutlined, CloseOutlined, EditOutlined, InfoCircleOutlined, KeyOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { showToast } from "utils/utils";
import { apiAdminUpdateUserStatus } from "services/adminService";
import TicketAddModal from "./TicketAddModal";
import TicketDetailModal from "./TicketDetailModal";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const UserTicketListTable = (props) => {
  const socketDataStore = useSelector((x) => x.socketDataStore);

  const [searchParams, setSearchParams] = useSearchParams()
  const id = searchParams.get("id")
  //console.log("id:::::", id)

  useEffect(() => {
    if (id) {
      setCurrentId(id)
      onClickShowTicketDetailModal()
    }
  }, [id])

  useEffect(() => {
    if (socketDataStore?.user_notification_data) {
      setTableTimestamp(get_utc_timestamp_ms())
    }
  }, [socketDataStore?.user_notification_data])

  const handleAdd = () => {
    onClickShowTicketAddModal()
  }

  const handleViewTicketDetail = (row) => {
    setCurrentRow(row)
    setCurrentId(row.id)
    onClickShowTicketDetailModal()
  }

  const TABLE_COLUMNS = [
    {
      Header: "Action",
      accessor: "id",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    },
  ]

  const renderActionCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <Alert
        color="primary"
        variant="border"
        icon={false}
        action={
          <Chip
            label={row["status"]}
            variant="light"
            size="small"
            sx={{ cursor: 'pointer' }}
            color={row["status"] === "Opened" ? "error" : row["status"] === "Answered" ? "warning" : row["status"] === "Replied" ? "success" : row["status"] === "Closed" ? "secondary" : "warning"}
          />
        }
        onClick={() => handleViewTicketDetail(row)}
        style={{ minWidth: '440px' }}
      >
        <AlertTitle sx={{ fontSize: '1.35em' }}>{row['title']}</AlertTitle>
        <div className="ticket-details" style={{ opacity: 0.6 }}>
          <Stack direction={`row`} alignItems={`center`} justifyContent={`flex-start`} spacing={1.5}>
            <span className="info">
              <InfoCircleOutlined />&nbsp;Ticket ID: {row.id}
            </span>
            <span className="info">
              <ClockCircleOutlined />&nbsp;{timeConverter(row.add_timestamp)}
            </span>
          </Stack>
        </div>
      </Alert>
    )
  }
  const [apiCalling, setApiCalling] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [currentRow, setCurrentRow] = useState(null)

  const [showTicketAddModal, setShowTicketAddModal] = useState(false)
  const onClickShowTicketAddModal = () => {
    setShowTicketAddModal(true)
  }

  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false)
  const onClickShowTicketDetailModal = () => {
    setShowTicketDetailModal(true)

    if (id) {
      setSearchParams(params => {
        params.delete("id");
        return params;
      });
    }
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [confirmAction, setConfirmAction] = useState("")
  const onClickYesConfirm = () => {

  }
  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const renderAddItemComponent = () => {
    return (
      <Button variant="contained" startIcon={<PlusOutlined />} size="medium" onClick={() => handleAdd()}>
        New Ticket
      </Button>
    )
  }
  const [tableTimestamp, setTableTimestamp] = useState(0)
  return (
    <>
      <ScrollX>
        <DataTableWrapper
          tableName={`users`}
          dataListApiUrl={`${BASE_API_URL}/user/ticket/get-data-list`}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'id', desc: true }]}
          defaultQueryPageSize={5}
          showHeaderBar={true}
          showFilter={true}
          showTableHead={false}
          renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
          noBackground={true}
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

      {
        (showTicketAddModal) ? (
          <>
            <TicketAddModal
              show={showTicketAddModal}
              setShow={setShowTicketAddModal}
              title={`New Ticket`}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        ) : (
          <></>
        )
      }

      {
        (showTicketDetailModal) ? (
          <>
            <TicketDetailModal
              show={showTicketDetailModal}
              setShow={setShowTicketDetailModal}
              ticketid={currentId}
              //row={currentRow}
              title={`Ticket No #${currentId}`}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        ) : (
          <></>
        )
      }

    </>
  )
}

export default UserTicketListTable;