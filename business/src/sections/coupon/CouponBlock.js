import { Fragment, useEffect, useState } from 'react';

// material-ui
import { Box, Button, Divider, FormHelperText, Grid, OutlinedInput, Stack, Switch, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';

// assets
import { ArrowRightOutlined, CheckOutlined, EnvironmentTwoTone, FileDoneOutlined, HomeFilled, MailOutlined, SmileFilled, TranslationOutlined } from '@ant-design/icons';
import { WEBSITE_VERSION } from 'config/constants';
import { console_log, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import IconButton from 'components/@extended/IconButton';
import { showToast } from 'utils/utils';
import { apiCheckCoupon, apiLogin } from 'services/authService';

const COUPON_CODE = "SCOUT101"

const CouponBlock = (props) => {
  const { coupon, setCoupon, couponApplied, setCouponApplied, couponInfo, setCouponInfo, mode } = props
  const theme = useTheme();

  const [loading, setLoading] = useState(false)
  const handleChange = (e) => {
    const v = e.target.value
    setCoupon(v)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      console.log('do validate')
      onSubmit(event)
    }
  }

  const onSubmit = (event) => {
    event.preventDefault();
    if (coupon) {
      const formData = { coupon: coupon }
      onSubmitFormData(formData)
    } else {
      showToast("Please enter coupon code", "error")
    }
  }

  const onSubmitFormData = async (values) => {
    if (couponApplied) {
      return false
    }

    setLoading(true)
    const apiRes = await apiCheckCoupon(values);
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      const coupon_info = apiRes['data']
      setCouponInfo(coupon_info)

      showToast(apiRes.message, 'success');
      setCouponApplied(true)
    } else {
      showToast(apiRes.message, 'error');
    }
    setLoading(false)
  }


  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography textAlign={`center`} variant="h4" component="p" sx={{ mb: 0.5 }}>If you're a beta tester, please enter the code you have been given!<b style={{ fontWeight: "800", display: 'none' }}>{COUPON_CODE}</b></Typography>
        </Grid>
        <Grid item xs={12}>
          <div className="coupon-form-container">
            <div className="coupon-input-box">
              <OutlinedInput
                id="coupon"
                type="text"
                value={coupon}
                name="coupon"
                onChange={(e) => handleChange(e)}
                onKeyDown={handleKeyDown}
                placeholder="Enter Coupon Code"
                fullWidth
                // required={true}
                // inputProps={{ required: true }}
                readOnly={loading || couponApplied}
                autoFocus
              />
            </div>
            <div className="coupon-button-box">
              <Button variant="contained" size="medium" title={`Apply`} disabled={loading || couponApplied} onClick={(e) => onSubmit(e)} >
                Apply
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CouponBlock;
