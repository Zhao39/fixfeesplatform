import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Grid,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  Link
} from '@mui/material';

// project import
import { useTheme } from '@mui/material/styles';

const AuthRegisterCheckBox = (props) => {
  const { allChecked, setAllChecked } = props;
  const theme = useTheme();
  const history = useNavigate()

  const defaultFormData = {
    check1: false,
    check2: false,
    check3: false
  }
  const [formData, setFormData] = useState(defaultFormData)
  const handleChangeCheckbox = (field_name, checked) => {
    const form_data = { ...formData }
    form_data[field_name] = checked
    setFormData(form_data)
  }

  useEffect(() => {
    const checked = formData['check1'] && formData['check2'] && formData['check3']
    setAllChecked(checked)
  }, [formData])

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData['check1']}
                  onChange={(event) => handleChangeCheckbox('check1', event.target.checked)}
                  name="check1"
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="h6"> I give my express consent to receive recurring automated texts from "Fix My Fees, LLC" a product of
                partners.fixmyfees.com. Message and data rates may apply. I understand I can opt-out by replying 'STOP' to any
                message, or get more info by replying 'HELP.' Consent is not required for purchasing products or services. My
                number will not be shared with third parties or affiliates. I agree to receive service updates and account
                notifications to the phone number provided. </Typography>}
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData['check2']}
                  onChange={(event) => handleChangeCheckbox('check2', event.target.checked)}
                  name="check2"
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="h6">I consent to receive marketing communications and promotions to the phone number provided.</Typography>}
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData['check3']}
                  onChange={(event) => handleChangeCheckbox('check3', event.target.checked)}
                  name="check3"
                  color="primary"
                  size="small"
                />
              }
              label={<><Typography variant="h6">I agree with the <Link href="/terms-service" target="_blank">Terms of Services</Link> and <Link href="/privacy-policy" target="_blank">Privacy Policy</Link>.</Typography></>}
            />
            <></>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AuthRegisterCheckBox;
