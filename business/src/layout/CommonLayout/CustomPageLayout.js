import { useDispatch } from 'react-redux';
import { Container, Grid, Stack } from '@mui/material';
import Logo from 'components/logo';
import RoutePageWrapper from 'pages/route-page-wrapper';

const CustomPageLayout = (props) => {
  const { showLogo = true } = props
  return (
    <RoutePageWrapper>
      <div className='custom-page-layout'>
        <Container>
          <Grid container spacing={4}>
            {
              (showLogo) ? (
                <Grid item xs={12}>
                  <Stack direction={`row`} justifyContent={`center`} sx={{ width: '100%' }}>
                    <Logo to={`/`} src={`/assets/global/images/logo-h.png`} width={300} />
                  </Stack>
                </Grid>
              ) : (
                <></>
              )
            }
            <Grid item xs={12}>
              {props.children}
            </Grid>
          </Grid>
        </Container>
      </div>
    </RoutePageWrapper>
  )
}

export default CustomPageLayout;
