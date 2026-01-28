import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid } from '@mui/material';
import MainCard from 'components/MainCard';

// assets
import { showToast } from 'utils/utils';
import { get_data_value, get_utc_timestamp_ms, priceFormat, timeConverter } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { apiUserGetProfile } from 'services/userProfileService';
import UserPaymentListTable from './inc/UserPaymentListTable';
import { apiDownloadInvoice } from 'services/userWalletService';
import { urlDownloadInvoice } from 'services/constants';

const PaymentListPage = (props) => {
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
  const handleDownloadInvoice = async (row) => {
    const params = {
      id: row.id,
      payment_date: timeConverter(row.created_at)
    }
    
    const form = document.createElement('form');
    
    form.method = 'post';
    form.action = urlDownloadInvoice;

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = params[key];

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
    form.remove()
  }
  return (
    <PageLayout title="Payment History" cardType="MainCard">
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <UserPaymentListTable handleDownloadInvoice={handleDownloadInvoice} />
        </Grid>
      </Grid>
    </PageLayout>
  )
};

export default PaymentListPage;
