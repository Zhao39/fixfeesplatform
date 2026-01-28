// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, Modal, Stack, Typography } from '@mui/material';

// assets
import { useEffect, useState } from 'react';
import { console_log, get_data_value, get_utc_timestamp_ms } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { RECAPTCHA_ENABLED } from 'config/constants';
import CaptchaBox, { RECAPTCHA_DEFAULT_VALUE } from 'components/CaptchaBox/CaptchaBox';
import { getSettingPersist, setSettingPersist } from 'utils/utils';


const AuthCaptchaModal = (props) => {
    const { title, open = false, setOpen, handleConfirmCaptcha } = props

    const theme = useTheme();
    const dispatch = useDispatch()
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    ///////////// start recaptcha part //////////////////////////////////////////////////////////////////////////
    const captchaKey = 'captcha_register_send_email'
    const [recaptcha, setRecaptcha] = useState(RECAPTCHA_ENABLED === "false" ? RECAPTCHA_DEFAULT_VALUE : "");
    const [captchaTimestamp, setCaptchaTimestamp] = useState(get_utc_timestamp_ms());
    const updateCaptchaSettingEnabled = (value) => {
        const oldValue = getSettingPersist(captchaKey)
        if (oldValue !== value) { // refresh every attempt
            setSettingPersist(captchaKey, value)
            setCaptchaTimestamp(get_utc_timestamp_ms())
        }
    }
    ///////////// end recaptcha part //////////////////////////////////////////////////////////////////////////

    const handleConfirmModal = () => {
        handleConfirmCaptcha()
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false} >
                    <CardContent sx={{ maxWidth: '100%', width: '440px' }}>
                        <Grid container spacing={2} direction="column">
                            {
                                (RECAPTCHA_ENABLED === "true") && (
                                    <Grid item>
                                        <CaptchaBox
                                            recaptcha={recaptcha}
                                            setRecaptcha={setRecaptcha}
                                            captchaKey={captchaKey}
                                            captchaTimestamp={captchaTimestamp}
                                        />
                                    </Grid>
                                )
                            }
                        </Grid>
                    </CardContent>

                    <Divider />

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                        <Button color="primary" size="medium" onClick={handleConfirmModal} disabled={!recaptcha}>
                            Confirm
                        </Button>
                        <Button color="secondary" size="medium" onClick={handleClose}>
                            Close
                        </Button>
                    </Stack>
                </MainCard>
            </Modal>
        </>
    );
};

export default AuthCaptchaModal;
