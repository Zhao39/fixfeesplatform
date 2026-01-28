import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Grid, InputAdornment, InputLabel, OutlinedInput, Stack, Tooltip, Typography } from '@mui/material';

// third-party
import { CopyToClipboard } from 'react-copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

// assets
import { CopyOutlined } from '@ant-design/icons';
import { showToast } from 'utils/utils';
import { useSelector } from 'react-redux';

const ReferralLinkBox = (props) => {
  const { type, title, note, ref_url = "", ref2_url = "" } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);

  const onCopyLink = () => {
    showToast("Copied to Clipboard")
  }

  const handleClickCopy = () => {
    onCopyLink()
  }

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Typography variant="subtitle1">{title}</Typography>
        </Grid>
        <Grid item xs={12} md={12}>
          <MainCard>
            <Stack spacing={1.25}>
              <InputLabel htmlFor={`ref_url_${type}`}>{note}</InputLabel>
              <OutlinedInput
                fullWidth
                id={`ref_url_${type}`}
                value={ref_url}
                inputProps={{
                  type: 'text',
                  readOnly: true
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <CopyToClipboard
                      text={ref_url}
                      onCopy={() =>
                        onCopyLink()
                      }
                    >
                      <Tooltip title="Copy">
                        <IconButton
                          aria-label="copy referral link"
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                          color="primary"
                        >
                          <CopyOutlined />
                        </IconButton>
                      </Tooltip>
                    </CopyToClipboard>
                  </InputAdornment>
                }
              />

              {
                (ref2_url !== "") && (
                  <>
                    <OutlinedInput
                      fullWidth
                      id={`ref2_url_${type}`}
                      value={ref2_url}
                      inputProps={{
                        type: 'text',
                        readOnly: true
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <CopyToClipboard
                            text={ref2_url}
                            onCopy={() =>
                              onCopyLink()
                            }
                          >
                            <Tooltip title="Copy">
                              <IconButton
                                aria-label="copy referral link"
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                size="large"
                                color="primary"
                              >
                                <CopyOutlined />
                              </IconButton>
                            </Tooltip>
                          </CopyToClipboard>
                        </InputAdornment>
                      }
                    />
                  </>
                )
              }

              <>
                {
                  (props.description) ? (
                    <Box>
                      <Typography variant="body1">{props.description}</Typography>
                    </Box>
                  ) : (
                    <></>
                  )
                }
              </>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ReferralLinkBox;
