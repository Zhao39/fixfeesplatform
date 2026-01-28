// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthResetPassword from 'sections/auth/auth-forms/AuthResetPassword';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setPageData } from 'store/reducers/page';

// ================================|| RESET PASSWORD ||================================ //

const ResetPassword = () => {

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="column" justifyContent="center" alignItems="center" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3" component="h1">Reset Password</Typography>
            <Typography color="secondary" sx={{ mb: 0.5, mt: 1.25 }}>Please choose your new password</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthResetPassword />
        </Grid>
      </Grid>
    </AuthWrapper>
  )
}

export default ResetPassword;
