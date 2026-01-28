import { Fragment, useEffect, useState } from 'react';

// material-ui
import { Alert, Box, Button, Divider, Grid, List, ListItem, ListItemIcon, ListItemText, Stack, Switch, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';

// assets
import { CheckOutlined, FileDoneOutlined, MailOutlined, TranslationOutlined } from '@ant-design/icons';
import { APP_NAME } from 'config/constants';
import { console_log, empty, getPlanInfo, get_utc_timestamp, priceFormat } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MembershipBlock from 'sections/membership/MembershipBlock';
import { showToast } from 'utils/utils';
import { updateAuthProfile, updateProfileTimestamp } from 'store/reducers/auth';
import { apiGetUserMembershipDetail, apiUserBillMembership, apiUserCancelMembership, apiUserCheckBillMembershipRequired, apiUserRecoverMembership, apiUserUpdateMembership } from 'services/userProfileService';
import PageLayout from 'layout/UserLayout/PageLayout';
import ConfirmDialog from 'components/ConfirmDialog/ConfirmDialog';
import BillingFormModal from 'components/BillingForm/BillingFormModal';
import CouponBlock from 'sections/coupon/CouponBlock';

// ==============================|| TAB - membership ||============================== //

const TabMembership = () => {
  const theme = useTheme();
  const dispatch = useDispatch()

  const userDataStore = useSelector((x) => x.auth);
  const { isLoggedIn, token, user } = userDataStore

  const defaultFromData = {
    user_info: user,
    license_info: user?.license_info,
    membership: user?.license_info?.membership,
    coupon: "",
    submit: null
  }
  const [formData, setFormData] = useState(defaultFromData)
  const [apiLoading, setApiLoading] = useState(false)

  const updateUserFormData = (userInfo) => {
    const license_info = userInfo?.license_info
    const form_data = { ...formData }
    form_data['user_info'] = userInfo
    form_data['license_info'] = license_info
    form_data['membership'] = license_info?.membership
    setFormData(form_data)
    dispatch(updateProfileTimestamp())
  }

  const getPageData = async () => {
    const apiRes = await apiGetUserMembershipDetail()
    if (apiRes['status'] === '1') {
      const userInfo = apiRes['data']['user']
      updateUserFormData(userInfo)
    }
  }

  useEffect(() => {
    getPageData()
  }, []);

  const curTimestamp = get_utc_timestamp()

  const planInfo = getPlanInfo(formData?.license_info?.membership)
  const [selectedPlan, setSelectedPlan] = useState(planInfo)

  const onClickSelectMembership = (i) => {
    setFormData({
      ...formData,
      membership: i
    })

    const plan_info = getPlanInfo(i)
    setSelectedPlan(plan_info)
  }

  const onClickCancel = () => {
    setFormData(defaultFromData)
  }

  const onClickSave = () => {
    onSubmitFormData()
  }

  const [openBillingModal, setOpenBillingModal] = useState(false)
  const showBillingMembershipModal = () => {
    console.log(`showBillingMembershipModal::::::::::`, planInfo)
    setOpenBillingModal(true)
  }

  const submitBillingData = async (values) => {
    //console.log(`submitBillingData, values::::::::::`, values)
    const payload = {
      ...values,
      membership: formData?.membership,
      coupon: formData?.coupon
    }
    setApiLoading(true)
    const apiRes = await apiUserBillMembership(payload)
    setApiLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      showToast("Membership has been updated successfully", 'success');
      getPageData()
    } else {
      showToast(apiRes.message, 'error');
    }
    setOpenBillingModal(false)
  }

  const callUpdateMembership = async () => {
    const values = { ...formData }
    console_log("values::::", values);
    const payload = {
      membership: formData?.membership
    }
    setApiLoading(true)
    const apiRes = await apiUserUpdateMembership(payload)
    setApiLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      showToast("Membership has been updated successfully", 'success');
      getPageData()
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const onSubmitFormData = async () => {
    const values = { ...formData }
    console_log("values::::", values);
    if (empty(values?.membership)) {
      showToast("Please choose membership", "error")
      return false
    }

    setApiLoading(true)
    const payload = {
      membership: values?.membership
    }
    const apiRes = await apiUserCheckBillMembershipRequired(payload)
    setApiLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      if (apiRes['data']['bill_required']) {
        showBillingMembershipModal()
      } else {
        await callUpdateMembership()
      }
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const onClickCancelMembership = () => {
    setShowConfirmModal(true)
  }

  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const onClickYesConfirm = () => {
    onSubmitCancelMembership()
  }

  const onSubmitCancelMembership = async () => {
    const values = {}
    setApiLoading(true)
    const apiRes = await apiUserCancelMembership(values)
    setApiLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      showToast("Membership has been cencelled successfully", 'success');
      getPageData()
    } else {
      showToast(apiRes.message, 'error');
    }
    setShowConfirmModal(false)
  }

  const onClickRecoverMembership = async () => {
    const values = {}
    setApiLoading(true)
    const apiRes = await apiUserRecoverMembership(values)
    setApiLoading(false)
    console_log("apiRes::::", apiRes);
    if (apiRes['status'] === '1') {
      showToast("Your membership has been recovered successfully", 'success');
      getPageData()
    } else {
      showToast(apiRes.message, 'error');
    }
  }

  const onClickSetCoupon = (i) => {
    setFormData({
      ...formData,
      coupon: i
    })
  }

  const onClickSetCouponApplied = (i) => {
    setFormData({
      ...formData,
      couponApplied: i
    })
  }

  const [couponInfo, setCouponInfo] = useState(null)

  return (
    <PageLayout title="" cardType="">
      <MainCard title="Membership">
        <Grid container spacing={4}>
          {
            (planInfo) && (
              <Grid item xs={12}>
                <Alert
                  variant="border"
                  color="primary"
                >
                  {
                    (formData?.license_info?.is_cancelled === 1) ? (
                      <>
                        {
                          (formData?.license_info?.license_remain_days > 0) ? (
                            <span>{`You're currently using the ${planInfo.title} Package, but you have already cancelled (${formData?.license_info?.license_remain_days} day${formData?.license_info?.license_remain_days > 1 ? 's' : ''} left).`}</span>
                          ) : (
                            <span>{`You're currently using the ${planInfo.title} Package, but you have already cancelled`}</span>
                          )
                        }
                      </>
                    ) : (
                      <span>{`You're currently using the ${planInfo.title} Package`}</span>
                    )
                  }
                </Alert>

                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                  {
                    (formData?.license_info?.is_cancelled === 1) ? (
                      <Button variant="contained" size="medium" onClick={() => onClickRecoverMembership()} >Recover Membership</Button>
                    ) : (
                      <Button variant="contained" size="medium" onClick={() => onClickCancelMembership()} >Cancel Membership</Button>
                    )
                  }
                </Stack>
              </Grid>
            )
          }

          <Grid item xs={12}>
            <MembershipBlock
              membership={formData['membership']}
              setMembership={(i) => onClickSelectMembership(i)}
              editable={true}
              user={formData['user_info']}
              license_info={formData?.license_info}
              coupon={formData?.coupon}
              couponApplied={formData['couponApplied']}
              couponInfo={couponInfo}
            />
          </Grid>

          {
            (empty(formData?.license_info) && formData['membership'] === 1) && (
              <Grid item xs={12}>
                <CouponBlock
                  coupon={formData?.coupon}
                  setCoupon={(i) => onClickSetCoupon(i)}
                  couponApplied={formData['couponApplied']}
                  setCouponApplied={(i) => onClickSetCouponApplied(i)}
                  couponInfo={couponInfo}
                  setCouponInfo={setCouponInfo}
                />
              </Grid>
            )
          }

        </Grid>

        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 4.5 }}>
          <Button variant="outlined" color="secondary" onClick={() => onClickCancel()}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => onClickSave()}>Submit</Button>
        </Stack>
      </MainCard>

      {
        (showConfirmModal) ? (
          <>
            <ConfirmDialog
              open={showConfirmModal}
              setOpen={setShowConfirmModal}
              title={APP_NAME}
              content={`Are you sure you want to cancel membership?`}
              textYes={`Yes`}
              textNo={`No`}
              onClickYes={() => onClickYesConfirm()}
              onClickNo={() => onClickNoConfirm()}
            />
          </>
        ) : (
          <></>
        )
      }

      {
        (openBillingModal) ? (
          <>
            <BillingFormModal
              open={openBillingModal}
              setOpen={setOpenBillingModal}
              title={`Confirm Purchase`}
              submitBillingData={(values) => submitBillingData(values)}
              sourcePage={`profile_membership`}
              amount={selectedPlan?.price}
            />
          </>
        ) : (
          <></>
        )
      }

    </PageLayout>
  );
};

export default TabMembership;
