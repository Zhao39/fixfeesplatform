import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
// material-ui
import { Stack, Typography, Link, Divider } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthRegisterWizard from 'sections/auth/auth-forms/AuthRegisterWizard';
import { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { apiGetRegistraterPageData } from 'services/authService';
import { showToast } from 'utils/utils';
import { get_utc_timestamp_ms } from 'utils/misc';
import AuthRegisterHeader from 'layout/CommonLayout/AuthRegisterHeader';

// ================================|| REGISTER ||================================ //
const Register = (props) => {
  const history = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const g_step = searchParams.get('step')
  const step = g_step ? Number(g_step) : 0
  console.log("Register step:::", step)

  const coupon = searchParams.get('coupon')
  const force_coupon = searchParams.get('force_coupon')
  const email = searchParams.get('email')
  const encrypted_id = searchParams.get('user_key')
  const reload_timestamp = searchParams.get('timestamp')
  const reloadTimestamp = reload_timestamp ? Number(reload_timestamp) : 0
  const defaultUseCoupon = coupon ? true : false
  const [useCoupon, setUseCoupon] = useState(defaultUseCoupon)

  const [userInfo, setUserInfo] = useState(null)
  ////////////////////////////////////////////////////////////
  const sponsorName = searchParams.get('ref')

  useEffect(() => {
    getPageData(step)
  }, [coupon, reloadTimestamp, step])

  const getRedirectUrl = (s_step = null) => {
    const timestamp = get_utc_timestamp_ms()
    let redirectUrl = `/register?timestamp=${timestamp}`
    if (sponsorName) {
      redirectUrl += `&ref=${sponsorName}`
    }
    if (s_step !== null) {
      redirectUrl += `&step=${s_step}`
    }
    // if (email) {
    //   redirectUrl += `&email=${email}`
    // }
    return redirectUrl
  }

  const getPageData = async (step = null) => {
    if (step) {
      step = Number(step)
    }
    const params = {
      coupon: coupon,
      force_coupon: force_coupon,
      email: email,
      encrypted_id: encrypted_id,
      step: step
    }
    const apiRes = await apiGetRegistraterPageData(params)
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      //console.log("user_info::::", user_info)
      if (user_info) {
        if (user_info['register_complete'] === 1) {
          showToast("You have already registered", 'error');
          history(`/login`)
          return false
        }
      } else {
        if (step !== 0) {
          showToast("Invalid request!", 'error');
          const s_step = 0
          history(getRedirectUrl(s_step))
          return false
        }
      }
      setUserInfo(user_info)
    } else {
      const errorData = apiRes['data']
      if (errorData['coupon_invalid']) {
        setUseCoupon(false)
        showToast(apiRes.message, 'error');
        const s_step = 0
        history(getRedirectUrl(s_step))
        return false
      }
      else {
        showToast(apiRes.message, 'error');
      }
    }
  }

  const updatePageStep = (s_step, user_info) => {
    console.log('s_step, user_info:::', s_step, user_info)
    s_step = Number(s_step)
    setSearchParams({ step: s_step, user_key: user_info?.encrypted_id ?? "" })
  }

  return (
    <AuthWrapper type="register">
      {/* <AuthRegisterHeader layout={`auth`} /> */}

      <div className="block">
        <Stack direction="column" spacing={3}>
          <Box>
            <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
              <Typography variant="h3" component="h1">Sign up</Typography>
            </Stack>
            <Divider sx={{ mt: 2 }}></Divider>
          </Box>
          <Box>
            <AuthRegisterWizard
              currentStep={step}
              useCoupon={useCoupon}
              email={email ?? ""}
              sponsorName={sponsorName}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              updatePageStep={updatePageStep}
            />
          </Box>
          <Box>
            <Divider>
              <Link
                variant="h6"
                component={RouterLink}
                to={'/login'}
                color="text.primary"
              >
                Already have an account?
              </Link>
            </Divider>
          </Box>
        </Stack>
      </div>
    </AuthWrapper>
  );
};

export default Register;
