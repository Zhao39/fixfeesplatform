// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';

// project imports

// assets
import PixelChatBlock from 'sections/pixel/PixelChatBlock';
import ItemDataTableBlock from './sections/ItemDataTableBlock';
import PageLayout from 'layout/UserLayout/PageLayout';

// ===========================|| Summary ||=========================== //

const ItemAll = () => {
  const theme = useTheme();

  return (
    <PageLayout title="All" cardType="">
      <Grid container spacing={3}>
        <ItemDataTableBlock />
        <PixelChatBlock />
      </Grid>
    </PageLayout>
  )
};

export default ItemAll;
