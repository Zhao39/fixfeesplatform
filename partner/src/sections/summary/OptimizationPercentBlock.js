// material-ui
import { Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import LinearWithLabel from 'components/@extended/Progress/LinearWithLabel';
import MainCard from 'components/MainCard';

// assets
import Target from 'assets/images/analytics/target.svg';

// ==============================|| LABELLED TASKS ||============================== //

function OptimizationPercentBlock() {
  return (
    <Grid item xs={12}>
      <MainCard sx={{ width: '100%' }}>
        <Grid container spacing={1.25}>
          <Grid item xs={12}>
            <Grid item xs={12}>
              <Typography>Optimization 31% Complete</Typography>
            </Grid>
            <Grid item xs={12}>
              <LinearWithLabel value={31} color="primary" />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <List sx={{ p: 0 }}>
              <ListItem sx={{ p: 0 }}>
                <ListItemText
                  secondary="4/13 actions taken"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </MainCard>
    </Grid>
  );
}

export default OptimizationPercentBlock;
