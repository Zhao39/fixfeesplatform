import { Link as RouterLink } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { Grid, Link, Stack, Typography } from '@mui/material';
import RoutePageWrapper from 'pages/route-page-wrapper';
import ThemeCustomization from 'themes';
import { useContext, useEffect } from 'react';
import { console_log, empty, get_data_value } from 'utils/misc';
import { BASE_APP_URL, ENVIRONMENT } from 'config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { updateSocket } from "store/reducers/socket";
import { SocketContext } from 'contexts/socket';
import { showToast } from 'utils/utils';
import { apiGetBusinessDetail, apiGetUserDetail } from 'services/userProfileService';
import { updateAuthProfile, updateProfileData } from 'store/reducers/auth';

const PageLayout = (props) => {
  const { title = "", cardType = "MainCard", children } = props
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);

  //////////////////////////socket part////////////////////////////////
  const socket = useContext(SocketContext);
  //const socketDataStore = useSelector((x) => x.socketDataStore);
  const token = get_data_value(userDataStore, "token");
  const socketHeader = { token: token };

  const onConnection = (data) => {
    console_log("-------------socket on connecttion---------", data)
  }
  const onDisconnect = (data) => {
    console_log("-------------socket on disconnect---------", data)
  }
  const onGetUserNotificationData = (data) => {
    console_log("-------------get_user_notification_data reply data---------", data)
    dispatch(
      updateSocket({
        user_notification_data: data,
      })
    )
  }

  const onDoLogOut = (data) => {
    console_log("-------------do_logout reply data---------", data)
    window.location.href = BASE_APP_URL + "/login"
  }

  const addSocketListener = () => {
    if (!empty(socket)) {
      socket.on("connnection", onConnection);
      socket.on("disconnect", onDisconnect);
      socket.on("get_user_notification_data", onGetUserNotificationData);
      socket.on("do_logout", onDoLogOut);
    }
  }

  const unbindSocketListener = () => {
    if (!empty(socket)) {
      socket.off("connnection", onConnection);
      socket.off("disconnect", onDisconnect);
      socket.off("get_user_notification_data", onGetUserNotificationData);
      socket.off("do_logout", onDoLogOut);
    }
  }

  const getUserNotificationData = (socket) => {
    if (socket) {
      socket.emit("get_user_notification_data", { ...socketHeader, environment: ENVIRONMENT.BUSINESS });
    }
  }

  useEffect(() => {
    addSocketListener();
    getUserNotificationData(socket);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      unbindSocketListener()
    };
  }, [socket]);

  const getUserDetail = async () => {
    const apiRes = await apiGetBusinessDetail()
    if (apiRes?.status === '1') {
      const userInfo = apiRes['data']['user']
      const bannerMessage = apiRes['data']['bannerMessage'] ?? ""
      const profileData = {
        user: userInfo,
        bannerMessage: bannerMessage
      }
      dispatch(updateProfileData(profileData))
    }
  }

  useEffect(() => {
    if (token) {
      getUserDetail()
    }
  }, [userDataStore?.userUpdatedTimestamp]);
  //////////////////////////end socket part////////////////////////////////

  return (
    <RoutePageWrapper>
      <Grid container item xs={12} spacing={3}>
        {
          (title) && (
            <Grid item xs={12}>
              <Typography variant="h4">{title}</Typography>
            </Grid>
          )
        }

        <Grid item xs={12}>
          {
            (cardType === "MainCard") && (
              <MainCard content={false}>
                {children}
              </MainCard>
            )
          }
          {
            (cardType === "") && (
              <>{children}</>
            )
          }
        </Grid>
      </Grid>
    </RoutePageWrapper>
  )
}

export default PageLayout;
