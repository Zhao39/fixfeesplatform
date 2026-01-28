import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { console_log } from 'utils/misc';
import { apiLogin, apiLoginTwoFactAuth, apiLogout } from 'services/authService';
import { showToast } from 'utils/utils';
import { authLogin, authLogout } from 'store/reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import { ADMIN_TYPE, MAIN_USER_ROUTE, USER_LOCKED_ROUTE } from 'config/constants';
import { useState } from 'react';
import MfaCodeInputModal from 'components/MfaModal/MfaCodeInputModal';
import { useRef } from 'react';

// ============================|| FIREBASE - LOGIN ||============================ //

const AuthLogin = () => {
  const history = useNavigate()
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  //console_log("AuthLogin userDataStore::::", userDataStore)
  const { token, isLoggedIn, user } = userDataStore

  const [apiCalling, setApiCalling] = useState(false)
  const [checked, setChecked] = useState(false);
  const [capsWarning, setCapsWarning] = useState(false);

  const scriptedRef = useScriptRef();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  }

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  }

  const onKeyDown = (keyEvent) => {
    if (keyEvent.getModifierState('CapsLock')) {
      setCapsWarning(true);
    } else {
      setCapsWarning(false);
    }
  }

  const formData = useRef({})
  const onSubmitFormData = async (values) => {
    console_log("values::::", values);
    formData.current = values
    const apiRes = await apiLogin(values)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      const authInfo = apiRes.data
      if (authInfo['mfa_required']) {
        setShowMfaCodeInputModal(true)
      } else {
        doLogin(authInfo)
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const doLogout = async () => {
    if (token) {
      await apiLogout(token)
      dispatch(authLogout())
    }
  }

  const clearThemeConfig = () => {
    try {
      window.localStorage.removeItem("mantis-react-ts-config");
    } catch (e) {
      console.log(`clearThemeConfig error:::`, e)
    }
  }

  useEffect(() => {
    doLogout()
    // clearThemeConfig()
  }, [])

  const [showMfaCodeInputModal, setShowMfaCodeInputModal] = useState(false);
  const submitMfaCodeInputModalData = async (code) => {
    const form_data = formData.current
    const payload = {
      ...form_data,
      code: code
    }
    setApiCalling(true)
    const apiRes = await apiLoginTwoFactAuth(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      const authInfo = apiRes.data
      doLogin(authInfo);
      setShowMfaCodeInputModal(false)
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  const doLogin = (authInfo) => {
    showToast("You're in!", 'success');
    dispatch(authLogin(authInfo))
    let redirectUrl = ""
    if (authInfo.is_admin === '1') {
      if (authInfo.admin_type === ADMIN_TYPE.ASSISTANT) {
        redirectUrl = "/admin/ticket" //"/admin/ticket" // 
      } else {
        redirectUrl = "/admin/user-list" //"/admin/ticket" // 
      }
    }
    else if (authInfo.locked === 1) {
      redirectUrl = USER_LOCKED_ROUTE
    }
    else {
      redirectUrl = MAIN_USER_ROUTE
    }

    setTimeout(() => {
      history(redirectUrl)
    }, 100)
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Username or Email is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            onSubmitFormData(values);
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-login">Username or Email</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="text"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter Username or Email Address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    color={capsWarning ? 'warning' : 'primary'}
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={(event) => {
                      setCapsWarning(false);
                      handleBlur(event);
                    }}
                    onKeyDown={onKeyDown}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                  {capsWarning && (
                    <Typography variant="caption" sx={{ color: 'warning.main' }} id="warning-helper-text-password-login">
                      Caps lock on!
                    </Typography>
                  )}
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">Keep me signed in</Typography>}
                  />
                  <Link
                    variant="h6"
                    component={RouterLink}
                    to={'/forgot-password'}
                    color="text.primary"
                  >
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button className="my-custom-btn-1 btn-main" disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Login
                  </Button>
                </AnimateButton>
              </Grid>
              <Grid item xs={12}>
                <Divider>
                  <Link
                    variant="h6"
                    component={RouterLink}
                    to={'/register'}
                    color="text.primary"
                  >
                    Don&apos;t have an account?
                  </Link>
                </Divider>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      {
        (showMfaCodeInputModal) && (
          <>
            <MfaCodeInputModal
              show={showMfaCodeInputModal}
              setShow={setShowMfaCodeInputModal}
              title="Two-Step Verification"
              submitModalData={(v) => submitMfaCodeInputModalData(v)}
              apiCalling={apiCalling}
              setApiCalling={setApiCalling}
            />
          </>
        )
      }


    </>
  );
};

export default AuthLogin;
