import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Button, Stack, Typography, Link, ButtonBase } from '@mui/material';

// project import
import { empty, getFileExtension } from 'utils/misc';
import Lightbox from 'react-image-lightbox';
import { useState } from 'react';

const DropzoneWrapper = styled('div')(({ theme }) => ({
  outline: 'none',
  overflow: 'hidden',
  position: 'relative',
  padding: theme.spacing(2, 1),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.paper,
  border: `1px dashed ${theme.palette.secondary.main}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' }
}));

const UploadedFileBox = (props) => {
  const {
    fileUrl,
    fileName,
    placeholderImg,
    showRemoveButton = true,
    removeFile
  } = props

  const theme = useTheme()
  const previewUrl = !empty(fileUrl) ? fileUrl : placeholderImg
  const fileExt = getFileExtension(previewUrl)
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const isImage = () => {
    if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png') {
      return true
    } else {
      return false
    }
  }

  const thumbs = () => {
    if (isImage()) {
      return (
        <>
          <img
            alt={fileName}
            src={previewUrl}
            style={{
              top: 8,
              left: 8,
              borderRadius: 2,
              position: 'absolute',
              width: 'calc(100% - 16px)',
              height: 'calc(100% - 16px)',
              background: theme.palette.background.paper,
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
          {
            (imageModalOpen) ? (
              <Lightbox
                mainSrc={previewUrl}
                onCloseRequest={() => setImageModalOpen(false)}
              />
            ) : (
              <></>
            )
          }
        </>
      )
    } else {
      return (
        <div style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 2,
          position: 'absolute',
          width: 'calc(100% - 0px)',
          background: theme.palette.background.paper,
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        >
          {
            (fileUrl) ? (
              <Link href={fileUrl} target="_blank" variant="h5" color="textPrimary" sx={{ textAlign: 'center' }}>
                {fileName}
              </Link>
            ) : (
              <Typography variant="h5" color="textPrimary" sx={{ textAlign: 'center' }}>
                Not found
              </Typography>
            )
          }

        </div>
      )
    }
  }

  const onRemove = () => {
    removeFile()
  };

  const onClickFilePreview = () => {
    if (isImage() && !empty(fileUrl)) {
      setImageModalOpen(true)
    }
  }

  return (
    <>
      <>
        <DropzoneWrapper
          sx={{
            padding: '12% 0'
          }}
          onClick={() => onClickFilePreview()}
        >
          {
            (isImage()) ? (
              <>
                {props.children}
              </>
            ) : (
              <></>
            )
          }

          {thumbs()}
        </DropzoneWrapper>

        {
          (showRemoveButton) ? (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
              <Button variant="contained" color="error" onClick={onRemove}>
                Remove
              </Button>
            </Stack>
          ) : (
            <></>
          )
        }
      </>
    </>
  );
};

export default UploadedFileBox;
