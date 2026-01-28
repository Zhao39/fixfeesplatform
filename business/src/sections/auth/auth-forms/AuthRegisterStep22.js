import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Grid,
  Link,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox
} from '@mui/material';

// third party

// project import
import useScriptRef from 'hooks/useScriptRef';

// assets
import { empty } from 'utils/misc';
import { APP_NAME, LICENSE_PRICE } from 'config/constants';
import { apiCompleteRegister } from 'services/authService';
import { showToast } from 'utils/utils';
import AuthCaptchaModal from './AuthCaptchaModal';
import BillingForm from 'components/BillingForm/BillingForm';

// ============================|| Enter user details - REGISTER ||============================ //

const AuthRegisterStep22 = (props) => {
  const { step, userInfo = {}, setUserInfo, useCoupon, sponsorName, updatePageStep } = props;
  const history = useNavigate()
  const scriptedRef = useScriptRef();
  const [loading, setLoading] = useState(false)
  const [submittingDisabled, setSubmittingDisabled] = useState(true)

  ///////////////////////////////////////////////////////////////////////////////
  const formValues = useRef(null)
  const [showCaptchaModal, setShowCaptchaModal] = useState(false)

  const handleConfirmCaptcha = async () => {
    setLoading(true)
    await savePageData(formValues.current)
    setLoading(false)
    setShowCaptchaModal(false)
  }

  const submitBillingData = async (values) => {
    console.log(`submitBillingData userInfo, values:::`, userInfo, values)
    if (empty(userInfo.email)) {
      return false
    }

    const params = {
      email: userInfo.email,
      ...values,
      register_step: step
    }
    console.log(`submitBillingData params:::`, params)

    const apiRes = await apiCompleteRegister(params)
    if (apiRes['status'] === '1') {
      const user_info = apiRes['data']['user']
      if (user_info) {
        if (user_info['register_complete'] === 1) {
          showToast("You have registered successfully", 'success');
          history(`/login`)
          return true
        } else {
          showToast("Invalid request", 'error');
        }
      } else {
        showToast("Invalid request", 'error');
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const onClickGoBack = () => {
    console.log(`onClickGoBack::::`)
    updatePageStep(21, userInfo)
  }

  const [termsChecked, setTermsChecked] = useState(false)
  const handleChangeTermsCheckBox = (e) => {
    const checked = e.target.checked
    setTermsChecked(checked)
    setSubmittingDisabled(!checked)
  }
  return (
    <>
      <>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: 0 }}>
              <Typography variant="h5">Enter Card Info</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={12}>
            <BillingForm
              submitBillingData={(values) => submitBillingData(values)}
              onClickGoBack={() => onClickGoBack()}
              sourcePage={`register_page`}
              formContainer=""
              amount={LICENSE_PRICE}
              showHeader={false}
              submittingDisabled={submittingDisabled}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="terms_checkbox"
                    color="primary"
                    onChange={(e) => handleChangeTermsCheckBox(e)}
                    checked={termsChecked}
                  />
                }
                label={
                  <Typography variant="body1">
                    I Accept {` `}
                    <Link component={RouterLink} to="/terms-conditions" target="_blank" variant="body1" color="primary" underline="always">
                      Terms & Conditions
                    </Link>
                  </Typography>
                }
                sx={{ width: "auto" }}
              />
            </BillingForm>
          </Grid>
        </Grid>
      </>

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

export default AuthRegisterStep22;
