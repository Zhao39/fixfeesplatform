// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, InputLabel, OutlinedInput, Stack, TextField } from '@mui/material';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useState } from 'react';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { apiAdminGetSetting, apiAdminSubmitAnnouncement, apiAdminUpdateSetting } from 'services/adminService';

import PageLayout from 'layout/AdminLayout/PageLayout';
import { useEffect } from 'react';

const SettingPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  const [apiCalling, setApiCalling] = useState(false)

  const defaultFormData = {
    maintenance_mode: "false",
    registration_func: "true",
    admin_ticket_email: "",
  }
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    setApiCalling(true)
    const apiRes = await apiAdminGetSetting()
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      const app_settings = apiRes['data']['app_settings']
      console.log(`app_settings:::`, app_settings)
      setFormData(app_settings)
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  const handleChangeText = (e, field_name) => {
    const val = e.target.value
    const form_data = { ...formData }
    form_data[field_name] = val
    setFormData(form_data)
  }
  const setFileFieldValue = (field_name, val) => {
    const form_data = { ...formData }
    form_data[field_name] = val
    setFormData(form_data)
  }

  const validateForm = () => {
    let isValid = true
    //console.log("formData:::", formData)
    const form_data = { ...formData }

    return isValid
  }

  const resetForm = () => {
    loadPageData()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isValid = validateForm()
    if (!isValid) {
      return false
    }

    const payload = { ...formData }

    setApiCalling(true)
    const apiRes = await apiAdminUpdateSetting(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      showToast(apiRes.message, 'success');
      loadPageData()
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  const handleChangeSwitch = (e, field_name) => {
    const checked = e.target.checked
    const form_data = { ...formData }
    form_data[field_name] = checked ? "true" : "false"
    setFormData(form_data)
  }

  return (
    <PageLayout title="Setting">
      <form onSubmit={handleSubmit}>
        <CardContent sx={{ width: '100%' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25} direction={`column`}>
                <FormGroup>
                  <FormControlLabel
                    style={{ maxWidth: '270px' }}
                    control={
                      <Switch
                        checked={formData['maintenance_mode'] === 'true'}
                        onChange={(e) => handleChangeSwitch(e, 'maintenance_mode')}
                      />
                    }
                    label={`Maintenance mode ( ${formData['maintenance_mode'] === 'true' ? 'ON' : 'OFF'} )`}
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    style={{ maxWidth: '270px' }}
                    control={
                      <Switch
                        checked={formData['registration_func'] === 'true'}
                        onChange={(e) => handleChangeSwitch(e, 'registration_func')}
                      />
                    }
                    label={`Registration ( ${formData['registration_func'] === 'true' ? 'ENABLED' : 'DISABLED'} )`}
                  />
                </FormGroup>

              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="admin_ticket_email">Admin ticket email</InputLabel>
                <OutlinedInput
                  fullWidth
                  id="admin_ticket_email"
                  name="admin_ticket_email"
                  value={formData.admin_ticket_email}
                  onChange={(e) => handleChangeText(e, "admin_ticket_email")}
                  placeholder="Enter email address"
                  inputProps={{
                    type: 'email'
                  }}
                  required={true}
                // autoFocus
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
          <Button color="error" size="medium" onClick={() => resetForm()}>
            Cancel
          </Button>
          <Button variant="contained" size="medium" type="submit" disabled={apiCalling}>
            Submit
          </Button>
        </Stack>
      </form>
    </PageLayout>
  )
}

export default SettingPage;
