import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Button, CardContent, CardMedia, Divider, FormHelperText, Grid, InputAdornment, InputLabel, Stack, TextField, Tooltip, Typography } from '@mui/material';

// third-party
import { CopyToClipboard } from 'react-copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
import { CopyOutlined, ScissorOutlined } from '@ant-design/icons';
import { getMainUrlFromUrl, get_data_value, isValidHttpUrl } from 'utils/misc';
import { useSelector } from 'react-redux';
// material-ui

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';

const GenericAdsSection = (props) => {
  const { pageData = {} } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const onCopyClipboard = () => {
    showToast("Copied to Clipboard")
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const defaultInitialValues = {
    utm_url: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    submit: null
  }
  const [initialValues, setInitialValues] = useState(defaultInitialValues)

  const validateScheme = {
    utm_url: Yup.string().required('Website URL is required.'),
    utm_source: Yup.string().max(255),
    utm_medium: Yup.string().max(255),
    utm_campaign: Yup.string().max(255),
    utm_term: Yup.string().max(255),
    utm_content: Yup.string().max(255)
  }
  const onSubmitFormData = async (values) => {
    console_log("values::::", values);
  }

  const getUtmUrl = (values) => {
    let utm_url = `${values.utm_url}`
    if (utm_url && isValidHttpUrl(utm_url)) {
      let url = new URL(utm_url);
      if (values.utm_source) {
        url.searchParams.set('utm_source', values.utm_source)
      }
      if (values.utm_medium) {
        url.searchParams.set('utm_medium', values.utm_medium)
      }
      if (values.utm_campaign) {
        url.searchParams.set('utm_campaign', values.utm_campaign)
      }
      if (values.utm_term) {
        url.searchParams.set('utm_term', values.utm_term)
      }
      if (values.utm_content) {
        url.searchParams.set('utm_content', values.utm_content)
      }
      const searchParamsStr = url.search
      let mainUrl = `${url.protocol}//${url.hostname}${url.pathname}`
      if (mainUrl.substr(-1) === '/') {
        mainUrl = mainUrl.substr(0, mainUrl.length - 1);
      }
      const finalUrl = `${mainUrl}${searchParamsStr}`
      return finalUrl
    }
    return ""
  }

  return (
    <Grid container>
      <Grid item xs={12} md={12}>
        <MainCard
          title="Generic URL Builder"
        >
          <CardContent sx={{ p: 0 }}>
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
                  <Box sx={{ p: .5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          {/* <InputLabel htmlFor="personal-utm_url">Website URL *</InputLabel> */}
                          <TextField
                            fullWidth
                            id="personal-utm_url"
                            value={values.utm_url}
                            name="utm_url"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Website URL *"
                            // autoFocus
                          />
                          {touched.utm_url && errors.utm_url && (
                            <FormHelperText error id="personal-utm_url-helper">
                              {errors.utm_url}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          {/* <InputLabel htmlFor="personal-utm_source">Campaign Source</InputLabel> */}
                          <TextField
                            fullWidth
                            id="personal-utm_source"
                            value={values.utm_source}
                            name="utm_source"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Campaign Source (utm_source)"
                          />
                          {touched.utm_source && errors.utm_source && (
                            <FormHelperText error id="personal-utm_source-helper">
                              {errors.utm_source}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          {/* <InputLabel htmlFor="personal-utm_medium">Campaign Medium</InputLabel> */}
                          <TextField
                            fullWidth
                            id="personal-utm_medium"
                            value={values.utm_medium}
                            name="utm_medium"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Campaign Medium (utm_medium)"

                          />
                          {touched.utm_medium && errors.utm_medium && (
                            <FormHelperText error id="personal-utm_medium-helper">
                              {errors.utm_medium}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          {/* <InputLabel htmlFor="personal-utm_campaign">Campaign Name</InputLabel> */}
                          <TextField
                            fullWidth
                            id="personal-utm_campaign"
                            value={values.utm_campaign}
                            name="utm_campaign"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Campaign Name (utm_campaign)"

                          />
                          {touched.utm_campaign && errors.utm_campaign && (
                            <FormHelperText error id="personal-utm_campaign-helper">
                              {errors.utm_campaign}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          {/* <InputLabel htmlFor="personal-utm_term">Adset Name</InputLabel> */}
                          <TextField
                            fullWidth
                            id="personal-utm_term"
                            value={values.utm_term}
                            name="utm_term"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Adset Name (utm_term)"

                          />
                          {touched.utm_term && errors.utm_term && (
                            <FormHelperText error id="personal-utm_term-helper">
                              {errors.utm_term}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          {/* <InputLabel htmlFor="personal-utm_content">Ad Name</InputLabel> */}
                          <TextField
                            fullWidth
                            id="personal-utm_content"
                            value={values.utm_content}
                            name="utm_content"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Ad Name (utm_content)"
                          />
                          {touched.utm_content && errors.utm_content && (
                            <FormHelperText error id="personal-utm_content-helper">
                              {errors.utm_content}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ py: 4 }}>
                    <Divider />
                  </Box>

                  <Box sx={{ p: .5 }}>
                    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1} >
                      {
                        (values.utm_url) && (
                          <>
                            {
                              isValidHttpUrl(values.utm_url) ? (
                                <>
                                  <TextField
                                    fullWidth
                                    value={getUtmUrl(values)}
                                    inputProps={{
                                      readOnly: true
                                    }}
                                  />

                                  <CopyToClipboard
                                    text={getUtmUrl(values)}
                                    onCopy={() =>
                                      onCopyClipboard()
                                    }
                                  >
                                    <IconButton variant="contained">
                                      <CopyOutlined />
                                    </IconButton>
                                  </CopyToClipboard>
                                </>
                              ) : (
                                <>
                                  <Typography variant="h6" color="error">Base URL not valid</Typography>
                                </>
                              )
                            }
                          </>
                        )
                      }
                    </Stack>
                  </Box>

                </form>
              )}
            </Formik>
          </CardContent>
        </MainCard>
      </Grid>
    </Grid>
  )
};

export default GenericAdsSection;
