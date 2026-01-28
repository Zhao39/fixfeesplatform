import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Divider, FormLabel, Grid, TextField, Menu, MenuItem, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Avatar from 'components/@extended/Avatar';
import ProfileTab from './ProfileTab';
import { facebookColor, linkedInColor, twitterColor } from 'config';

// assets
import { FacebookFilled, LinkedinFilled, MoreOutlined, TwitterSquareFilled, CameraOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| USER PROFILE - TAB CONTENT ||============================== //

const ProfileTabs = ({ focusInput }) => {
  const theme = useTheme();

  const userDataStore = useSelector((x) => x.auth);
  const { isLoggedIn, token, user } = userDataStore

  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(avatarImage(`./default.png`));

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        {/* <Grid item container xs={12}>
          <Grid item xs={12}>
            <Stack spacing={2.5} alignItems="center">
              <FormLabel
                htmlFor="change-avtar"
                sx={{
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  '&:hover .MuiBox-root': { opacity: 1 },
                  cursor: 'pointer'
                }}
              >
                <Avatar alt="Avatar 1" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Stack spacing={0.5} alignItems="center">
                    <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                    <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                  </Stack>
                </Box>
              </FormLabel>
              <TextField
                type="file"
                id="change-avtar"
                label="Outlined"
                variant="outlined"
                sx={{ display: 'none' }}
                onChange={(e) => setSelectedImage(e.target.files?.[0])}
              />
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h5">{user?.name}</Typography>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ '& svg': { fontSize: '1.15rem', cursor: 'pointer' } }}>
                <TwitterSquareFilled style={{ color: twitterColor }} />
                <FacebookFilled style={{ color: facebookColor }} />
                <LinkedinFilled style={{ color: linkedInColor }} />
              </Stack>
            </Stack>
          </Grid>
          <Grid item sm={3} sx={{ display: { sm: 'block', md: 'none' } }} />
          <Grid item xs={12} sm={6} md={12}>
            <Stack direction="row" justifyContent="space-around" alignItems="center">
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h5">1</Typography>
                <Typography color="secondary">Pods</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h5">1</Typography>
                <Typography color="secondary">Stores</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h5">1.5K</Typography>
                <Typography color="secondary">Orders</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid> */}

        <Grid item xs={12}>
          <ProfileTab />
        </Grid>
      </Grid>
    </MainCard>
  );
};

ProfileTabs.propTypes = {
  focusInput: PropTypes.func
};

export default ProfileTabs;
