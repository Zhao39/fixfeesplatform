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

const SingleFileViewer = (props) => {
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
    acceptedFileTypes = { '.jpg, .jpeg, .png': [] },
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
    
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <>
        <UploadedFileBox
          fileUrl={fileUrl}
          fileName={fileName}
          placeholderImg={placeholderImg}
          showRemoveButton={false}
          removeFile={() => removeFile()}
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
    </Box>
  )
}

export default SingleFileViewer;
