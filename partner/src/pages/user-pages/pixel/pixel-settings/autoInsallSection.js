import { useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Button, CardContent, Grid, Stack } from '@mui/material';

// third-party

// project imports
import MainCard from 'components/MainCard';

// assets
import { showToast } from 'utils/utils';
import { get_data_value } from 'utils/misc';
import { useSelector } from 'react-redux';
import ConfirmDialog from 'components/ConfirmDialog/ConfirmDialog';
import { APP_NAME } from 'config/constants';
import PixelInstallLogsSection from './PixelInstallLogsSection';

const AutoInsallSection = (props) => {
  const { pageData, storeInfo, setStoreInfo, pixelInstallLogs = [], setPixelInstallLogs, loading, setLoading } = props
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const onCopySnippet = () => {
    showToast("Copied to Clipboard")
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const installPixel = async () => {
     
  }

  const uninstallPixel = async () => {
    
  }

  const onClickUninstallPixel = () => {
    setShowConfirmModal(true)
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const onClickYesConfirm = () => {
    uninstallPixel()
  }
  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <MainCard
            title="Install Log"
          >
            <CardContent sx={{ p: 0 }}>
              <PixelInstallLogsSection
                data={pixelInstallLogs}
              />
            </CardContent>
          </MainCard>
        </Grid>

        <>
          {
            (storeInfo && storeInfo.id) && (
              <Grid item xs={12}>
                <Stack direction="row" justifyContent={`flex-end`}>
                  {
                    (storeInfo.web_pixel_id) ? (
                      <Box>
                        <Button variant="contained" onClick={() => onClickUninstallPixel()} disabled={loading}>Uninstall Pixel</Button>
                      </Box>
                    ) : (
                      <Box>
                        <Button variant="contained" onClick={() => installPixel()} disabled={loading}>Install Pixel</Button>
                      </Box>
                    )
                  }
                </Stack>
              </Grid>
            )
          }
        </>
      </Grid>

      <>
        {
          (showConfirmModal) ? (
            <>
              <ConfirmDialog
                open={showConfirmModal}
                setOpen={setShowConfirmModal}
                title={APP_NAME}
                content={`Auto-pixel will be uninstalled. Are you sure?`}
                textYes={`Agree`}
                textNo={`Cancel`}
                onClickYes={() => onClickYesConfirm()}
                onClickNo={() => onClickNoConfirm()}
              />
            </>
          ) : (
            <></>
          )
        }
      </>
    </>
  )
}

export default AutoInsallSection;
