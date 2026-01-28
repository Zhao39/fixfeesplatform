import PropTypes from 'prop-types';

// material-ui
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

// ===========================|| HOVER SOCIAL CARD ||=========================== //

const HoverSocialCard = ({ primary, secondary, iconPrimary, color }) => {
  const IconPrimary = iconPrimary;
  const primaryIcon = iconPrimary ? <IconPrimary /> : null;

  return (
    <Card
      elevation={0}
      sx={{
        background: color,
        position: 'relative',
        color: '#fff',
        '&:hover svg': {
          opacity: 1,
          transform: 'scale(1.1)'
        }
      }}
    >
      <CardContent>
        <Box
          sx={{
            position: 'absolute',
            right: 15,
            top: 17,
            color: '#fff',
            '& svg': {
              width: 36,
              height: 36,
              opacity: 0.5,
              transition: 'all .3s ease-in-out'
            }
          }}
        >
          {primaryIcon}
        </Box>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="h3" color="inherit" sx={{mb:1}}>
              {secondary}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              {primary}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

HoverSocialCard.propTypes = {
  primary: PropTypes.any,
  secondary: PropTypes.node,
  iconPrimary: PropTypes.any,
  color: PropTypes.string
};

export default HoverSocialCard;
