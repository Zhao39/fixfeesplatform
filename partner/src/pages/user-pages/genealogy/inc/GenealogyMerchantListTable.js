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

const GenealogyMerchantListTable = (props) => {
  const handleAdd = () => {
  }

  const TABLE_COLUMNS = [
    // {
    //   Header: "ID",
    //   accessor: "id",
    // },
    {
      Header: "Email",
      accessor: "business_email",
    },
    {
      Header: "Company name",
      accessor: "business_legal_name",
    },
    {
      Header: "Person's name",
      accessor: "business_contact_first_name",
      Cell: (c_props) => renderPersonNameCell(c_props),
    },
    {
      Header: "Phone number",
      accessor: "business_phone",
    },
    {
      Header: "Sponsor",
      accessor: "ref_name",
    },
    // {
    //   Header: "Tier",
    //   accessor: "tier",
    // },
    {
      Header: "Level",
      Cell: (c_props) => renderLevelCell(c_props),
    },
    // {
    //   Header: "Status",
    //   accessor: "status",
    //   Cell: (c_props) => renderStatusCell(c_props),
    // },
    {
      Header: "Created at",
      accessor: "createdAt",
      Cell: (c_props) => renderCreatedAtCell(c_props),
    },
    {
      Header: "Stage",
      accessor: "updatedAt",
      Cell: (c_props) => renderActionCell(c_props),
      disableSortBy: true
    },
  ]

  const renderLevelCell = (c_props) => {
    const row = c_props.row.original
    let status = "";
    if (row.tier && row.tier.includes("_")) {
      status = row.tier.split("_")[1];
    }
    return status == "" ? "" : (
      <span>Level {status}</span>
    )
  }

  const renderPersonNameCell = (c_props) => {
    const row = c_props.row.original
    //console.log("row:::::", row)
    return (
      <span>{`${row.business_contact_first_name} ${row.business_contact_last_name}`}</span>
    )
  }

  const renderCreatedAtCell = (c_props) => {
    const row = c_props.row.original
    return (
      <span>{timeConverter(getUnixtimestampFromUTCDate(row.createdAt))}</span>
    )
  }

  const renderStatusCell = (c_props) => {
    const row = c_props.row.original
    let status = "";
    if (row.status == -1) {
      status = "Prospects";
    } else if (row.status == 0) {
      status = "Onboarding";
    } else if (row.status == 1) {
      status = "Underwriting";
    } else if (row.status == 2) {
      status = "Install";
    } else if (row.status == 3) {
      status = "Active Merchants";
    } else if (row.status == 4) {
      status = "Closed Merchants";
    }
    return (
      <span>{status}</span>
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
  const [showPartnerInfoModal, setShowPartnerInfoModal] = useState(false)

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const onClickYesConfirm = () => {
    setShowConfirmModal(false)
  }

  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const onClickViewLead = (row) => {
    setCurrentRow(row)
    setShowPartnerInfoModal(true)
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
          showFilter={true}
          anotherFilter={true}
          levelDrop={true}
          renderAddItemComponent={renderAddItemComponent}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
          fixFirstColumn={false}
          tableBackColor={false}
          onClickViewLead={onClickViewLead}
        />
      </ScrollX>
      {
        (showPartnerInfoModal) ? (
          <>
            <LeadStatusModal
              show={setShowPartnerInfoModal}
              setShow={setShowPartnerInfoModal}
              title={`Genealogy - ${currentRow?.business_legal_name}`}
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

export default GenealogyMerchantListTable;