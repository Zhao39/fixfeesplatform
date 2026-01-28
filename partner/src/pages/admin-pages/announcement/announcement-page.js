// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, InputLabel, OutlinedInput, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { apiAdminSubmitAnnouncement } from 'services/adminService';

import PageLayout from 'layout/AdminLayout/PageLayout';

const AnnouncementPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch()
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  const [apiCalling, setApiCalling] = useState(false)

  const defaultFormData = {
    title: "",
    description: "",
  }
  const [formData, setFormData] = useState(defaultFormData);
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
    const title = form_data['title'].trim()
    if (title === "") {
      showToast("Subject can not be empty!", "error")
      return false;
    }
    return isValid
  }

  const resetForm = () => {
    setFormData(defaultFormData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isValid = validateForm()
    if (!isValid) {
      return false
    }

    const form_data = { ...formData }
    const payload = {
      title: form_data.title,
      description: form_data.description,
    }
    setApiCalling(true)
    const apiRes = await apiAdminSubmitAnnouncement(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      showToast(apiRes.message, 'success');
      resetForm()
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  return (
    <PageLayout title="Announcement">
      <form onSubmit={handleSubmit}>
        <CardContent sx={{ width: '100%' }}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12} sm={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="title">Subject</InputLabel>
                <OutlinedInput
                  fullWidth
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleChangeText(e, "title")}
                  placeholder="Enter subject"
                  inputProps={{
                    type: 'text'
                  }}
                  required={true}
                // autoFocus
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="description">Message</InputLabel>
                <TextField
                  id="description"
                  fullWidth
                  multiline
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleChangeText(e, "description")}
                  placeholder="Enter description"
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
          <Button color="error" size="medium" onClick={() => resetForm()}>
            Reset
          </Button>
          <Button variant="contained" size="medium" type="submit" disabled={apiCalling}>
            Submit
          </Button>
        </Stack>
      </form>
    </PageLayout>
  )
}

export default AnnouncementPage;
