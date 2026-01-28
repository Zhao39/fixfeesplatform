import { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

// material-ui
import { Box, Tab, Tabs } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// assets
import { ContainerOutlined, FileTextOutlined, LockOutlined, SettingOutlined, SecurityScanOutlined, UserOutlined } from '@ant-design/icons';

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
    case '/user/settings/account-settings/profile':
    default:
      selectedTab = 0;
  }

  const [value, setValue] = useState(selectedTab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <MainCard border={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
          <Tab label="Profile" component={Link} to="/user/settings/account-settings/profile" icon={<UserOutlined />} iconPosition="start" />
          <Tab label="Change Password" component={Link} to="/user/settings/account-settings/change-password" icon={<LockOutlined />} iconPosition="start" />
          <Tab label="2FA" component={Link} to="/user/settings/account-settings/mfa" icon={<SecurityScanOutlined />} iconPosition="start" />
        </Tabs>
      </Box>
    </MainCard>
  )
}

export default AccountSettingsTab;
