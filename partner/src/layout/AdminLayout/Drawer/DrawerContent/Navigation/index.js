import { useSelector } from 'react-redux';

// material-ui
import { Box, Typography } from '@mui/material';

// project import
import NavGroup from './NavGroup';
import menuItem from '../../../MenuItems';
import { empty } from 'utils/misc';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const userDataStore = useSelector((x) => x.auth);
  const user = userDataStore?.user

  const menu = useSelector((state) => state.menu);
  const { drawerOpen } = menu;

  const navGroups = menuItem.items.filter((item) => (empty(item?.role) || item?.role?.includes(user.admin_type))).map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box sx={{ pt: drawerOpen ? 2 : 0, '& > ul:first-of-type': { mt: 0 } }}>
      {navGroups}
    </Box>
  )
};

export default Navigation;
