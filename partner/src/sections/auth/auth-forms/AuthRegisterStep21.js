import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography} from '@mui/material';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from 'hooks/useScriptRef';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { console_log, empty, is_null } from 'utils/misc';
import { APP_NAME, RECAPTCHA_ENABLED } from 'config/constants';
import { apiSaveRegisterBillingInfo } from 'services/authService';
import { showToast } from 'utils/utils';
import AuthCaptchaModal from './AuthCaptchaModal';
import { COUNTRIES } from 'utils/countries';
import { Field } from 'formik';

// ============================|| Enter user details - REGISTER ||============================ //

const AuthRegisterStep21 = (props) => {
  const { step, userInfo = {}, setUserInfo, useCoupon, sponsorName, updatePageStep } = props;
  const history = useNavigate()
  const scriptedRef = useScriptRef();

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
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    submit: null
  }

  const getInitialValues = () => {
    const values = {
      ...defaultInitialValues,
      ...userInfo,
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
    if (empty(values?.country)) {
      showToast("Please choose country", "error")
      return false
    }
    const params = {
      id: userInfo?.id,
      street: values.street,
      city: values.city,
      state: values.state,
      zip_code: values.zip_code,
      country: values.country,
      register_step: step
    }
    const apiRes = await apiSaveRegisterBillingInfo(params)
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      if (user_info) {
        if (user_info['register_complete'] === 1) {
          showToast("You have already registered", 'error');
          history(`/login`)
          return false
        }
        setUserInfo(user_info)
        updatePageStep(22, user_info)
      } else {
        showToast("Invalid request", 'error');
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const selectedCountry = (country_code) => {
    console.log(`country_code::::`, country_code)
    const item = COUNTRIES.find((v) => v.code === country_code)
    return item
  }

  const onClickGoBack = () => {
    console.log(`onClickGoBack::::`)
    updatePageStep(0, userInfo)
  }

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          street: Yup.string().max(255).required('Street is required'),
          city: Yup.string().required('City is required'),
          state: Yup.string().required('State is required'),
          zip_code: Yup.string().required('Zip code is required'),
          country: Yup.string().required('Country is required')
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
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setValues, setFieldValue }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: 0 }}>
                  <Typography variant="h5">Enter Billing Info</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="street-signup">Street*</InputLabel>
                  <OutlinedInput
                    id="street-signup"
                    type="text"
                    value={values.street}
                    name="street"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    fullWidth
                    error={Boolean(touched.street && errors.street)}
                  />
                  {touched.street && errors.street && (
                    <FormHelperText error id="helper-text-street-signup">
                      {errors.street}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="city-signup">City*</InputLabel>
                  <OutlinedInput
                    id="city-signup"
                    type="city"
                    value={values.city}
                    name="city"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    fullWidth
                    error={Boolean(touched.city && errors.city)}
                  />
                  {touched.city && errors.city && (
                    <FormHelperText error id="helper-text-city-signup">
                      {errors.city}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="state-signup">State/Province*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.state && errors.state)}
                    id="state-signup"
                    type="text"
                    value={values.state}
                    name="state"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    inputProps={{}}
                  />
                  {touched.state && errors.state && (
                    <FormHelperText error id="helper-text-state-signup">
                      {errors.state}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="zip_code-signup">Zip Code*</InputLabel>
                  <OutlinedInput
                    id="zip_code-signup"
                    type="text"
                    value={values.zip_code}
                    name="zip_code"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder=""
                    fullWidth
                    error={Boolean(touched.zip_code && errors.zip_code)}
                  />
                  {touched.zip_code && errors.zip_code && (
                    <FormHelperText error id="helper-text-zip_code-signup">
                      {errors.zip_code}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="country-signup">Country*</InputLabel>
                  <Field
                    name="country"
                    component={AutocompleteCountryField}
                    options={COUNTRIES}
                    label=""
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={3}>
                  <Button disableElevation disabled={isSubmitting} size="large" variant="contained" color="secondary" startIcon={<ArrowLeftOutlined />} onClick={() => onClickGoBack()}>
                    Back
                  </Button>
                  <Button disableElevation disabled={isSubmitting} size="large" type="submit" variant="contained" color="primary" endIcon={<ArrowRightOutlined />}>
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
  )
}

const AutocompleteCountryField = (props) => {
  const { field, form, options = COUNTRIES, label } = props
 
  const getSelectedCountry = (country_code) => {
    //console.log(`country_code::::`, country_code)
    const item = options.find((v) => v.code === country_code)
    return item
  }

  const getOptionLabel = (option) => {
    if (option) {
      if (!is_null(option.label)) {
        return option.label
      } else {
        const countryItem = getSelectedCountry(option)
        return countryItem?.label
      }
    }
    return option
  }

  return (
    <Autocomplete
      {...field}
      options={options}
      getOptionLabel={(option) => getOptionLabel(option)}
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          <img
            loading="lazy"
            width="20"
            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
            alt=""
          />
          {option.label} ({option.code})
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          //label="Choose a country"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
      onChange={(event, value) => {
        console.log(`onChange field.name, value:::`, field.name, value)
        form.setFieldValue(field.name, value?.code ?? "");
      }}
    />
  )
}

export default AuthRegisterStep21;
