import { Link as RouterLink } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { Grid, Link, Stack, Typography } from '@mui/material';
import RoutePageWrapper from 'pages/route-page-wrapper';
import { useDispatch, useSelector } from 'react-redux';
import { updateSocket } from "store/reducers/socket";
import { SocketContext } from 'contexts/socket';
import { console_log, empty, get_data_value } from 'utils/misc';
import { BASE_APP_URL, ENVIRONMENT } from 'config/constants';
import { useContext, useEffect } from 'react';

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
  const onGetAdminNotificationData = (data) => {
    console_log("-------------get_admin_notification_data reply data---------", data)
    dispatch(
      updateSocket({
        admin_notification_data: data,
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
      socket.on("get_admin_notification_data", onGetAdminNotificationData);
      socket.on("do_logout", onDoLogOut);
    }
  }

  const unbindSocketListener = () => {
    if (!empty(socket)) {
      socket.off("connnection", onConnection);
      socket.off("disconnect", onDisconnect);
      socket.off("get_admin_notification_data", onGetAdminNotificationData);
      socket.off("do_logout", onDoLogOut);
    }
  }

  const getAdminNotificationData = (socket) => {
    if (socket) {
      socket.emit("get_admin_notification_data", { ...socketHeader, environment: ENVIRONMENT.BUSINESS });
    }
  }

  useEffect(() => {
    addSocketListener();
    getAdminNotificationData(socket);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      unbindSocketListener()
    };
  }, [socket]);

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
