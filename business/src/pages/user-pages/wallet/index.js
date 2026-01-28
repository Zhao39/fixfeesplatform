import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Button, CardContent, CardMedia, Grid, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Tooltip, Typography } from '@mui/material';

// third-party
import { CopyToClipboard } from 'react-copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
import { ClusterOutlined, CopyOutlined, ScissorOutlined, ShopOutlined, TeamOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import SyntaxHighlight from 'utils/SyntaxHighlight';
import { showToast } from 'utils/utils';
import { get_data_value, get_utc_timestamp_ms, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import { apiGetOpenPixelSnippet } from 'services/userStoreService';
import PageLayout from 'layout/UserLayout/PageLayout';
import SkeletonCard from 'components/cards/SkeltonCard';
import { apiUserGetDashboardData } from 'services/userDashboardService';
import WithdrawalModal from './inc/WithdrawalModal';
import { apiUserGetWalletPageData } from 'services/userWalletService';
import CommissionHistorySection from './inc/CommissionHistorySection';
import WithdrawalHistorySection from './inc/WithdrawalHistorySection';

const WalletPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const defaultFormData = {
    referral_fund_list: [],
    withdraw_list: []
  }
  const [formData, setFormData] = useState(defaultFormData)
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = {}
    const apiRes = await apiUserGetWalletPageData(payload)
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

  const getUserBalance = () => {
    let balance = Number(formData?.user?.balance ?? 0)
    return priceFormat(balance, '$')
  }

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const onClickRequestWithdrawal = () => {
    setShowWithdrawalModal(true)
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <PageLayout title="Wallet" cardType="">
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <MainCard>
            <Stack direction={`column`} justifyContent={`flex-start`} alignItems={`flex-start`} spacing={2}>
              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={2}>
                <Typography variant="h3" style={{ color: theme.palette.primary.main, fontWeight: '700' }}>{getUserBalance()}</Typography>
                <Typography variant="h5">Available Funds</Typography>
              </Stack>
              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                <Button type="button" variant="contained" onClick={() => onClickRequestWithdrawal()}>
                  Request Withdrawal
                </Button>
                <img src="/assets/global/images/paypal.png" style={{ backgroundColor: "#ffffff", borderRadius: '4px', height: "36px", width: "auto" }} alt="paypal" />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <MainCard title="Commission History" content={false}>
            <CommissionHistorySection
              data={formData.referral_fund_list}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </MainCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <MainCard title="Withdrawal History" content={false}>
            <WithdrawalHistorySection
              data={formData.withdraw_list}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </MainCard>
        </Grid>
      </Grid>

      {
        (showWithdrawalModal) && (
          <>
            <WithdrawalModal
              show={showWithdrawalModal}
              setShow={setShowWithdrawalModal}
              title="Confirm Withdrawal Request"
              info={formData?.user}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        )
      }

    </PageLayout>
  )
};

export default WalletPage;
