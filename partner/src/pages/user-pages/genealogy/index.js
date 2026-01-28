import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Button, Chip, Grid, Stack } from '@mui/material';
import MainCard from 'components/MainCard';

// assets
import { showToast } from 'utils/utils';
import { get_data_value, get_utc_timestamp_ms, priceFormat } from 'utils/misc';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { apiUserGetProfile } from 'services/userProfileService';
import GenealogyMerchantListTable from './inc/GenealogyMerchantListTable';
import { HeartFilled, RightOutlined, SmileFilled } from '@ant-design/icons';
import LeadPartnerListTable from './inc/LeadPartnerListTable';
import GenealogyPartnerListTable from './inc/GenealogyPartnerListTable';

const TabList = [
  {
    value: "Merchants",
    text: "Merchants"
  },
  {
    value: "Brand_Partners",
    text: "Brand Partners"
  }
]

const LeadListPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);

  const defaultFormData = {}
  const [formData, setFormData] = useState(defaultFormData)
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())
  const [apiLoading, setApiLoading] = useState(false)

  const loadPageData = async () => {
    setApiLoading(true)
    const payload = {}
    const apiRes = await apiUserGetProfile()
    setApiLoading(false)

    if (apiRes['status'] === '1') {
      setFormData(apiRes['data'])
      return true
    } else {
      showToast(apiRes.message, 'error');
      return false
    }
  }

  useEffect(() => {
    loadPageData()
  }, [tableTimestamp])

  const [currentTab, setCurrentTab] = useState(TabList[0]['value'])
  const onClickTab = (tab) => {
    setCurrentTab(tab)
  }

  return (
    <PageLayout title="Genealogy" cardType="MainCard">
      <Grid container spacing={0}>
        <Grid item xs={12} md={12}>
          <Box sx={{ pt: 3, px: 3, width: '100%' }}>
            <Stack direction={`row`} justifyContent={`flex-start`} spacing={2}>
              {
                TabList.map((item, index) => {
                  return (
                    <Button
                      key={index}
                      variant={currentTab === item.value ? 'contained' : 'outlined'}
                      color="primary"
                      endIcon={<RightOutlined />}
                      onClick={() => onClickTab(item.value)}
                      sx={{ borderRadius: '100px', overflow: 'hidden' }}
                    >
                      {item.text}
                    </Button>
                  )
                })
              }
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} md={12}>
          <div style={{ display: currentTab === TabList[0]['value'] ? 'block' : 'none' }}>
            <GenealogyMerchantListTable props={props} />
          </div>
          <div style={{ display: currentTab === TabList[1]['value'] ? 'block' : 'none' }}>
            <GenealogyPartnerListTable props={props} />
          </div>
        </Grid>
      </Grid>
    </PageLayout>
  )
}

export default LeadListPage;
