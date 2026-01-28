import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import NumberFormat from 'react-number-format';

// project import
import { openSnackbar } from 'store/reducers/snackbar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

// assets
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, PlusOutlined } from '@ant-design/icons';
import masterCard from 'assets/images/icons/master-card.png';
import paypal from 'assets/images/icons/paypal.png';
import visaCard from 'assets/images/icons/visa-card.png';
import PageLayout from 'layout/UserLayout/PageLayout';
import BillingForm from 'components/BillingForm/BillingForm';
import { useEffect } from 'react';
import { apiGetUserDetail, apiUserRemoveCardDetail, apiUserUpdateCardDetail } from 'services/userProfileService';
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';

// style & constant
const buttonStyle = { color: 'text.primary', fontWeight: 600 };

// ==============================|| TAB - PAYMENT ||============================== //

const TabPayment = () => {
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const { isLoggedIn, token, user } = userDataStore

  useEffect(() => {
    getPageData()
  }, [])

  const [userInfo, setUserInfo] = useState(user)
  const getPageData = async () => {
    const apiRes = await apiGetUserDetail()
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      setUserInfo(user_info)
    }
  }

  const [apiLoading, setApiLoading] = useState(false)

  const submitBillingData = async (values) => {
    //console.log(`submitBillingData values::::`, values)
    const payload = {
      ...values
    }
    setApiLoading(true)
    const apiRes = await apiUserUpdateCardDetail(payload)
    setApiLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      showToast("Card has been updated successfully", 'success');
      getPageData()
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const removeCardDetail = async () => {
    const payload = {}
    setApiLoading(true)
    const apiRes = await apiUserRemoveCardDetail(payload)
    setApiLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      showToast("Card on file has been removed successfully!", 'success');
      getPageData()
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  return (
    <PageLayout title="" cardType="">
      <MainCard title="Payment Method">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" sx={{ mb: 0 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>{`Card on File: ${userInfo?.card_last_4 ? '************' + userInfo?.card_last_4 : 'None'}`}</Typography>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <BillingForm
              submitBillingData={(values) => submitBillingData(values)}
              removeCardDetail={() => removeCardDetail()}
              sourcePage={`update_card`}
              formContainer=""
              amount={0}
              showHeader={false}
            />
          </Grid>
        </Grid>
      </MainCard>
    </PageLayout>

  );
};

export default TabPayment;
