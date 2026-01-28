import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';

import { useNavigate } from 'react-router-dom';
import { Button, Grid, Stack, Typography } from '@mui/material';

// third party

// project import
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { console_log, empty } from 'utils/misc';
import { showToast } from 'utils/utils';
import { Box } from '@mui/system';
import MembershipBlock from 'sections/membership/MembershipBlock';
import CouponBlock from 'sections/coupon/CouponBlock';
import { apiApplyMembershipCoupon } from 'services/authService';
import { useDispatch } from 'react-redux';

// ============================Choose membership - Register ============================ //

const AuthRegisterStep23 = (props) => {
  const { step, userInfo = {}, setUserInfo, useCoupon, sponsorName, updatePageStep } = props;
  const dispatch = useDispatch()
  const history = useNavigate()

  const theme = useTheme();

  const defaultCurrentMemebership = 1;
  const defaultFromData = {
    couponApplied: false
  }

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(defaultFromData)

  useEffect(() => {
    if (userInfo) {
      if (userInfo.user_verified === '1') {
        setFormData(
          {
            ...formData,
            id: userInfo.id,
            email: userInfo.email,
            membership: defaultCurrentMemebership, // userInfo?.membership,
            coupon: ""// userInfo?.coupon
          }
        )
      }
      else {
        const regStep = 22
        setUserInfo(userInfo)
        updatePageStep(regStep, userInfo)
      }
    }
  }, [userInfo])

  const checkFormValidation = (form_data, current_field_name = "") => {
    let isValid = true
    return isValid
  }

  const onClickSelectMembership = (i) => {
    setFormData({
      ...formData,
      membership: i
    })
  }

  const onClickSetCoupon = (i) => {
    setFormData({
      ...formData,
      coupon: i
    })
  }

  const onClickSetCouponApplied = (i) => {
    setFormData({
      ...formData,
      couponApplied: i
    })
  }

  const onSubmit = (event) => {
    event.preventDefault();
    const isValid = checkFormValidation({ ...formData })
    console_log("isValid:::", isValid)
    if (!isValid) {
      return false
    }
    savePageData({ ...formData, email: userInfo?.email })
  }

  const savePageData = async (values) => {
    console_log("values::::", values);
    setLoading(true)
    const apiRes = await apiApplyMembershipCoupon(values)
    setLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      const regStep = 25// 24
      setUserInfo(userInfo)
      updatePageStep(regStep, userInfo)
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const [couponInfo, setCouponInfo] = useState(null)

  return (
    <Box>
      <form noValidate onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="column" justifyContent="center" alignItems="center" sx={{ mb: 0 }}>
              <Typography variant="h5" sx={{ mb: 0.5 }}>Choose your membership</Typography>
              {/* <Typography variant="body2">
                We offer agency plans and single store subscriptions.
              </Typography> */}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <MembershipBlock
              membership={formData?.membership}
              setMembership={(i) => onClickSelectMembership(i)}
              editable={true}
              user={userInfo ?? {}}
              mode={`light`}
              coupon={formData?.coupon}
              couponApplied={formData['couponApplied']}
              couponInfo={couponInfo}
            />
          </Grid>

          {
            (empty(formData?.license_info) && formData?.membership === 1) && (
              <Grid item xs={12}>
                <CouponBlock
                  coupon={formData?.coupon}
                  setCoupon={(i) => onClickSetCoupon(i)}
                  couponApplied={formData['couponApplied']}
                  setCouponApplied={(i) => onClickSetCouponApplied(i)}
                  couponInfo={couponInfo}
                  setCouponInfo={setCouponInfo}
                  mode={`light`}
                />
              </Grid>
            )
          }

          <Grid item xs={12}>
            <Stack flexDirection={`row`} justifyContent={`center`}>
              <Box sx={{ maxWidth: '440px', width: '100%' }}>
                <AnimateButton>
                  <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary" disabled={loading}>
                    Continue
                  </Button>
                </AnimateButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AuthRegisterStep23;
