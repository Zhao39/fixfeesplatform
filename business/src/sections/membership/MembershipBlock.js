
// material-ui
import { useTheme } from '@mui/material/styles';

const MembershipBlock = (props) => {
  const { membership, setMembership, editable = true, user = {}, license_info = {}, coupon, couponApplied, couponInfo } = props
  const theme = useTheme();

  const couponPlanPrice = 1

  const plans = [];

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
        if(plan.id === 1) { // coupon is applied for only monthly membership
          const type = row.type
          const value = row.value
          if (type === 0) { // day trial coupon type
            amount = 1
          }
          else if (type === 1) { // percent discount coupon type
            amount = Math.floor(amount * value / 100);
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
      
    </>
  )
}

export default MembershipBlock;
