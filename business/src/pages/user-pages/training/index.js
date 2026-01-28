import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Divider, Grid, InputAdornment, InputLabel, List, ListItem, ListItemText, OutlinedInput, Stack, Tooltip, Typography } from '@mui/material';

// third-party
import { CopyToClipboard } from 'react-copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

// assets
import { CopyOutlined, TeamOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import { showToast } from 'utils/utils';
import { get_data_value, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import SkeletonCard from 'components/cards/SkeltonCard';
import { apiUserGetDashboardData } from 'services/userDashboardService';
import { apiUserGetVideoList } from 'services/userVideoService';

const VideoBox = (props) => {
  const { item = {}, is_last } = props
  const theme = useTheme();
  const dispatch = useDispatch();

  let fields = []
  const training_data = item.training_data
  if (training_data) {
    const trainingData = JSON.parse(training_data)
    fields = trainingData['fields']
  }

  return (
    <>
      <Stack direction={`column`} spacing={4} style={{ width: '100%' }}>
        {
          (item.headline) ? (
            <Typography variant="h3" align="center">{item.headline}</Typography>
          ) : (
            <></>
          )
        }
        {
          (item.video_id) ? (
            <div
              className="video-box text-center"
              style={{ position: "relative", zIndex: 1 }}
            >
              <iframe
                src={`https://player.vimeo.com/video/${item.video_id}`}
                className="vimeo-iframe"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="video"
                style={{ margin: 'auto' }}
              ></iframe>
            </div>
          ) : (
            <></>
          )
        }

        {
          (fields && fields.length > 0) ? (
            <Box sx={{ width: '100%' }}>
              <Stack direction={`row`} justifyContent={`center`} sx={{ mt: -2 }}>
                <List marker={`disc`}>
                  {
                    fields.map((field_item, index) => {
                      return (
                        <ListItem key={index}>
                          <ListItemText primary={field_item} />
                        </ListItem>
                      )
                    })
                  }
                </List>
              </Stack>
            </Box>
          ) : (
            <></>
          )
        }

        {
          (!is_last) ? (
            <>
              <Divider sx={{ borderWidth: 2 }} />
            </>
          ) : (
            <></>
          )
        }
      </Stack>
    </>
  )
}

const TrainingPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const [apiCalling, setApiCalling] = useState(false)
  const [videoList, setVideoList] = useState([])

  const getVideoList = async () => {
    setApiCalling(true)
    const apiRes = await apiUserGetVideoList()
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      const video_list = apiRes['data']['vide_list']
      console.log(`video_list:::`, video_list)
      setVideoList(video_list)
    }
  }

  useEffect(() => {
    getVideoList()
  }, [])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <PageLayout title="Training" cardType="">
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <MainCard>
            <Grid container spacing={5}>
              <Grid item xs={12} md={12}>
                {/* <Typography variant="h2" align="center" sx={{ marginTop: 4 }}>Please watch the following steps to get started!</Typography> */}
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack direction={`column`} spacing={7}>
                  {
                    videoList.map((item, index) => {
                      return (
                        <VideoBox
                          key={index}
                          item={item}
                          is_last={videoList.length - 1 === index}
                        />
                      )
                    })
                  }

                  <div></div>
                </Stack>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </PageLayout>
  )
}

export default TrainingPage;
