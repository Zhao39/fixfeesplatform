import { Link as RouterLink } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { Grid, Link, Stack, Typography, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RoutePageWrapper from 'pages/route-page-wrapper';
import ThemeCustomization from 'themes';
import { useContext, useEffect } from 'react';
import { console_log, empty, get_data_value } from 'utils/misc';
import { BASE_APP_URL, MERCHANT_COLORS, PARTNER_COLORS } from 'config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { updateSocket } from "store/reducers/socket";
import { SocketContext } from 'contexts/socket';
import { showToast } from 'utils/utils';
import { apiGetUserDetail } from 'services/userProfileService';
import { updateAuthProfile, updateProfileData } from 'store/reducers/auth';

const PageLayout = (props) => {
  const { title = "", cardType = "", children, cTab } = props
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
      socket.emit("get_user_notification_data", { ...socketHeader });
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
    const apiRes = await apiGetUserDetail()
    if (apiRes['status'] === '1') {
      const userInfo = apiRes['data']['user']
      const bannerMessage = apiRes['data']['bannerMessage']

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

  const boxData_merchants = [
    { gradient_color: MERCHANT_COLORS["-1"], color: 'white', text: 'Prospects' },
    { gradient_color: MERCHANT_COLORS["0"], color: 'yellow', text: 'Onboarding' },
    { gradient_color: MERCHANT_COLORS["1"], color: 'orange', text: 'Underwriting' },
    { gradient_color: MERCHANT_COLORS["2"], color: 'blue', text: 'Install' },
    { gradient_color: MERCHANT_COLORS["3"], color: 'green', text: 'Active Merchant' },
    { gradient_color: MERCHANT_COLORS["4"], color: 'red', text: 'Closed Merchant' },
  ];

  const boxData_partner = [
    { gradient_color: PARTNER_COLORS["3"], color: 'white', text: 'Prospects' },
    { gradient_color: PARTNER_COLORS["2"], color: 'yellow', text: 'Opt-in' },
    { gradient_color: PARTNER_COLORS["1"], color: 'green', text: 'Active' },
    { gradient_color: PARTNER_COLORS["0"], color: 'red', text: 'Inactive' },
  ];

  const boxData_dashboard = [
    { color: 'white', text: 'Merchants:' },
    { color: 'white', text: 'Brand Partners:' },
    { color: 'white', text: 'Commission Wallet Balance:' },
  ]


  return (
    <RoutePageWrapper>
      <Grid container item xs={12} spacing={3}>
        {
          (title) && (
            <>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 3,
                  flexWrap: 'wrap',
                }}
              >

                <Typography variant="h4" style={{ paddingLeft: '24px' }} xs={12}>{title}</Typography>

                {title == "Contacts" && (<Grid
                  container
                  spacing={2}
                  justifyContent="right"
                  sx={{
                    padding: 0,
                    display: 'flex',
                    flexWrap: 'wrap',
                    width: '80%'
                  }}
                >
                  {cTab == "Merchants" && boxData_merchants.map((box, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 50,
                          borderRadius: 1,
                          background: box.gradient_color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 1,
                          filter: `drop-shadow(0px 2px 5px ${box.color})`,
                          color: index === 0 ? 'black' : index === 1 || index === 2 ? 'black' : 'white',
                        }}
                      >
                        {box.text}
                      </Box>
                    </Grid>
                  ))}
                  {cTab == "Brand_Partners" && boxData_partner.map((box, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 50,
                          borderRadius: 1,
                          background: box.gradient_color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 1,
                          filter: `drop-shadow(0px 2px 5px ${box.color})`,
                          color: index === 0 ? 'black' : index === 1 || index === 2 ? 'black' : 'white',
                        }}
                      >
                        {box.text}
                      </Box>
                    </Grid>
                  ))}
                  {cTab == "board" && boxData_dashboard.map((box, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 50,
                          borderRadius: 1,
                          bgcolor: box.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 1,
                          filter: `drop-shadow(0px 2px 5px ${box.color})`,
                          color: index === 0 ? 'black' : index === 1 || index === 2 ? 'black' : 'white',
                        }}
                      >
                        {box.text}
                      </Box>
                    </Grid>
                  ))}
                </Grid>)}
              </Box>
            </>
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