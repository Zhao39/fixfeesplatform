import { useMemo, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import { BellOutlined, CheckCircleOutlined, GiftOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

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

const Notification = () => {
  const history = useNavigate()

  const userDataStore = useSelector((x) => x.auth);
  const socketDataStore = useSelector((x) => x.socketDataStore);

  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [read, setRead] = useState(0); //2
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
    const unread_ticket_list = socketDataStore?.admin_notification_data?.unread_ticket_list
    if (unread_ticket_list) {
      notificationList = unread_ticket_list
    }
    return notificationList
  }

  const notificationList = useMemo(() => getNotificationList(), [socketDataStore])

  const onClickNotificationItem = (item) => {
    //console.log("onClickNotificationItem:::::::", item)
    const redirectUrl = `/admin/ticket?id=${item.id}`
    history(redirectUrl)
    setOpen(false)
  }

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
                  //title="Notification"
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
                          <ListItemButton key={index} onClick={() => onClickNotificationItem(item)}>
                            {/* <ListItemAvatar>
                            <Avatar
                              sx={{
                                color: 'success.main',
                                bgcolor: 'success.lighter'
                              }}
                            >
                              <GiftOutlined />
                            </Avatar>
                          </ListItemAvatar> */}
                            <ListItemText
                              primary={
                                <>
                                  <Typography variant="h5">
                                    {item.sender_name}
                                  </Typography>
                                  <Typography component="span">
                                    {item?.title}
                                  </Typography>
                                </>
                              }
                            // secondary={
                            //   <span style={{opacity: 0.7}}>2 min ago</span>
                            // }
                            />
                          </ListItemButton>
                        )
                      })
                    }

                    {/* <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
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
