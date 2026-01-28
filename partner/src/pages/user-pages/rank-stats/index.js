import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';
// assets
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';

import StatsBox from './StatsBox';

const RankStatsPage = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id

  return (
    <PageLayout title="Rank Stats" cardType="">
      <>
        <StatsBox
          showDateOption={true}
          showExportButton={true}
          showProgressBar={true}
        />
      </>
    </PageLayout>
  )
}

export default RankStatsPage;
