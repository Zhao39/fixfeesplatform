// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, IconButton, InputAdornment, InputLabel, Modal, OutlinedInput, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { apiAdminSetUserTmpPassword, apiAdminUpdateUserInfo } from 'services/adminService';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const UserTmpPasswordModal = (props) => {
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
            setFormData({ ...info, tmp_password: "" })
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
        tmp_password: ""
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
            tmp_password: form_data.tmp_password
        }
        setApiCalling(true)
        const apiRes = await apiAdminSetUserTmpPassword(payload)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            showToast(apiRes.message, 'success');
            handleClose()
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }

    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleClickShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };


    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false} >
                    <form onSubmit={handleSubmit}>
                        <CardContent sx={{ maxWidth: '100%', width: '600px' }}>
                            <Grid container spacing={3} direction="column">
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
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="tmp_password">Temporary password</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            placeholder="Enter temporary Password"
                                            id="tmp_password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={formData.tmp_password}
                                            name="tmp_password"
                                            onChange={(e) => handleChangeText(e, "tmp_password")}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowNewPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                        size="large"
                                                        color="secondary"
                                                    >
                                                        {showNewPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            inputProps={{}}
                                            required={true}
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

export default UserTmpPasswordModal;
