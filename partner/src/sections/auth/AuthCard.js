import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import { useSelector } from 'react-redux';
import { console_log } from 'utils/misc';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

const AuthCard = ({ children, type, ...other }) => {
  const theme = useTheme();
  const pagePersistDataStore = useSelector((x) => x.pagePersist);
  const registerPageData = pagePersistDataStore?.registerPage
  const regStep = registerPageData?.regStep

  const getCardStyle = () => {
    const style = (type !== "register") ? { xs: 400, lg: 475 } : {}
    return style
  }

  return (
    <MainCard
      sx={{
        maxWidth: getCardStyle(),
        margin: { xs: 2.5, md: 3 },
        '& > *': {
          flexGrow: 1,
          flexBasis: '50%'
        }
      }}
      content={false}
      {...other}
      border={false}
      boxShadow
      shadow={theme.customShadows.z1}
      // mode={`light`}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
    </MainCard>
  );
};

AuthCard.propTypes = {
  children: PropTypes.node
};

export default AuthCard;
