import { useContext, useMemo, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useMediaQuery,
  Stack,
  Button
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import { BellOutlined } from '@ant-design/icons';

import { console_log, get_data_value, timeConverter } from 'utils/misc';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { SocketContext } from 'contexts/socket';


// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const NotificationMenuItem = (props) => {
  const { item = {}, history, setOpen, readAdminNotification } = props

  const onClickNotificationItem = () => {
    console.log("onClickNotificationItem:::::::", item)
    if (item.notify_type === 'accept') {
      return false
    }

    const data = item.data
    const data_type = item.data_type
    if (data_type === 'ticket') {
      const dataObj = data.split('_')
      const [ticketId, ticketMsgId] = dataObj
      console_log(`ticketId, ticketMsgId::::`, ticketId, ticketMsgId)
      const redirectUrl = `/admin/ticket?id=${ticketId}`
      history(redirectUrl)
    }

    readAdminNotification(item.id)
    setOpen(false)
  }

  const onClickYes = async () => {
    const data = item.data
    const data_type = item.data_type

    readAdminNotification(item.id)
    setOpen(false)
  }

  const onClickNo = async () => {
    const data = item.data
    const data_type = item.data_type
    
    readAdminNotification(item.id)
    setOpen(false)
  }

  return (
    <>
      <ListItemButton onClick={() => onClickNotificationItem()}>
        <ListItemText
          primary={
            <>
              <Typography variant="h5">
                {item.title}
              </Typography>
              <div>
                <Typography component="p">
                  {item?.content}
                </Typography>
              </div>
              {
                (item?.notify_type === 'accept') ? (
                  <Box sx={{ width: '100%', pt: 1, pb: 1 }}>
                    <Stack flexDirection={`row`} justifyContent={`flex-start`} alignItems={`center`}>
                      <Button variant="outlined" size="extraSmall" onClick={() => onClickYes()}>Yes</Button>
                      <Button variant="outlined" size="extraSmall" color="secondary" sx={{ ml: 1 }} onClick={() => onClickNo()}>No</Button>
                    </Stack>
                  </Box>
                ) : (
                  <></>
                )
              }
            </>
          }
          secondary={
            <span style={{ opacity: 0.7 }}>{timeConverter(item.update_timestamp, true)}</span>
          }
        />
      </ListItemButton>
      <Divider />
    </>
  );
}

const Notification = () => {
  const history = useNavigate()

  const userDataStore = useSelector((x) => x.auth);
  const socketDataStore = useSelector((x) => x.socketDataStore);
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [read, setRead] = useState(0); //4
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

  const getNotificationList = () => {
    console.log("socketDataStore::::::::", socketDataStore)

    let notificationList = []
    const notification_list = socketDataStore?.admin_notification_data?.notification_list
    if (notification_list) {
      notificationList = [...notificationList, ...notification_list]
    }
    return notificationList
  }

  const notificationList = useMemo(() => getNotificationList(), [socketDataStore])

  //////////////////////////socket part////////////////////////////////
  const socket = useContext(SocketContext);
  //const socketDataStore = useSelector((x) => x.socketDataStore);
  const token = get_data_value(userDataStore, "token");
  const socketHeader = { token: token };

  const readAdminNotification = (id) => {
    socket.emit("read_admin_notification", {
      ...socketHeader,
      id: id
    });
  }
  ///////////////////////////end socket part/////////////////////////////

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={notificationList.length} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? -5 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  //title="Notifications"
                  elevation={0}
                  border={false}
                  content={false}
                // secondary={
                //   <>
                //     {notificationList.length > 0 && (
                //       <Tooltip title="Mark as all read">
                //         <IconButton color="success" size="small" onClick={() => readAllNotifications()}>
                //           <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                //         </IconButton>
                //       </Tooltip>
                //     )}
                //   </>
                // }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      maxHeight: 'calc(100vh - 110px)',
                      overflowY: 'auto',
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {
                      notificationList.map((item, index) => {
                        return (
                          <NotificationMenuItem
                            key={index}
                            item={item}
                            history={history}
                            setOpen={setOpen}
                            readAdminNotification={(id) => readAdminNotification(id)}
                          />
                        )
                      })
                    }

                    {/* <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }} onClick={() => readAllNotifications()}>
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="primary">
                            View All
                          </Typography>
                        }
                      />
                    </ListItemButton> */}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Notification;
