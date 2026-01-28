import PropTypes from 'prop-types';

// material-ui
import { Grid, Skeleton, Typography } from '@mui/material';

// project import
import RoundIconCard from 'components/cards/statistics/RoundIconCard';

const SkeletonCard = (props) => {
  const { type, isLoading } = props

  // const skeletonCard = (
  //   <RoundIconCard
  //     {...props}
  //     title={<Skeleton sx={{ width: { xs: 120, md: 180 } }} />}
  //     secondary={<Skeleton animation="wave" variant="circular" width={24} height={24} />}
  //   >
  //   </RoundIconCard>
  // );

  return (
    <>
      {
        (isLoading) ? (
          <>
            <RoundIconCard
              {...props}
              secondary={<Skeleton animation="wave" variant="circular" width={24} height={24} />}
            >
            </RoundIconCard>
          </>
        ) : (
          <>
            <RoundIconCard
              {...props}
            >
            </RoundIconCard>
          </>
        )
      }
    </>
  );
};
 
export default SkeletonCard;
