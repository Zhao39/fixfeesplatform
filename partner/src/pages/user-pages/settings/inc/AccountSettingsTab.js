import { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

// material-ui
import { Box, Button, Grid, Tab, Tabs } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// assets
import { ContainerOutlined, FileTextOutlined, LockOutlined, SettingOutlined, SecurityScanOutlined, UserOutlined, CloseCircleOutlined, WarningOutlined, OrderedListOutlined } from '@ant-design/icons';
import ConfirmDialog from 'components/ConfirmDialog/ConfirmDialog';

// ==============================|| PROFILE - ACCOUNT ||============================== //

const AccountSettingsTab = (props) => {
  const { pathname } = useLocation();

  let selectedTab = 0;
  switch (pathname) {
    case '/user/settings/account-settings/change-password':
      selectedTab = 1;
      break;
    case '/user/settings/account-settings/mfa':
      selectedTab = 2;
      break;
    case '/user/settings/account-settings/membership':
      selectedTab = 3;
      break;
    case '/user/settings/account-settings/profile':
    default:
      selectedTab = 0;
  }

  const [value, setValue] = useState(selectedTab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onClickCancelMembership = () => {
    console.log(`onClickCancelMembership:::`)
  }

  return (
    <MainCard border={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
              <Tab label="Profile" component={Link} to="/user/settings/account-settings/profile" icon={<UserOutlined />} iconPosition="start" />
              <Tab label="Change Password" component={Link} to="/user/settings/account-settings/change-password" icon={<LockOutlined />} iconPosition="start" />
              <Tab label="2FA" component={Link} to="/user/settings/account-settings/mfa" icon={<SecurityScanOutlined />} iconPosition="start" />
              <Tab label="Membership" component={Link} to="/user/settings/account-settings/membership" icon={<OrderedListOutlined />} iconPosition="start" />
            </Tabs>
          </Grid>
          {/* <Grid item>
            <Button type="button" size="large" startIcon={<WarningOutlined />} onClick={() => onClickCancelMembership()}>Cancel membership</Button>
          </Grid> */}
        </Grid>
      </Box>

      {/* {
        (showConfirmModal) ? (
          <>
            <ConfirmDialog
              open={showConfirmModal}
              setOpen={setShowConfirmModal}
              title={APP_NAME}
              content={`Are you sure you want to cancel membership?`}
              textYes={`Yes`}
              textNo={`No`}
              onClickYes={() => onClickYesConfirm()}
              onClickNo={() => onClickNoConfirm()}
            />
          </>
        ) : (
          <></>
        )
      } */}
    </MainCard>
  )
}

export default AccountSettingsTab;
