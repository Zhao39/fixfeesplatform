// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, ButtonGroup, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import ManualInsallSection from './manualInsallSection';
import AutoInsallSection from './autoInsallSection';
import { get_data_value } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import ConfirmDialog from 'components/ConfirmDialog/ConfirmDialog';
import { APP_NAME } from 'config/constants';

const InstallMethodList = [
  {
    name: 'auto',
    label: 'Auto Install'
  },
  {
    name: 'custom',
    label: 'Manual Install'
  }
]
const PixelSettings = () => {
  const theme = useTheme();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const defaultInstallMethod = ""
  const [installMethod, setInstallMethod] = useState(defaultInstallMethod)
  const onClickInstallMethod = async (item) => {
    if (item.name === installMethod) {
      console.log("already set!")
      return false
    }

    if (item.name === "custom") {
      if (storeInfo['web_pixel_id']) {
        setShowConfirmModal(true)
        return true
      }
    }
    const install_method = item.name
    setInstallMethod(install_method)
  }

  const [loading, setLoading] = useState(true)
  const [pageData, setPageData] = useState({})
  const [storeInfo, setStoreInfo] = useState({})
  const [pixelInstallLogs, setPixelInstallLogs] = useState([])

  const loadPageData = async () => {
     
  }

  useEffect(() => {
    loadPageData()
  }, [currentStoreId, currentStoreUpdateTimestamp])


  const changePixelInstallMode = async (pixel_install_mode) => {
    
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const onClickYesConfirm = () => {
    changePixelInstallMode("custom")
  }
  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  return (
    <PageLayout title="Pixel Installation" cardType="">
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3}>
          <Grid item container xs={12} spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ButtonGroup aria-label="outlined primary button group">
                  {
                    InstallMethodList.map((item, index) => {
                      return (
                        <Button variant={installMethod === item.name ? "contained" : "outlined"} key={item.name} disabled={loading} onClick={() => onClickInstallMethod(item)}>{item.label}</Button>
                      )
                    })
                  }
                </ButtonGroup>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className="main-section">
                {
                  (installMethod === 'auto') ? (
                    <>
                      <AutoInsallSection
                        pageData={pageData}
                        storeInfo={storeInfo}
                        setStoreInfo={setStoreInfo}
                        pixelInstallLogs={pixelInstallLogs}
                        setPixelInstallLogs={setPixelInstallLogs}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </>
                  ) : (installMethod === 'custom') ? (
                    <>
                      <ManualInsallSection
                        pageData={pageData}
                        storeInfo={storeInfo}
                        setStoreInfo={setStoreInfo}
                        pixelInstallLogs={pixelInstallLogs}
                        setPixelInstallLogs={setPixelInstallLogs}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </>
                  ) : (
                    <></>
                  )
                }
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

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

    </PageLayout>

  )
};

export default PixelSettings;
