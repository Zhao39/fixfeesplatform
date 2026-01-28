import PropTypes from 'prop-types';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Button, Stack, Typography } from '@mui/material';

// third-party
import { useDropzone } from 'react-dropzone';

// project import
import RejectionFiles from './RejectionFiles';
import PlaceholderContent from './PlaceholderContent';
import { getFileExtension } from 'utils/misc';
import UploadedFileBox from './UploadedFileBox';

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

// ==============================|| UPLOAD - SINGLE FILE ||============================== //

const SingleFileUpload = (props) => {
  const {
    error,
    file,
    fieldName = "files",
    setFieldValue,
    placeholderType,
    placeholderImg,
    placeholderSx,
    placeholderPrimaryText,
    placeholderSecondaryText,
    sx,
    acceptedFileTypes = { '.pdf, .jpg, .jpeg, .png': [] },
    fileUrl,
    fileName,
    removeFile
  } = props

  const theme = useTheme();

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    accept: acceptedFileTypes,
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFieldValue(
        fieldName,
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    }
  });

  const thumbs =
    file &&
    file.map((item) => {
      var fileExt = getFileExtension(item.name)
      if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png') {
        return (
          <img
            key={item.name}
            alt={item.name}
            src={item.preview}
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
            onLoad={() => {
              URL.revokeObjectURL(item.preview);
            }}
          />
        )
      } else {
        return (
          <Box key={item.name} sx={{ width: '100%', mt: 2 }}>
            <Typography variant="h5" align='center'>
              {item.name}
            </Typography>
          </Box>
        )
      }
    });

  const onRemove = () => {
    setFieldValue(fieldName, null);
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {
        (fileUrl) ? (
          <>
            <UploadedFileBox
              fileUrl={fileUrl}
              fileName={fileName}
              removeFile={()=>removeFile()}
            >
              <PlaceholderContent
                type={placeholderType}
                placeholderImg={placeholderImg}
                placeholderSx={placeholderSx}
                primaryText={placeholderPrimaryText}
                secondaryText={placeholderSecondaryText}
              />
            </UploadedFileBox>
          </>
        ) : (
          <>
            <DropzoneWrapper
              {...getRootProps()}
              sx={{
                ...(isDragActive && { opacity: 0.72 }),
                ...((isDragReject || error) && {
                  color: 'error.main',
                  borderColor: 'error.light',
                  bgcolor: 'error.lighter'
                }),
                ...(file && {
                  padding: '12% 0'
                })
              }}
            >
              <input {...getInputProps()} />
              <PlaceholderContent
                type={placeholderType}
                placeholderImg={placeholderImg}
                placeholderSx={placeholderSx}
                primaryText={placeholderPrimaryText}
                secondaryText={placeholderSecondaryText}
              />
              {thumbs}
            </DropzoneWrapper>

            {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

            {file && file.length > 0 && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                <Button variant="contained" color="error" onClick={onRemove}>
                  Remove
                </Button>
              </Stack>
            )}
          </>
        )
      }
    </Box>
  );
};

SingleFileUpload.propTypes = {
  error: PropTypes.bool,
  file: PropTypes.array,
  setFieldValue: PropTypes.func,
  sx: PropTypes.object
};

export default SingleFileUpload;
