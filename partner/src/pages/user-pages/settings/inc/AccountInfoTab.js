import { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

// material-ui
import { Box, Tab, Tabs } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// assets
import { ContainerOutlined, FileTextOutlined, LockOutlined, SettingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';

// ==============================|| PROFILE - ACCOUNT ||============================== //

const AccountInfoTab = (props) => {
  const { pathname } = useLocation();

  let selectedTab = 0;
  switch (pathname) {
    case '/user/settings/account-info/kyc-verification':
      selectedTab = 0;
      break;   
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
          <Tab label="KYC Verification" component={Link} to="/user/settings/account-info/kyc-verification" icon={<FileTextOutlined />} iconPosition="start" />
        </Tabs>
      </Box>
    </MainCard>
  )
}

export default AccountInfoTab;
