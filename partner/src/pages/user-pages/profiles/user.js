import { useRef } from 'react';

// material-ui
import { Grid } from '@mui/material';
import { Outlet } from 'react-router';
import ProfileTabs from './user/ProfileTabs';
import PageLayout from 'layout/UserLayout/PageLayout';

// project import

// ==============================|| PROFILE - USER ||============================== //

const UserProfile = () => {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <PageLayout title="" cardType="">
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <ProfileTabs focusInput={focusInput} />
        </Grid>
        <Grid item xs={12} md={9}>
          <Outlet context={inputRef} />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default UserProfile;
