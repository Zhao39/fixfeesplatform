import { Link, useNavigate, useParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Grid, Divider, Typography, useMediaQuery } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AnimateButton from 'components/@extended/AnimateButton';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { useEffect } from 'react';
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';
import { apiConfirmEmailVerification } from 'services/authService';
import { useDispatch } from 'react-redux';
import { setPageData } from 'store/reducers/page';
import { ACCOUNT_TYPE } from 'config/constants';
import { setPagePersistData } from 'store/reducers/pagePersist';

// ================================|| CHECK MAIL ||================================ //

const ConfirmMail = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const dispatch = useDispatch()
  const history = useNavigate()

  const checkVerificationCode = async () => {
    const apiRes = await apiConfirmEmailVerification(id)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      const userData = apiRes.data
      if (userData.register_complete === 1) {
        showToast("Thank you for your register", 'success');
        history(`/login`)
      }
      else {
        showToast(apiRes.message, 'success');
        const regStep = 23 // userData['account_type'] === ACCOUNT_TYPE.BRAND ? 23 : 33
        const redirectUrl = `/register?step=${regStep}&user_key=${userData['encrypted_id']}`
        setTimeout(() => {
          history(redirectUrl)
        }, 100)
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  useEffect(() => {
    checkVerificationCode();
  }, [])

  return (
    <AuthWrapper no_content={true}>
      <h1 className="d-none hidden" style={{ display: 'none' }}>Confirm email</h1>
    </AuthWrapper>
  );
};

export default ConfirmMail;
