import { useDispatch, useSelector } from 'react-redux';

// material-ui
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  TextField
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import PageLayout from 'layout/AdminLayout/PageLayout';
import { console_log } from 'utils/misc';
import { useEffect, useState } from 'react';
import { apiAdminUpdateProfile } from 'services/adminService';
import { showToast } from 'utils/utils';
import { updateAuthProfile } from 'store/reducers/auth';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const { isLoggedIn, token, user } = userDataStore

  const defaultInitialValues = {
    name: '',
    email: '',
    password: '',
    submit: null
  }
  const [initialValues, setInitialValues] = useState(defaultInitialValues)

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    const initial_values = {
      name: user?.admin_name,
      email: user?.admin_email,
      password: ''
    }
    setInitialValues(initial_values)
  }

  const [apiCalling, setApiCalling] = useState(false)

  const onSubmitFormData = async (values) => {
    console.log(`onSubmitFormData values:::`, values)

    setApiCalling(true)
    const payload = {
      ...values
    }
    const apiRes = await apiAdminUpdateProfile(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      const adminInfo = apiRes['data']['user']
      dispatch(updateAuthProfile(adminInfo))
      showToast(apiRes.message, 'success');
      return false
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  return (
    <PageLayout title="Profile">
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: Yup.string().max(255).required('Name is required.'),
          email: Yup.string().email('Invalid email address.').max(255).required('Email is required.'),
          password: Yup.string(),
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            onSubmitFormData(values);
          } catch (err) {
            console.error(err);
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="personal-name">Name</InputLabel>
                    <TextField
                      fullWidth
                      id="personal-name"
                      value={values.name}
                      name="name"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Name"
                    // autoFocus
                    />
                    {touched.name && errors.name && (
                      <FormHelperText error id="personal-name-helper">
                        {errors.name}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="personal-email">Email Address</InputLabel>
                    <TextField
                      type="email"
                      fullWidth
                      value={values.email}
                      name="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      id="personal-email"
                      placeholder="Email Address"
                    />
                    {touched.email && errors.email && (
                      <FormHelperText error id="personal-email-helper">
                        {errors.email}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="personal-password">Password</InputLabel>
                    <TextField
                      fullWidth
                      id="personal-password"
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Password"
                      type={`password`}
                    />
                    {touched.password && errors.password && (
                      <FormHelperText error id="personal-password-helper">
                        {errors.password}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                    <Button variant="outlined" color="secondary">
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={apiCalling}>Update</Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </form>
        )}
      </Formik>
    </PageLayout>
  )
}

export default ProfilePage;
