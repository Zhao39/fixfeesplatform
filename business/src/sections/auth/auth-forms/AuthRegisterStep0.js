import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  ButtonBase
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import { useTheme } from '@mui/material/styles';

// assets
import { EyeOutlined, EyeInvisibleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { console_log, empty } from 'utils/misc';
import { APP_NAME, RECAPTCHA_ENABLED } from 'config/constants';
import { apiCheckSponsor, apiSaveRegistraterDetail } from 'services/authService';
import { showToast } from 'utils/utils';
import AuthCaptchaModal from './AuthCaptchaModal';
import AuthRegisterCheckBox from './AuthRegisterCheckBox';

// ============================|| Enter user details - REGISTER ||============================ //

const AuthRegisterStep0 = (props) => {
  const { step, userInfo = {}, setUserInfo, useCoupon, sponsorName, updatePageStep } = props;
  const theme = useTheme();
  const history = useNavigate()

  const scriptedRef = useScriptRef();
  //const phoneRef = useMask({ mask: '___-___-____', replacement: { _: /\d/ } });
  const [loading, setLoading] = useState(false)

  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  // useEffect(() => {
  //   if(userInfo && userInfo['id']) {

  //   }
  // }, [userInfo]);

  ///////////////////////////////////////////////////////////////////////////////
  const defaultInitialValues = {
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    submit: null
  }

  const getInitialValues = () => {
    const values = {
      ...defaultInitialValues,
      ...userInfo,
      password: ''
    }
    //console.log("userInfo:::::::", userInfo)
    return values;
  }

  const formValues = useRef(null)
  const [showCaptchaModal, setShowCaptchaModal] = useState(false)

  const onSubmitFormData = async (values) => {
    console_log("values::::", values);
    if (RECAPTCHA_ENABLED === "false") {
      setLoading(true)
      await savePageData(values)
      setLoading(false)
    } else {
      formValues.current = values
      setShowCaptchaModal(true)
    }
  }
  const handleConfirmCaptcha = async () => {
    setLoading(true)
    await savePageData(formValues.current)
    setLoading(false)
    setShowCaptchaModal(false)
  }

  const savePageData = async (values) => {
    if (level?.label === "Poor") {
      showToast("Please use a stronger password!", "error")
      return false
    }

    const params = {
      id: userInfo?.id,
      email: values.email,
      name: values.name,
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      password: values.password,
      ref_name: validSponsorName,
      register_step: step
    }
    const apiRes = await apiSaveRegistraterDetail(params)
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      if (user_info) {
        if (user_info['register_complete'] === 1) {
          showToast("You have already registered", 'error');
          history(`/login`)
          return false
        }
        setUserInfo(user_info)
        if (user_info['user_verified'] === '1') {
          updatePageStep(21, user_info)
        } else {
          updatePageStep(1, user_info)
        }
      } else {
        showToast("Invalid request", 'error');
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  //////////////////////// start sponsor block ////////////////////////////////
  const getDefaultSponsorName = () => {
    let ref_name = ""
    console.log(`userInfo:::`, userInfo)

    if (userInfo && userInfo.ref_name) {
      ref_name = userInfo.ref_name
    } else {
      ref_name = sponsorName
    }
    if (empty(ref_name)) {
      ref_name = "Admin"
    }
    return ref_name
  }
  const defaultSponsorName = getDefaultSponsorName()
  const [refName, setRefName] = useState(defaultSponsorName)
  const [validSponsorName, setValidSponsorName] = useState(defaultSponsorName)
  const [sponsorEditMode, setSponsorEditMode] = useState(false)
  const [sponsorChecking, setSponsorChecking] = useState(false)
  const handleChangeRefName = (e) => {
    const value = e.target.value
    setRefName(value)
  }
  const onClickEditSponsor = () => {
    setSponsorEditMode(true)
  }
  const onClickCheckSponsor = async () => {
    setSponsorChecking(true)
    const params = {
      ref: refName,
      default_sponsor: validSponsorName
    }
    const apiRes = await apiCheckSponsor(params)
    setSponsorChecking(false)
    if (apiRes['status'] === '1') {
      const result_name = apiRes['data']
      if (result_name) {
        setSponsorEditMode(false)
        if (validSponsorName !== result_name) {
          setRefName(result_name)
          setValidSponsorName(result_name)
          showToast(apiRes.message, 'success');
        }
      } else {
        showToast("Invalid request", 'error');
      }
    } else {
      setSponsorEditMode(false)
      const result_name = apiRes['data']['default_sponsor']
      setRefName(result_name)
      setValidSponsorName(result_name)
      showToast(apiRes.message, 'error');
    }
  }
  useEffect(() => {
    if (userInfo && userInfo['id']) {
      const defaultSponsorName = getDefaultSponsorName()
      setRefName(defaultSponsorName)
      setValidSponsorName(defaultSponsorName)
    }
  }, [userInfo?.id]);
  //////////////////////// end sponsor block ////////////////////////////////

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          name: Yup.string().max(255).required('Username is required'),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          first_name: Yup.string().required('First name is required'),
          last_name: Yup.string().required('Last name is required'),
          phone: Yup.string().required('Phone number is required'),
          password: Yup.string().required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            setSubmitting(true)
            await onSubmitFormData(values);
            setSubmitting(false)
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
                <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: 0 }}>
                  <Typography variant="h5">Enter your details</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="refName-signup">Your sponsor</InputLabel>
                  <Stack direction={`row`} spacing={1}>
                    <OutlinedInput
                      id="refName-login"
                      type="text"
                      value={refName}
                      name="refName"
                      onChange={(e) => handleChangeRefName(e)}
                      placeholder=""
                      fullWidth
                      readOnly={!sponsorEditMode || sponsorChecking}
                    />
                    <Button
                      disabled={!sponsorEditMode || sponsorChecking}
                      size="large"
                      type="button"
                      variant="contained"
                      color="primary"
                      style={{ width: '150px' }}
                      onClick={() => onClickCheckSponsor()}
                    >
                      {sponsorChecking ? `Checking...` : `Check`}
                    </Button>
                  </Stack>
                  <FormHelperText error id="helper-text-refName-signup">
                    Not the right Sponsor? &nbsp; <ButtonBase type="button" disabled={sponsorChecking} sx={{ color: theme.palette.primary.main }} onClick={() => onClickEditSponsor()}>Edit</ButtonBase>
                  </FormHelperText>
                </Stack>
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="name-signup">Username*</InputLabel>
                  <OutlinedInput
                    id="name-login"
                    type="text"
                    value={values.name}
                    name="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    fullWidth
                    error={Boolean(touched.name && errors.name)}
                  />
                  {touched.name && errors.name && (
                    <FormHelperText error id="helper-text-name-signup">
                      {errors.name}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="first_name-signup">First name*</InputLabel>
                  <OutlinedInput
                    id="first_name-login"
                    type="first_name"
                    value={values.first_name}
                    name="first_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    fullWidth
                    error={Boolean(touched.first_name && errors.first_name)}
                  />
                  {touched.first_name && errors.first_name && (
                    <FormHelperText error id="helper-text-first_name-signup">
                      {errors.first_name}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="last_name-signup">Last name*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.last_name && errors.last_name)}
                    id="last_name-signup"
                    type="last_name"
                    value={values.last_name}
                    name="last_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    inputProps={{}}
                  />
                  {touched.last_name && errors.last_name && (
                    <FormHelperText error id="helper-text-last_name-signup">
                      {errors.last_name}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">Email address*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    inputProps={{}}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="helper-text-email-signup">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="phone">Phone number*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.phone && errors.phone)}
                    id="phone"
                    value={values.phone}
                    name="phone"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    //inputRef={phoneRef}
                    inputProps={{
                      //placeholder: 'xxx-xxx-xxxx',
                      //pattern: "[0-9]*", //"\\d*",
                      inputMode: "numeric"
                    }}
                  />
                  {touched.phone && errors.phone && (
                    <FormHelperText error id="helper-text-phone-signup">
                      {errors.phone}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
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
                    placeholder="******"
                    inputProps={{}}
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="helper-text-password-signup">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={3}>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary" endIcon={<ArrowRightOutlined />}>
                    Next
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

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
  );
};

export default AuthRegisterStep0;
