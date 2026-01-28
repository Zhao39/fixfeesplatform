// material-ui
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Button, CardContent, Divider, Grid, InputLabel, Modal, OutlinedInput, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_utc_timestamp_ms, priceFormat, ValidEmail } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { apiAdminUpdateUserInfo } from 'services/adminService';
import { WarningFilled } from '@ant-design/icons';
import { WITHDRAWAL_MIN_AMOUNT } from 'config/constants';
import { apiUserRequestWithdrawal } from 'services/userWalletService';

const WithdrawalModal = (props) => {
    const { show, setShow, title = "", info, tableTimestamp, setTableTimestamp } = props
    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (show) {
            setFormData({ ...formData, payout_amount: info?.balance })
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

    const defaultFormData = {
        payout_amount: 0,
        paypal_address: "",
        paypal_address_c: ""
    }
    const [formData, setFormData] = useState(defaultFormData);
    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const validateForm = () => {
        let isValid = true
        const form_data = { ...formData }

        const payout_amount = Number(form_data.payout_amount)
        const balance = Number(info.balance)
        if (payout_amount < WITHDRAWAL_MIN_AMOUNT) {
            showToast("Minimum withdrawal amount is " + priceFormat(WITHDRAWAL_MIN_AMOUNT, '$'), "error")
            return false;
        }
        if (payout_amount > balance) {
            showToast("The requested amount can not be greater than your available funds.", "error")
            isValid = false
        }

        // if (!ValidEmail(form_data.paypal_address)) {
        //     showToast("Invalid paypal email", "error")
        //     isValid = false
        // }
        // if (!ValidEmail(form_data.paypal_address_c)) {
        //     showToast("Invalid confirm paypal email", "error")
        //     isValid = false
        // }
        // if (form_data.paypal_address !== form_data.paypal_address) {
        //     showToast("Paypal email not matched", "error")
        //     isValid = false
        // }
        return isValid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const isValid = validateForm()
        if (!isValid) {
            return false
        }

        const form_data = { ...formData }
        const payload = {
            payout_amount: form_data.payout_amount
        }
        setApiCalling(true)
        const apiRes = await apiUserRequestWithdrawal(payload)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            setTableTimestamp(get_utc_timestamp_ms())
            showToast(apiRes.message, 'success');
            handleClose()
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false} >
                    <form onSubmit={handleSubmit}>
                        <CardContent sx={{ maxWidth: '100%', width: '600px' }}>
                            <Grid container spacing={3} direction="column">
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="payout_amount">Withdrawal Amount</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="payout_amount"
                                            value={formData.payout_amount}
                                            name="payout_amount"
                                            onChange={(e) => handleChangeText(e, "payout_amount")}
                                            placeholder="Enter withdrawal amount"
                                            inputProps={{
                                                type: 'number',
                                                min: 0,
                                                step: 0.01
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                {/* <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="paypal_address">Your Email</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="paypal_address"
                                            value={formData.paypal_address}
                                            name="paypal_address"
                                            onChange={(e) => handleChangeText(e, "paypal_address")}
                                            placeholder="Enter Email"
                                            inputProps={{
                                                type: 'email'
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="paypal_address">Confirm Your Email</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="paypal_address_c"
                                            value={formData.paypal_address_c}
                                            name="paypal_address_c"
                                            onChange={(e) => handleChangeText(e, "paypal_address_c")}
                                            placeholder="Enter Email"
                                            inputProps={{
                                                type: 'email'
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid> 
                                <Grid item xs={12} sm={12}>
                                    <Alert color="warning" variant="border" icon={<WarningFilled />}>
                                        <AlertTitle > Please make sure you provide us with the correct email address so your funds can arrive as soon as possible.</AlertTitle>
                                    </Alert>
                                </Grid> */}
                            </Grid>
                        </CardContent>
                        <Divider />
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="error" size="medium" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" size="medium" type="submit" disabled={apiCalling}>
                                Submit
                            </Button>
                        </Stack>
                    </form>
                </MainCard>
            </Modal>
        </>
    );
};

export default WithdrawalModal;
