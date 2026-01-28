import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, CardContent, CardMedia, Grid, Tooltip, Typography } from '@mui/material';

// third-party
import { CopyToClipboard } from 'react-copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

// assets
import { CopyOutlined } from '@ant-design/icons';
import SyntaxHighlight from 'utils/SyntaxHighlight';
import { showToast } from 'utils/utils';
import { get_data_value } from 'utils/misc';
import { useSelector } from 'react-redux';

const ManualInsallSection = (props) => {
  const { pageData } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const onCopySnippet = () => {
    showToast("Copied to Clipboard")
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <MainCard
          title="Pixel Layout Snippet"
          secondary={
            <CopyToClipboard
              text={pageData['snippet']}
              onCopy={() =>
                onCopySnippet()
              }
            >
              <Tooltip title="Copy">
                <IconButton size="large">
                  <CopyOutlined />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          }
        >
          <CardContent sx={{ p: 0 }}>
            <CopyToClipboard
              text={pageData['snippet']}
              onCopy={() =>
                onCopySnippet()
              }
            >
              <SyntaxHighlight showLineNumbers={true}>
                {pageData['snippet']}
              </SyntaxHighlight>
            </CopyToClipboard>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>For Shopify Layout</Typography>

              <Typography variant="body1">
                {`Copy the pixel script and log into your Shopify account.`}
              </Typography>
              <Typography variant="body1">
                {`Go to: Sales channel, Online store > Themes > Actions > Edit Code
Paste it on all layouts within all the 'head' tags, preferably at the beginning of the heads. The pixel will be most effective if it's the first in the heads.`}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {`"Checkout.liquid" layout doesn't need the pixel installed.`}
              </Typography>
              <CardMedia component="img" src={`/assets/user/images/pixel_snippet.png`} alt="Desc" />
            </Box>

          </CardContent>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MainCard
          title="Customer Events Snippet"
          secondary={
            <CopyToClipboard
              text={pageData['pixelScript']}
              onCopy={() =>
                onCopySnippet()
              }
            >
              <Tooltip title="Copy">
                <IconButton size="large">
                  <CopyOutlined />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          }
        >
          <CardContent sx={{ p: 0 }}>
            <CopyToClipboard
              text={pageData['pixelScript']}
              onCopy={() =>
                onCopySnippet()
              }
            >
              <SyntaxHighlight showLineNumbers={true}>
                {pageData['pixelScript']}
              </SyntaxHighlight>
            </CopyToClipboard>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>For Shopify Customer events</Typography>

              <Typography variant="body1">
                {`Copy the script and log into your Shopify account.`}
              </Typography>
              <Typography variant="body1">
                {`Go to: Settings > Customer events > Add custom pixel.`}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {`Paste it on the code editor, and then click Connect`}
              </Typography>

              <CardMedia component="img" src={`/assets/user/images/add-custom-pixel.jpg`} alt="Desc" />
              <CardMedia component="img" src={`/assets/user/images/edit-custom-pixel.jpg`} alt="Desc" />
            </Box>

          </CardContent>
        </MainCard>
      </Grid>
    </Grid>
  )
};

export default ManualInsallSection;
