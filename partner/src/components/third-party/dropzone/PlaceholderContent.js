import PropTypes from 'prop-types';

// material-ui
import { CameraOutlined } from '@ant-design/icons';
import { Typography, Stack, CardMedia } from '@mui/material';

// assets
import UploadCover from 'assets/images/upload/upload.svg';

// ==============================|| UPLOAD - PLACEHOLDER ||============================== //

export default function PlaceholderContent(props) {
  const {
    type,
    placeholderImg,
    placeholderSx = { width: 80 },
    primaryText = "Drag & Drop or Select file",
    secondaryText = "Only allowed (JPEG, JPG, PNG)"
  } = props

  return (
    <>
      {
        type === 'STANDARD' ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
            <CameraOutlined style={{ fontSize: '32px' }} />
          </Stack>
        ) : type === 'CUSTOM' ? (
          <>
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              direction={{ xs: 'column', md: 'row' }}
              sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
            >
              <CardMedia component="img" image={placeholderImg ?? UploadCover} sx={placeholderSx} />
              <Stack sx={{ p: 1 }} spacing={1}>
                <Typography variant="h5">{primaryText}</Typography>

                <Typography color="secondary">
                  {secondaryText}
                </Typography>
              </Stack>
            </Stack>
          </>
        ) : (
          <>
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              direction={{ xs: 'column', md: 'row' }}
              sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
            >
              <CardMedia component="img" image={UploadCover} sx={placeholderSx} />
              <Stack sx={{ p: 1 }} spacing={1}>
                <Typography variant="h5">{primaryText}</Typography>

                <Typography color="secondary">
                 {secondaryText}
                </Typography>
              </Stack>
            </Stack>
          </>
        )
      }
    </>
  );
}
PlaceholderContent.propTypes = {
  type: PropTypes.string
};
