// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, InputLabel, Modal, OutlinedInput, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { apiAdminUpdateUserInfo } from 'services/adminService';

const AddCouponModal = (props) => {
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
            setFormData(info)
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

    }
    const [formData, setFormData] = useState(defaultFormData);
    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const form_data = { ...formData }
        const payload = {
            id: form_data.id,
            first_name: form_data.first_name,
            last_name: form_data.last_name,
            phone: form_data.phone,
            balance: form_data.balance,
        }
        setApiCalling(true)
        const apiRes = await apiAdminUpdateUserInfo(payload)
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
                                        <InputLabel htmlFor="name">Username</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="name"
                                            value={formData.name}
                                            name="name"
                                            onChange={(e) => handleChangeText(e, "name")}
                                            placeholder="Enter Name"
                                            inputProps={{
                                                type: 'text',
                                                readOnly: true
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="first_name">First Name</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="first_name"
                                            value={formData.first_name}
                                            name="first_name"
                                            onChange={(e) => handleChangeText(e, "first_name")}
                                            placeholder="Enter First Name"
                                            inputProps={{
                                                type: 'text'
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="last_name">Last Name</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="last_name"
                                            value={formData.last_name}
                                            name="last_name"
                                            onChange={(e) => handleChangeText(e, "last_name")}
                                            placeholder="Enter Last Name"
                                            inputProps={{
                                                type: 'text'
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="email">Email</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="email"
                                            value={formData.email}
                                            name="email"
                                            onChange={(e) => handleChangeText(e, "email")}
                                            placeholder="Enter Email"
                                            inputProps={{
                                                type: 'email',
                                                readOnly: true
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="phone">Phone number</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="phone"
                                            value={formData.phone}
                                            name="phone"
                                            onChange={(e) => handleChangeText(e, "phone")}
                                            placeholder="Enter Phone"
                                            inputProps={{
                                                type: 'tel',
                                                //readOnly: true
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="balance">Wallet</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="balance"
                                            value={formData.balance}
                                            name="balance"
                                            onChange={(e) => handleChangeText(e, "balance")}
                                            placeholder="Enter balance"
                                            inputProps={{
                                                type: 'number',
                                                min: 0,
                                                step: 0.01
                                            }}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
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

export default AddCouponModal;
