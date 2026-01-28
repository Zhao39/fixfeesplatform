import { Fragment } from 'react';

// material-ui
import { Button, Grid, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';

// assets
import { CheckOutlined } from '@ant-design/icons';
import { priceFormat } from 'utils/misc';
import { MEMBERSHIP_PLANS } from 'config/constants';

// ==============================|| TAB - SETTINGS ||============================== //

const MembershipBlock = (props) => {
  const { membership, setMembership, editable = true, user = {}, license_info = {}, coupon, couponApplied, couponInfo } = props
  const theme = useTheme();

  const couponPlanPrice = 1

  const plans = [...MEMBERSHIP_PLANS];

  const onClickSelectMembership = (i) => {
    if (editable) {
      setMembership(i)
    } else {
      return false;
    }
  }

  const getCouponAppliedPrice = (row, amount, plan) => {
    try {
      amount = Number(amount)
      if (row) {
        if (plan.id === 1) { // coupon is applied for only monthly membership
          const type = row.type
          const value = row.value
          if (type === 0) { // day trial coupon type
            amount = 1
          }
          else if (type === 1) { // percent discount coupon type
            amount = Math.floor(amount * value / 100);
          }
          else if (type === 2) { // 100% discount forever
            amount = 0
          }
        }
      }
      return amount
    } catch (e) {
      console.log('getCouponAppliedPrice error:::', e)
    }
    return amount
  }

  return (
    <>
      <Grid container spacing={3} justifyContent={`center`}>
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MainCard sx={{ pt: 1.75, backgroundColor: theme.palette.mode === 'dark' ? "#292929" : null }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} textAlign="center">
                    {plan.icon}
                    <Typography variant="h4">{plan.title}</Typography>
                  </Stack>
                </Grid>
                {/* <Grid item xs={12}>
                      <Typography>{plan.description}</Typography>
                    </Grid> */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="flex-end">
                    <Typography variant="h2">{priceFormat(couponApplied ? getCouponAppliedPrice(couponInfo, plan.price, plan) : plan.price, '$')} <Typography variant="subtitle1" component="span">/ {plan.period}</Typography></Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  {
                    (license_info?.membership === plan['id']) ? (
                      <Button color="warning" variant="dashed" fullWidth onClick={() => onClickSelectMembership(plan['id'])}>
                        Active
                      </Button>
                    ) : (
                      <Button variant={membership === plan['id'] ? `contained` : `outlined`} fullWidth onClick={() => onClickSelectMembership(plan['id'])}>
                        Select
                      </Button>
                    )
                  }
                </Grid>
                <Grid item xs={12}>
                  <List
                    sx={{
                      m: 0,
                      p: 0,
                      '&> li': {
                        px: 0,
                        py: 0.625,
                        '& svg': {
                          fill: theme.palette.primary.main
                        }
                      }
                    }}
                    component="ul"
                  >
                    {plan.featureList.map((list, i) => (
                      <Fragment key={i}>
                        <ListItem divider>
                          <ListItemIcon>
                            <CheckOutlined />
                          </ListItemIcon>
                          <ListItemText primary={list} />
                        </ListItem>
                      </Fragment>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default MembershipBlock;
