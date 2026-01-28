import { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Grid, MenuItem, FormControl, Select, Button, Box, Typography, Stack } from '@mui/material';

// assets
import { get_data_value, get_utc_timestamp_ms } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from "layout/AdminLayout/PageLayout";
import { WEBSITE_VERSION } from 'config/constants';
import { axiosGet } from 'services/ajaxServices';
import { urlAdminGetFunnelTypeList } from 'services/constants';
import FunnelInfoModal from './inc/FunnelInfoModal';

const FunnelsPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)

  const defaultFormData = {}
  const [formData, setFormData] = useState(defaultFormData)
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  const [apiLoading, setApiLoading] = useState(false)

  const [funnelList, setFunnelList] = useState([]);
  const [currentFunnel, setCurrentFunnel] = useState(null);
  const [showFunnelEditModal, setShowFunnelEditModal] = useState(false)
  const [funnelType, setFunnelType] = useState(1);

  const apiAdminGetFunnelTypeList = async (params = {}) => {
    const url = urlAdminGetFunnelTypeList
    const payload = { ...params }
    const response = await axiosGet(url, payload)
    return response
  }

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = {}
    const apiRes = await apiAdminGetFunnelTypeList(payload)
    setApiLoading(false)
    if (apiRes['status'] === '1') {
      setFunnelList(apiRes['data']['funnelTypeList'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  useEffect(() => {
    loadPageData()
  }, [tableTimestamp])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
  const onClickEditFunnel = (item) => {
    setCurrentFunnel(item)
    setShowFunnelEditModal(true)
  }

  const renderFunnelItem = (item) => {
    return (
      <Grid item container xs={12} md={12} spacing={2}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%', // Ensure it takes full height of the grid item
              textAlign: 'center',
              padding: 1
            }}
          >
            <img src={item.thumbnail} alt={item.alt} style={{ width: '190px', height: '300px', objectFit: 'cover' }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'left',
              paddingLeft: 2,
              //height: '200px', // Ensure it takes full height of the grid item
              textAlign: 'left',
            }}
          >
            <Stack direction={`column`} spacing={1}>
              <Typography variant="subtitle1">Funnel Description:</Typography>
              <Typography variant="body1">{item.description}</Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%', // Ensure it takes full height of the grid item
            }}
          >
            <Button variant="outlined" type="button" onClick={() => onClickEditFunnel(item)}>
              Edit
            </Button>
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <PageLayout title="Funnels" cardType="MainCard">
      <Box sx={{ p: 2 }}>
        <Grid container>
          <Grid item xs={12} md={12}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={funnelType}
                onChange={(event) => setFunnelType(event.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value={1}>Merchant Recruiting Videos</MenuItem>
                <MenuItem value={2}>Brand Partner Recruiting Funnels</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item container xs={12} md={12} spacing={3}>
            {funnelType === 1 && (
              <>
                {
                  funnelList.filter((item) => item.type === 'business').map((item) => (
                    <Fragment key={item.id}>
                      {
                        renderFunnelItem(item)
                      }
                    </Fragment>
                  ))
                }
              </>
            )}
            {funnelType === 2 && (
              <>
                {
                  funnelList.filter((item) => item.type === 'partner').map((item) => (
                    <Fragment key={item.id}>
                      {
                        renderFunnelItem(item)
                      }
                    </Fragment>
                  ))
                }
              </>
            )}
          </Grid>
        </Grid>
      </Box>
      {
        (showFunnelEditModal) && (
          <>
            <FunnelInfoModal
              show={showFunnelEditModal}
              setShow={setShowFunnelEditModal}
              title="Edit funnel description"
              info={currentFunnel}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
            />
          </>
        )
      }
    </PageLayout>
  )
};

export default FunnelsPage;
