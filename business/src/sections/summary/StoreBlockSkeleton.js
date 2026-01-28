import PropTypes, { bool } from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';

// ===============================|| COMPONENT - SKELETON ||=============================== //

const StoreBlockSkeleton = ({ children, isLoading }) => {
  //const [isLoading, setLoading] = useState(true);
  // useEffect(() => {
  //   setLoading(false);
  // }, []);

  const skeletonCard = (
    <RoundIconCard
      title={<Skeleton sx={{ width: { xs: 120, md: 180 } }} />}
      secondary={<Skeleton animation="wave" variant="circular" width={24} height={24} />}
    >
    </RoundIconCard>
  );

  return (
    <>
      {isLoading && (
        <>
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={12} >
              <Typography variant="h4" sx={{ mt: 3 }}>Store</Typography>
            </Grid>

            <Grid container item xs={12} spacing={3}>
              <Grid item xs={12} lg={4} sm={6}>
                {skeletonCard}
              </Grid>
              <Grid item xs={12} lg={4} sm={6}>
                {skeletonCard}
              </Grid>
              <Grid item xs={12} lg={4} sm={6}>
                {skeletonCard}
              </Grid>

            </Grid>
          </Grid>
        </>
      )}
      {!isLoading && children}
    </>
  );
};

StoreBlockSkeleton.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool
};

export default StoreBlockSkeleton;
