import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setPageData } from 'store/reducers/page';
import { setPagePersistData } from 'store/reducers/pagePersist';

// ================================|| LOGIN ||================================ //

const Login = () => {
  const dispatch = useDispatch()
  const history = useNavigate()

  // useEffect(()=>{
  //   const pageData = { registerPage: null }
  //   dispatch(setPagePersistData(pageData))
  // }, [])

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3" component="h1" >Login to your business</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  )
}

export default Login;
