import { useEffect } from 'react';

// material-ui
import {
  Button,
  FormHelperText,
  Grid,
  Stack,
  Typography,
  Switch
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { console_log } from 'utils/misc';
import { apiSaveRegistraterBillPlan } from 'services/authService';

// ============================|| build your plan ||============================ //

const AuthRegisterStep24 = (props) => {
  const { step, userInfo = {}, setUserInfo, useCoupon, sponsorName, updatePageStep } = props;
  const scriptedRef = useScriptRef();
  ///////////////////////////////////////////////////////////////////////////////

  const defaultInitialValues = {
    plan_type: true, // true: yearly, false: monthly
    annual_revenue: '',
    submit: null
  }

  const getInitialValues = () => {
    const values = {
      ...defaultInitialValues,
    }
    if (userInfo) {
      values['plan_type'] = userInfo['plan_type'] === 1
      values['annual_revenue'] = userInfo['annual_revenue']
    }
    return values;
  }

  useEffect(() => {

  }, []);

  const onSubmitFormData = async (values) => {
    console.log("onSubmitFormData::::", userInfo)
    if (userInfo) {
      console_log("values::::", values);
      await savePageData(values)
    }
  }

  const savePageData = async (values) => {
    const params = {
      email: userInfo.email,
      ...values,
      register_step: step
    }
    const apiRes = await apiSaveRegistraterBillPlan(params)
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      if (user_info) {
        if (user_info['register_complete'] === 1) {
          showToast("You have already registered", 'error');
          history(`/login`)
          return false
        }

        const regStep = 25
        setUserInfo(user_info)
        updatePageStep(regStep, user_info)
      } else {
        showToast("Invalid request", 'error');
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          annual_revenue: Yup.string().required('Gross annual revenue is required'),
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            setSubmitting(true);
            await onSubmitFormData(values);
            setSubmitting(false);
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
                <Stack direction="column" justifyContent="center" alignItems="center" sx={{ mb: 0 }}>
                  <Typography variant="h5" sx={{ mb: 0.5 }}>Build your plan</Typography>
                  <Typography variant="body2" align="center" color="textSecondary" >
                    Starting from only $100
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: 0 }} spacing={2}>
                  <Typography variant="body2" align="center" color="textPrimary" >
                    Build monthly
                  </Typography>
                  <Switch
                    id="plan_type"
                    name="plan_type"
                    onBlur={handleBlur}
                    checked={values.plan_type}
                    onChange={handleChange}
                  />
                  <Typography variant="body2" align="center" color="textPrimary" >
                    Build yearly
                  </Typography>
                </Stack>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Continue
                  </Button>
                </AnimateButton>
              </Grid>
              {/* <Grid item xs={12}>
                <Stack direction="row" justifyContent="flex-start" alignItems="center" sx={{ mb: 0 }}  >
                  <Typography variant="body2">
                    <Link variant="subtitle2" component={RouterLink} to="/login">
                      Skip for now
                    </Link>
                  </Typography>
                </Stack>
              </Grid> */}
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthRegisterStep24;
