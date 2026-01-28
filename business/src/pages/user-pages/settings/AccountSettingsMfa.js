import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
    Chip,
    Alert
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

import MainCard from 'components/MainCard';

// assets
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';
import { apiUserGetProfile, apiUserUpdateProfile } from 'services/userProfileService';
import { useEffect, useState } from 'react';
import { updateAuthProfile } from 'store/reducers/auth';
import PageLayout from 'layout/UserLayout/PageLayout';
import AccountInfoTab from './inc/AccountInfoTab';
import { Fragment } from 'react';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';

import idCardFrontplaceholderImg from 'assets/images/kyc/id_card_front_placeholder.png';
import idCardBackPlaceholderImg from 'assets/images/kyc/id_card_back_placeholder.png';
import passportPlaceholderImg from 'assets/images/kyc/passport_placeholder.png';
import { apiUserGetKycDetail, apiUserSubmitKyc } from 'services/userKycService';
import { APP_NAME, CARD_TYPE_LIST, KYC_STATUS } from 'config/constants';
import { apiUserCancelVerification, apiUserCompleteVerification, apiUserGetVerificationDetail } from 'services/userVerificationService';
import MfaQrCodeModal from 'components/MfaModal/MfaQrCodeModal';
import MfaCodeInputModal from 'components/MfaModal/MfaCodeInputModal';
import ConfirmDialog from 'components/ConfirmDialog/ConfirmDialog';

const AccountSettingsMfa = (props) => {
    const dispatch = useDispatch();
    const userDataStore = useSelector((x) => x.auth);
    const user = userDataStore?.user

    //console.log(`user:::`, user)
    const [apiCalling, setApiCalling] = useState(false)
    const [userInfo, setUserInfo] = useState(user)

    const getPageDetail = async () => {
        setApiCalling(true)
        const apiRes = await apiUserGetProfile()
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            setUserInfo(apiRes['data']['user'])
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }

    useEffect(() => {
        getPageDetail()
    }, [])

    const [verificationData, setVerificationData] = useState({});
    const [showMfaQrCodeModal, setShowMfaQrCodeModal] = useState(false);

    const onClickAuthenticator = async () => {
        setApiCalling(true)
        const apiRes = await apiUserGetVerificationDetail()
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            setUserInfo(apiRes['data']['user'])
            setVerificationData(apiRes['data'])
            setShowMfaQrCodeModal(true)
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }
    const [showMfaCodeInputModal, setShowMfaCodeInputModal] = useState(false);
    const submitMfaQrCodeModalData = () => {
        setShowMfaQrCodeModal(false)
        setShowMfaCodeInputModal(true)
    }
    const submitMfaCodeInputModalData = async (code) => {
        const payload = {
            secret: verificationData['two_fact_secret'],
            otp: code
        }
        setApiCalling(true)
        const apiRes = await apiUserCompleteVerification(payload)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            setUserInfo(apiRes['data']['user'])
            showToast("Two-Factor Authentication has been set!", "success")
            setShowMfaCodeInputModal(false)
            //getPageDetail()
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }

    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const [confirmAction, setConfirmAction] = useState("")
  
    const onClickYesConfirm = () => {
      if (confirmAction === "cancel_2fa") {
        cancelMfa()
      }
    }
  
    const onClickNoConfirm = () => {
      setShowConfirmModal(false)
    }

    const onClickCancelAuthenticator = async () => {
        setConfirmText(`Are you sure you want to cancel 2FA?`)
        setConfirmAction("cancel_2fa")
        setShowConfirmModal(true)
    }
    const cancelMfa = async () => {
        setApiCalling(true)
        const apiRes = await apiUserCancelVerification()
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            setUserInfo(apiRes['data']['user'])
            showToast("Two-Factor Authentication has been cancelled!", "success")
            setShowConfirmModal(false)
            //getPageDetail()
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }
    return (
        <>
            <Box sx={{ px: 2.5, pb: 2.5 }}>
                <Grid container spacing={2}>
                    <Grid item container xs={12} spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ width: '100%' }}>
                                <Alert color="primary" icon={false} sx={{ width: '100%', justifyContent: 'center' }}>
                                    <Typography variant="h5" align="center" color="primary" sx={{ py: 1 }}>Two factor authentication gives your account the HIGHEST level of protection.</Typography>
                                </Alert>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ px: 2.5, py: 2 }}>
                                {
                                    (userInfo['mfa_status'] === 3) ? (
                                        <>
                                            <Button color="error" variant="contained" size="large" type="button" disabled={apiCalling}
                                                onClick={(e) => {
                                                    onClickCancelAuthenticator();
                                                }}
                                            >
                                                Cancel 2FA!
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button color="primary" variant="contained" size="large" type="button" disabled={apiCalling}
                                                onClick={(e) => {
                                                    onClickAuthenticator();
                                                }}
                                            >
                                                Enable Now!
                                            </Button>
                                        </>
                                    )
                                }
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            {
                (showMfaQrCodeModal) && (
                    <>
                        <MfaQrCodeModal
                            show={showMfaQrCodeModal}
                            setShow={setShowMfaQrCodeModal}
                            title="Configure Two-Step Verification"
                            pageData={verificationData}
                            submitModalData={() => submitMfaQrCodeModalData()}
                        />
                    </>
                )
            }

            {
                (showMfaCodeInputModal) && (
                    <>
                        <MfaCodeInputModal
                            show={showMfaCodeInputModal}
                            setShow={setShowMfaCodeInputModal}
                            title="Two-Step Verification"
                            pageData={verificationData}
                            submitModalData={(v) => submitMfaCodeInputModalData(v)}
                            apiCalling={apiCalling}
                            setApiCalling={setApiCalling}
                        />
                    </>
                )
            }

            {
                (showConfirmModal) ? (
                    <>
                        <ConfirmDialog
                            open={showConfirmModal}
                            setOpen={setShowConfirmModal}
                            title={APP_NAME}
                            content={confirmText}
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

        </>
    )
}

export default AccountSettingsMfa;
