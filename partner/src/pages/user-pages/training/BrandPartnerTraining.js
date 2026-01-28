import { useEffect, useState } from 'react';
import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';

// material-ui
import { Box, Divider, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';

// assets
import { useSelector } from 'react-redux';
import TrainingPageContainer from './TrainingPageContainer';
import { TRAINING_TYPE } from 'config/constants';

const BrandPartnerTraining = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  const settingPersistDataStore = useSelector((x) => x.settingPersist);

  useEffect(() => {

  }, [])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <TrainingPageContainer pageTitle="Brand Partner Trainings" trainingType={TRAINING_TYPE.BRAND_PARTNER}>

    </TrainingPageContainer>
  )
}

export default BrandPartnerTraining;
