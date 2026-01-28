// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, InputLabel, Modal, OutlinedInput, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { apiAdminUpdateUserInfo } from 'services/adminService';

const UserInfoModal = (props) => {
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
            upload_require_name: form_data.upload_require_name,
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
                                        <InputLabel htmlFor="name">MID</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="mid"
                                            value={formData.mid}
                                            name="mid"
                                            onChange={(e) => handleChangeText(e, "mid")}
                                            placeholder="Enter MID"
                                            inputProps={{
                                                type: 'number',
                                                readOnly: true
                                            }}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="business_legal_name">Business Legal Name</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="business_legal_name"
                                            value={formData.business_legal_name}
                                            name="business_legal_name"
                                            onChange={(e) => handleChangeText(e, "business_legal_name")}
                                            placeholder="Enter business legal name"
                                            inputProps={{
                                                type: 'text',
                                                readOnly: true
                                            }}
                                        />
                                    </Stack>
                                </Grid>
                            
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="email">Email</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="business_email"
                                            value={formData.business_email}
                                            name="business_email"
                                            onChange={(e) => handleChangeText(e, "business_email")}
                                            placeholder="Enter Email"
                                            inputProps={{
                                                type: 'email',
                                                readOnly: true
                                            }}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="business_phone">Phone number</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="business_phone"
                                            value={formData.business_phone}
                                            name="business_phone"
                                            onChange={(e) => handleChangeText(e, "business_phone")}
                                            placeholder="Enter Phone"
                                            inputProps={{
                                                type: 'tel',
                                                readOnly: true
                                            }}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="email">Upload requirement name</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="upload_require_name"
                                            value={formData.upload_require_name}
                                            name="upload_require_name"
                                            onChange={(e) => handleChangeText(e, "upload_require_name")}
                                            placeholder="Enter Upload requirement name"
                                            inputProps={{
                                                type: 'text',
                                            }}
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

export default UserInfoModal;
