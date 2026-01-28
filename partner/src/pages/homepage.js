
// material-ui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { MAIN_USER_ROUTE } from 'config/constants';
import Landing from './landing';

// ==============================|| LANDING PAGE ||============================== //

const Homepage = () => {
  return (
    <>
      {/* <Navigate to={MAIN_USER_ROUTE} /> */}
      <Landing />
    </>
  )
}

export default Homepage;
