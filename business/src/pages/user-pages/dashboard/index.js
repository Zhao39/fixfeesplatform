import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Button, ButtonBase, CardContent, CardMedia, Grid, InputAdornment, InputLabel, Link, OutlinedInput, Stack, TextField, Tooltip, Typography } from '@mui/material';

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
import { get_data_value, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import SkeletonCard from 'components/cards/SkeltonCard';
import StepBar from 'components/StepBar';
import { apiUserGetDashboardData } from 'services/userDashboardService';
import { useRef } from 'react';
import { Fragment } from 'react';
import UserUploadModal from './UserUploadModal';

const DashboardPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);

  const userRef = useRef()

  const defaultFormData = {}
  const [formData, setFormData] = useState(defaultFormData)

  const [apiLoading, setApiLoading] = useState(false)
  const [reloadTimestamp, setReloadTimestamp] = useState(0)

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = {}
    const apiRes = await apiUserGetDashboardData(payload)
    setApiLoading(false)

    if (apiRes?.status === '1') {
      setFormData(apiRes['data'])
      userRef.current = apiRes['data']['user']
      return true
    } else {
      showToast(apiRes?.message ? apiRes?.message : "Something went wrong", 'error');
      return false
    }
  }

  useEffect(() => {
    loadPageData()
  }, [reloadTimestamp])

  const [showUserUploadModal, setShowUserUploadModal] = useState(false)

  const onClickUploadStatement = () => {
    console.log(`onClickUploadStatement:::`)
    //show upload modal //todo
    setShowUserUploadModal(true)
  }

  const getStepListData = () => {
    const stepListData = [
      (<Typography key={0} variant="subtitle1">{`Onboarding`}</Typography>),
      (<Typography key={1} variant="subtitle1">{`Underwriting (In progress)`}</Typography>),
      (<Typography key={2} variant="subtitle1">{`Install`}</Typography>),
      (<Typography key={3} variant="subtitle1">{`Active Merchant`}</Typography>),
      (<Typography key={4} variant="subtitle1">{`Closed Merchants`}</Typography>),
    ]

    const userInfo = userRef.current
    if (userInfo?.upload_require_file) {
      stepListData[1] = (
        <Fragment key={1}>
          <Stack direction={`column`} justifyContent={`center`} alignItems={`center`}>
            <Typography variant="subtitle1">{`Underwriting`}</Typography>
            <Typography variant="subtitle1">{`(You have already uploaded: ${userInfo?.upload_require_name})`}</Typography>
            <ButtonBase disableRipple={true} onClick={() => onClickUploadStatement()}>
              <Link component={`p`} variant="subtitle1" underline="always">{`Upload another`}</Link>
            </ButtonBase>
          </Stack>
        </Fragment>
      )
    }
    else if (userInfo?.upload_require_name) {
      stepListData[1] = (
        <Fragment key={1}>
          <Stack direction={`column`} justifyContent={`center`} alignItems={`center`}>
            <Typography variant="subtitle1">{`Underwriting`}</Typography>
            <Typography variant="subtitle1">{`(To proceed, please upload: ${userInfo?.upload_require_name})`}</Typography>
            <ButtonBase disableRipple={true} onClick={() => onClickUploadStatement()}>
              <Link component={`p`} variant="subtitle1" underline="always">{`Upload Here`}</Link>
            </ButtonBase>
          </Stack>
        </Fragment>
      )
    }

    return stepListData
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <PageLayout title="Dashboard" cardType="">
      <Box>
        <Grid container>
          <Grid item container xs={12} md={12} spacing={3}>
            <Grid item xs={12} md={12}>
              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} sx={{ width: '100%', px: 3 }}>
                <StepBar
                  steps={getStepListData()}
                  step={0}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>

            </Grid>
          </Grid>
        </Grid>
      </Box>

      <>
        <UserUploadModal
          show={showUserUploadModal}
          setShow={setShowUserUploadModal}
          title="Upload Merchant Document"
          userInfo={userRef.current}
          reloadTimestamp={reloadTimestamp}
          setReloadTimestamp={setReloadTimestamp}
        />
      </>
    </PageLayout>
  )
}

export default DashboardPage;
