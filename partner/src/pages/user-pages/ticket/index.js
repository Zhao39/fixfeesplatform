import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid } from '@mui/material';
import MainCard from 'components/MainCard';

// assets
import { showToast } from 'utils/utils';
import { get_data_value, get_utc_timestamp_ms, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import UserTicketListTable from './inc/UserTicketListTable';
import { apiUserGetProfile } from 'services/userProfileService';

const TicketPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const defaultFormData = {}
  const [formData, setFormData] = useState(defaultFormData)
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = {}
    const apiRes = await apiUserGetProfile()
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setFormData(apiRes['data'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  useEffect(() => {
    loadPageData()
  }, [tableTimestamp])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <PageLayout title="Support Tickets" cardType="">
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <MainCard>
             <UserTicketListTable props={props} />
          </MainCard>
        </Grid>        
      </Grid>
    </PageLayout>
  )
};

export default TicketPage;
