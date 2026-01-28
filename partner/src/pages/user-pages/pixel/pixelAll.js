// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';

// project imports

// assets
import PixelDataTableSection from './sections/PixelDataTableSection';
import PageLayout from 'layout/UserLayout/PageLayout';

// ===========================|| Summary ||=========================== //

const PixelAll = () => {
  const theme = useTheme();

  return (
    <PageLayout title="All" cardType="">
      <Grid container spacing={3}>
        <PixelDataTableSection />
      </Grid>
    </PageLayout>
  )
};

export default PixelAll;
