import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box} from '@mui/material';

// third party

// project import

// assets
import AuthRegisterStep0 from './AuthRegisterStep0';
import AuthRegisterStep1 from './AuthRegisterStep1';
import AuthRegisterStep21 from './AuthRegisterStep21';
import AuthRegisterStep22 from './AuthRegisterStep22';
import AuthRegisterStep23 from './AuthRegisterStep23';



import { useDispatch } from 'react-redux';

// ============================|| FIREBASE - REGISTER ||============================ //

const AuthRegisterWizard = (props) => {
  const { currentStep, useCoupon, email, sponsorName = "", userInfo, setUserInfo, updatePageStep } = props
  const dispatch = useDispatch()
  const history = useNavigate()

  const getCardStyle = () => {
    const style = currentStep === 23 ? { xs: 1072 } : { xs: 400, lg: 475 }
    return style
  }

  return (
    <Box className='register-step-container' sx={{ maxWidth: getCardStyle() }}>
      {
        (currentStep === 0) && (
          <AuthRegisterStep0
            step={currentStep}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            useCoupon={useCoupon}
            sponsorName={sponsorName}
            updatePageStep={updatePageStep}
          />
        )
      }
      {
        (currentStep === 1) && (
          <AuthRegisterStep1
            step={currentStep}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            useCoupon={useCoupon}
            sponsorName={sponsorName}
            updatePageStep={updatePageStep}
          />
        )
      }
      {
        (currentStep === 21) && (
          <AuthRegisterStep21
            step={currentStep}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            useCoupon={useCoupon}
            sponsorName={sponsorName}
            updatePageStep={updatePageStep}
          />
        )
      }
      {
        (currentStep === 22) && (
          <AuthRegisterStep22
            step={currentStep}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            useCoupon={useCoupon}
            sponsorName={sponsorName}
            updatePageStep={updatePageStep}
          />
        )
      }
      {
        (currentStep === 23) && (
          <AuthRegisterStep23
            step={currentStep}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            useCoupon={useCoupon}
            sponsorName={sponsorName}
            updatePageStep={updatePageStep}
          />
        )
      }
    </Box>
  );
};

export default AuthRegisterWizard;
