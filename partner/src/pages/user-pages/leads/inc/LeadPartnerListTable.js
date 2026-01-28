import { APP_NAME, BASE_API_URL } from "config/constants";
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { getUnixtimestampFromUTCDate, get_utc_timestamp_ms, isoDateToTimezoneDate, isoDateToUtcDate, timeConverter } from "utils/misc";
import { useState } from "react";
import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import { CloseOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { apiAdminDeleteTransaction } from "services/adminService";
import { showToast } from "utils/utils";
import LeadStatusModal from "./LeadStatusModal";
import useConfig from "hooks/useConfig";
import { getPartnerStatusTextColor, getStatusTextColor } from "config/global_functions";

const LeadPartnerListTable = (props) => {
  const handleAdd = () => {

  }

  const TABLE_COLUMNS = [
    // {
    //   Header: "ID",
    //   accessor: "id",
    // },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Phone number",
      accessor: "phone",
    },
    {
      Header: "Created at",
      accessor: "add_timestamp",
      Cell: (c_props) => renderCreatedAtCell(c_props),
    },
    {
      Header: "Stage",
      accessor: "update_timestamp",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    }
  ]

  const renderCreatedAtCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <span>{timeConverter(Number(row.add_timestamp))}</span>
    )
  }
  const { mode } = useConfig();

  const renderActionCell = (c_props) => {
    const row = c_props.row.original
    return (
      <Stack direction={`row`} spacing={1}>
        <IconButton title="View" style={{ color: getPartnerStatusTextColor(parseInt(row.status), mode) }} variant="outlined" size="small" onClick={() => onClickViewLead(row)}>
          <EyeOutlined />
        </IconButton>
        {/* <IconButton title="Delete" color="error" variant="outlined" size="small" onClick={() => onClickAdminDeleteTransaction(row)}>
          <CloseOutlined />
        </IconButton> */}
      </Stack>
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

  const onClickYesConfirm = () => {
    setShowConfirmModal(false)
  }

  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const [showLeadStatusModal, setShowLeadStatusModal] = useState(false)
  const onClickViewLead = (row) => {
    setCurrentRow(row)
    setShowLeadStatusModal(true)
  }

  return (
    <>
      <ScrollX>
        <DataTableWrapper
          tableName={`leads`}
          type="partner"
          dataListApiUrl={`${BASE_API_URL}/user/lead/get-partner-data-list`}
          handleAdd={handleAdd}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'add_timestamp', desc: true }]}
          showHeaderBar={true}
          showFilter={true}
          tableBackColor={true}
          renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
          fixFirstColumn={false}
          filterOption={'brand_partners'}
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
        (showLeadStatusModal) ? (
          <>
            <LeadStatusModal
              show={showLeadStatusModal}
              setShow={setShowLeadStatusModal}
              title={`My Lead - ${currentRow?.business_legal_name}`}
              info={currentRow}
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

export default LeadPartnerListTable;