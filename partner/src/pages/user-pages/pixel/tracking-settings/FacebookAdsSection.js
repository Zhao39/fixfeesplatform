import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Button, CardContent, Grid, Typography } from '@mui/material';

// third-party
import { CopyToClipboard } from 'react-copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';

// assets
import { CopyOutlined } from '@ant-design/icons';
import { showToast } from 'utils/utils';
import { get_data_value } from 'utils/misc';
import { useSelector } from 'react-redux';

const FacebookAdsSection = (props) => {
  const { pageData = {} } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const onCopyClipboard= () => {
    showToast("Copied to Clipboard")
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <MainCard
          title="Facebook Ads"
        >
          <CardContent sx={{ p: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  Copy the following tracking parameters and add them to the tracking settings of your active ads. 
                  These parameters should be placed in the <b>URL Parameters</b> field found in additional tracking settings
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <MainCard>
                  <Typography variant="body1">
                    {pageData['facebook']}
                  </Typography>
                </MainCard>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <CopyToClipboard
                    text={pageData['facebook']}
                    onCopy={() =>
                      onCopyClipboard()
                    }
                  >
                    <Button variant="contained" startIcon={<CopyOutlined />}>Copy</Button>
                  </CopyToClipboard>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </MainCard>
      </Grid>
    </Grid>
  )
};

export default FacebookAdsSection;
