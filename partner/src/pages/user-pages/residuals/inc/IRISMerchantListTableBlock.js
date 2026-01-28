import { APP_NAME, BASE_API_URL } from "config/constants";
import ScrollX from 'components/ScrollX';
import { getUnixtimestampFromUTCDate, get_utc_timestamp_ms, timeConverter } from "utils/misc";
import { useState } from "react";
import { IconButton, Stack } from "@mui/material";
import { EyeOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";

const LeadMerchantListTable = (props) => {
  const handleAdd = () => {

  }

  const TABLE_COLUMNS = [
    // {
    //   Header: "ID",
    //   accessor: "id",
    // },
    {
      Header: "MID",
      accessor: "mid",
    },
    {
      Header: "Merchant DBA",
      accessor: "business_dba",
    },
    {
      Header: "Total Volume",
      accessor: "processing_volume",
      Cell: (c_props) => renderPersonNameCell(c_props),
    },
    {
      Header: "Total Transactions",
      accessor: "average_transaction",
    },
    {
      Header: "Active",
      accessor: "status",
      Cell: (c_props) => renderCreatedAtCell(c_props),
    },
    {
      Header: "Approval Date",
      accessor: "updatedAt"
    },
    {
      Header: "Start Processing Date",
      accessor: "business_start_date",
    },
    {
      Header: "Last Batch Date",
      accessor: "",
    },
    
  ]

  const renderPersonNameCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <span>{`${row.business_contact_first_name} ${row.business_contact_last_name}`}</span>
    )
  }

  const renderCreatedAtCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <span>{timeConverter(getUnixtimestampFromUTCDate(row.createdAt))}</span>
    )
  }

  const renderActionCell = (c_props) => {
    const row = c_props.row.original
    return (
      <Stack direction={`row`} spacing={1}>
        <IconButton title="View" color="info" variant="outlined" size="small" onClick={() => onClickViewLead(row)}>
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
          dataListApiUrl={`${BASE_API_URL}/user/lead/get-merchant-data-list`}
          handleAdd={handleAdd}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'createdAt', desc: true }]}
          showHeaderBar={true}
          showFilter={false}
          renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
          fixFirstColumn={false}
          tableBackColor={false}

          onClickViewLead={onClickViewLead}

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
    </>
  )
}

export default LeadMerchantListTable;