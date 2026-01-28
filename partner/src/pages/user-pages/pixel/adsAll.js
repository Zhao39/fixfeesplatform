// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';

// assets
import AdsDataTableSection from './sections/AdsDataTableSection';
import PageLayout from 'layout/UserLayout/PageLayout';

const AdsAll = () => {
  return (
    <PageLayout title="" cardType="">
      <Grid container spacing={3}>
        <AdsDataTableSection
          title="All Ads"
        />
      </Grid>
    </PageLayout>
  )
}

export default AdsAll;
