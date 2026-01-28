import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Chip
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { console_log, getTimeStringFromSeconds, get_data_value } from 'utils/misc';
import { ACCOUNT_TYPE, APP_NAME, RECAPTCHA_ENABLED } from 'config/constants';
import { apiCheckEmailVerified, apiResendConfirmEmail } from 'services/authService';
import { showToast } from 'utils/utils';
import { useDispatch } from 'react-redux';
import { setPagePersistData } from 'store/reducers/pagePersist';
import AuthCaptchaModal from './AuthCaptchaModal';

// ============================Waiting confirmation============================ //

const AuthRegisterStep1 = (props) => {
  const { step, userInfo = {}, setUserInfo, useCoupon, sponsorName, updatePageStep } = props;
  console.log('step, userInfo::::', step, userInfo)
  const dispatch = useDispatch()
  const history = useNavigate()

  const [loading, setLoading] = useState(false)
  const [showCaptchaModal, setShowCaptchaModal] = useState(false)

  useEffect(() => {

  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true)
    const apiRes = await apiCheckEmailVerified(userInfo)
    setLoading(false)
    console_log("apiRes:::", apiRes)
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      if (user_info.register_complete === 1) {
        showToast("Registration was successful!", 'success');
        history(`/login`)
      } else {
        const regStep = 21
        setUserInfo(user_info)
        updatePageStep(regStep, user_info)
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const onClickResendEmail = async () => {
    if (RECAPTCHA_ENABLED === "true") {
      setShowCaptchaModal(true)
    } else {
      submitResendEmail()
    }
    return true
  }

  const submitResendEmail = async () => {
    console_log("onClickResendEmail:::")
    const apiRes = await apiResendConfirmEmail(userInfo)
    console_log("apiRes:::", apiRes)
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      if (user_info) {
        if (user_info['register_complete'] === 1) {
          showToast("You have already registered successfully", 'success');
          history(`/login`)
          return true
        }

        showToast(apiRes.message, 'success');

        if (user_info['user_verified'] === '1') {
          const regStep = 23
          setUserInfo(user_info)
          updatePageStep(regStep, user_info)
        }
      } else {
        showToast("Invalid request", 'success');
      }
    } else {
      if (apiRes['data']['confirmEmailRobotTimestamp']) {
        const msg = `Please try in ${getTimeStringFromSeconds(apiRes['data']['confirmEmailRobotTimestamp'])}`
        showToast(msg, 'error');
      } else {
        showToast(apiRes.message, 'error');
      }
    }
  }

  const handleConfirmCaptcha = async () => {
    await submitResendEmail()
    setShowCaptchaModal(false)
  }

  const onClickGoBack = () => {
    console.log(`onClickGoBack::::`)
    updatePageStep(0, userInfo)
  }

  return (
    <>
      <form noValidate onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="column" justifyContent="center" alignItems="center" sx={{ mb: 0 }}>
              <Typography variant="h5" sx={{ mb: 0.5 }}>Confirm your email</Typography>
              <Typography variant="body2" align="center" color="textSecondary" >
                We have sent an confirmation email to {userInfo?.email}.<br /> Click the link in that email to continue.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 0 }}>

            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={3}>
              <Button disableElevation disabled={loading} fullWidth size="large" variant="contained" color="secondary" startIcon={<ArrowLeftOutlined />} onClick={() => onClickGoBack()}>
                Back
              </Button>
              <Button disableElevation disabled={loading} fullWidth size="large" type="submit" variant="contained" color="primary" endIcon={<ArrowRightOutlined />}>
                Next
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" align="center">
              Didn&apos;t receive email? &nbsp;
              <Link variant="subtitle2" href="#" onClick={() => onClickResendEmail()}>
                Resend email
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </form>

      {
        (showCaptchaModal) && (
          <>
            <AuthCaptchaModal
              title={`${APP_NAME}`}
              open={showCaptchaModal}
              setOpen={setShowCaptchaModal}
              handleConfirmCaptcha={() => handleConfirmCaptcha()}
            />
          </>
        )
      }
    </>
  )
}
export default AuthRegisterStep1;
