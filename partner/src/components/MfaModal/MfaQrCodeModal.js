// material-ui
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Button, CardContent, Divider, Grid, Modal, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { WarningFilled } from '@ant-design/icons';

const MfaQrCodeModal = (props) => {
    const { show, setShow, title = "", pageData, submitModalData } = props
    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (show) {
            setOpen(true)
        }
    }, [show])

    const [apiCalling, setApiCalling] = useState(false)

    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
        setShow(false)
    }
    const onClickSubmit = () => {
        submitModalData()
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false} >
                    <CardContent sx={{ maxWidth: '100%', width: '540px' }}>
                        <Grid container spacing={2} direction="column">
                            <Grid item xs={12} sm={12}>
                                <Alert color="primary" variant="border" icon={false}>
                                    <AlertTitle>
                                        Use your preferred application from App Store or Google
                                        Play and set up an account by scanning the QR code or
                                        entering the key.
                                    </AlertTitle>
                                </Alert>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Stack spacing={1.25}>
                                    <div className="img-wrapper text-center">
                                        <img
                                            className="img-responsive img-qr-code"
                                            style={{
                                                width: "220px",
                                                height: "220px",
                                            }}
                                            src={get_data_value(pageData, "two_fact_qr_code_url")}
                                            alt="QR Code"
                                        />
                                    </div>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Stack direction={`row`} justifyContent={`center`} alignItems={`center`} sx={{ width: '100%' }}>
                                    <Typography color={`textSecondary`} variant="h5" noWrap={true} style={{ whiteSpace: 'break-spaces', wordBreak: 'break-all', textAlign: 'center' }}>
                                        Key: &nbsp;<Typography color={`textPrimary`} variant="h5" component={`span`}>{get_data_value(pageData, "two_fact_secret")}</Typography>
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Alert color="warning" variant="border" icon={<WarningFilled />}>
                                    <AlertTitle >IMPORTANT: Do NOT lose this code! Store it in a safe place!</AlertTitle>
                                </Alert>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                        <Button color="error" size="medium" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="contained" size="medium" type="button" disabled={apiCalling}
                            onClick={() => onClickSubmit()}
                        >
                            Continue
                        </Button>
                    </Stack>
                </MainCard>
            </Modal>
        </>
    );
};

export default MfaQrCodeModal;
