// material-ui
import { Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';
import {
  AimOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ContactsOutlined,
  DownloadOutlined,
  EyeOutlined,
  FacebookOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  FieldTimeOutlined,
  LinkedinOutlined,
  RedditOutlined,
  TwitterOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';
import MarketingCardChart from 'sections/dashboard/analytics/MarketingCardChart';
// ==============================|| PixelChatBlock ||============================== //

function PixelChatBlock() {
  return (
    <Grid container item xs={12} spacing={3}>
      <Grid container item xs={12} sm={6} md={6} spacing={3}>
        <Grid item xs={12} >
          <Typography variant="h4" sx={{ mt: 3 }}>Channel Overlap</Typography>
        </Grid>
        <Grid item xs={12} >
          <AnalyticsDataCard title="Channel Overlap" count="$1,12,083" percentage={70.5}>
            <MarketingCardChart />
          </AnalyticsDataCard>
        </Grid>
      </Grid>
      <Grid container item xs={12} sm={6} md={6} spacing={3}>
        <Grid item xs={12} >
          <Typography variant="h4" sx={{ mt: 3 }}>Live Orders</Typography>
        </Grid>
        <Grid item xs={12}>
          <AnalyticsDataCard title="Live Orders" count="$1,12,083" percentage={70.5}>
            <MarketingCardChart />
          </AnalyticsDataCard>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PixelChatBlock;
