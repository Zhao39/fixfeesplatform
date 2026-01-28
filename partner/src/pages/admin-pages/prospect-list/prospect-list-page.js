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

const ProspectListPage = (props) => {
  const [apiCalling, setApiCalling] = useState(false)

  const [currentRow, setCurrentRow] = useState(null)

  const TABLE_COLUMNS = [
    // {
    //   Header: "#",
    //   accessor: "id"
    // },
    {
      Header: "Prospects",
      accessor: "user_email",
    },
    {
      Header: "Added By",
      accessor: "sponsor_name",
    },
    // {
    //   Header: "Action",
    //   accessor: "status",
    //   Cell: (c_props) => renderActionCell(c_props),
    //   disableSortBy: true
    // },
  ]

  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())

  return (
    <PageLayout title="Prospect List">
      <ScrollX>
        <DataTableWrapper
          tableName={`prospect_list`}
          dataListApiUrl={`${BASE_API_URL}/admin/prospect/get-data-list`}
          tableColumns={TABLE_COLUMNS}
          defaultQueryPageSortBy={[{ id: 'user_email', desc: false }]}
          showHeaderBar={true}
          showFilter={true}
          tableTimestamp={tableTimestamp}
          setTableTimestamp={setTableTimestamp}
        />
      </ScrollX>
    </PageLayout>
  )
}

export default ProspectListPage;