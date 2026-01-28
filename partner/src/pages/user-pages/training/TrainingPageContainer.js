import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';
import Player from "@vimeo/player";
// material-ui
import { Box, Divider, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';

// assets
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { apiUserGetVideoList } from 'services/userVideoService';

const VideoBox = (props) => {
  const { item = {}, is_last } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  let fields = []
  const training_data = item.training_data
  if (training_data) {
    const trainingData = JSON.parse(training_data)
    fields = trainingData['fields']
  }

  const pauseTimer = () => {
    console.log(`pauseTimer timerStatus:paused`)
    window.localStorage.setItem("timerStatus", "paused")
  }

  const resumeTimer = () => {
    console.log(`resumeTimer timerStatus:resume`)
    window.localStorage.setItem("timerStatus", "resume")
  }

  useEffect(() => {
    if (videoRef.current) {
      const player = new Player(videoRef.current);

      player.on("play", () => pauseTimer());
      player.on("pause", () => resumeTimer());
      player.on("ended", () => resumeTimer());

      return () => {
        player.unload();
      };
    }
  }, []);

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
              ref={videoRef}
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

const TrainingPageContainer = (props) => {
  const { pageTitle, trainingType } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const [apiCalling, setApiCalling] = useState(false)
  const [videoList, setVideoList] = useState([])

  const getVideoList = async () => {
    setApiCalling(true)
    const payload = { training_type: trainingType }
    const apiRes = await apiUserGetVideoList(payload)
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
    <PageLayout title={pageTitle} cardType="">
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

                  <div>
                    {props.children}
                  </div>
                </Stack>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </PageLayout>
  )
}

export default TrainingPageContainer;
