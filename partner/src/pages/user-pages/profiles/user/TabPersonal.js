// material-ui
import { useOutletContext } from 'react-router';

import { useDispatch } from 'react-redux';

// material-ui
import {
  Box,
  Button,
  Divider,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  TextField
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

import MainCard from 'components/MainCard';

// assets
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';
import { apiUserGetProfile, apiUserUpdateProfile } from 'services/userProfileService';
import { useEffect, useState } from 'react';
import { updateAuthProfile } from 'store/reducers/auth';
import PageLayout from 'layout/UserLayout/PageLayout';

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

function useInputRef() {
  return useOutletContext();
}

// ==============================|| TAB - PERSONAL ||============================== //

const TabPersonal = () => {
  const dispatch = useDispatch();
  const inputRef = useInputRef();

  const defaultInitialValues = {
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    submit: null
  }
  const [initialValues, setInitialValues] = useState(defaultInitialValues)

  const validateScheme = {
    name: Yup.string().max(255).required('Name is required.'),
    first_name: Yup.string().max(255).required('First Name is required.'),
    last_name: Yup.string().max(255).required('Last Name is required.'),
    email: Yup.string().email('Invalid email address.').max(255).required('Email is required.'),
    phone: Yup.string().max(255).required('Phone number is required'),
  }

  const loadFormData = async (values) => {
    console_log("values::::", values);
    const apiRes = await apiUserGetProfile(values)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      setInitialValues(apiRes.data.user)
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  useEffect(() => {
    loadFormData()
  }, [])

  const onSubmitFormData = async (values) => {
    console_log("values::::", values);
    const apiRes = await apiUserUpdateProfile(values)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      showToast("Personal information has been updated successfully", 'success');
      dispatch(updateAuthProfile(apiRes.data.user))
    } else {
      showToast(apiRes.message, 'error');
    }
  }


  return (
    <PageLayout title="" cardType="">
      <MainCard content={false} title="Personal Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={Yup.object().shape({
            ...validateScheme
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              await onSubmitFormData(values);
              setSubmitting(false);
            } catch (err) {
              console.error(err);
              setStatus({ success: false });
              setErrors({ submit: err.message });
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
                      <InputLabel htmlFor="personal-name">Username</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-name"
                        value={values.name}
                        name="name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder=""
                        inputProps={{ readOnly: true }}
                      />
                      {touched.name && errors.name && (
                        <FormHelperText error id="personal-name-helper">
                          {errors.name}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-first_name">First Name</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-first_name"
                        value={values.first_name}
                        name="first_name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="First Name"
                        autoFocus
                        inputRef={inputRef}
                      />
                      {touched.first_name && errors.first_name && (
                        <FormHelperText error id="personal-first_name-helper">
                          {errors.first_name}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-last_name">Last Name</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-last_name"
                        value={values.last_name}
                        name="last_name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                      {touched.last_name && errors.last_name && (
                        <FormHelperText error id="personal-last_name-helper">
                          {errors.last_name}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                        inputProps={{ readOnly: true }}
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id="personal-email-helper">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-phone">Phone Number</InputLabel>
                      <TextField
                        fullWidth
                        id="personal-phone"
                        value={values.phone}
                        name="phone"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        inputProps={{
                          type: 'tel'
                        }}
                      />
                      {touched.phone && errors.phone && (
                        <FormHelperText error id="personal-phone-helper">
                          {errors.phone}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              <Divider />
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                  <Button variant="outlined" color="secondary">
                    Cancel
                  </Button>
                  <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                    Save
                  </Button>
                </Stack>
              </Box>
            </form>
          )}
        </Formik>
      </MainCard>
    </PageLayout>

  );
};

export default TabPersonal;
