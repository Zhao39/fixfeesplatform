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
import UserLeadsTable from './UserLeadsTable';

const UserLeadsModal = (props) => {
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

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false} >
                    <CardContent sx={{ maxWidth: '100%', width: '1024px' }}>
                        <Grid container spacing={3} direction="column">
                            <Grid item xs={12} sm={12}>
                                <UserLeadsTable
                                    info={info}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                        <Button color="error" size="medium" onClick={handleClose}>
                            Close
                        </Button>
                    </Stack>
                </MainCard>
            </Modal>
        </>
    );
};

export default UserLeadsModal;
