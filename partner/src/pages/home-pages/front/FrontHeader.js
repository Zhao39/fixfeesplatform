// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Container, Grid, Stack, Button, Typography } from '@mui/material';
import Logo from 'components/logo';
import AnimateButton from 'components/@extended/AnimateButton';
import { ArrowRightOutlined, SendOutlined } from '@ant-design/icons';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Link } from 'react-router-dom';

const FrontHeader = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div className="front-header-container">
      <Grid container justifyContent={`center`} alignItems={`center`} spacing={2}>
        {
          !isMobile ? (
            <Grid item xs={isMobile ? 12 : 4}>
              <div></div>
            </Grid>
          ) : (<></>)
        }

        <Grid item xs={isMobile ? 12 : 4}>
          <Stack direction={`row`} justifyContent={`center`} alignItems={`center`} sx={{ width: '100%' }}>
            <Logo to={`/`} width={145} />
          </Stack>
        </Grid>
        <Grid item xs={isMobile ? 12 : 4}>
          <Stack direction={`row`} justifyContent={isMobile ? `center` : `flex-end`} alignItems={`center`} sx={{ width: '100%' }}>
            <Button
              size="large"
              color="success"
              variant="contained"
              //startIcon={<ArrowRightOutlined />}
              component={Link}
              className="btn-main text-uppercase"
              to="/login"
            >
              Login
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </div>
  )
}

export default FrontHeader;
