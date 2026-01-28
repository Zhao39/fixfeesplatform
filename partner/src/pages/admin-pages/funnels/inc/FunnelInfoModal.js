// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, InputLabel, Modal, OutlinedInput, Stack, TextField, Select, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { empty, getCouponTypeItem, get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { apiAdminAddCouponInfo, apiAdminUpdateCouponInfo } from 'services/adminService';
import { COUPON_TYPE_LIST } from 'config/constants';
import { urlAdminUpdateFunnelType } from '../../../../services/constants';
import { axiosPost } from 'services/ajaxServices';

const FunnelInfoModal = (props) => {
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
        description: "",
    }
    const [formData, setFormData] = useState(defaultFormData);
    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const apiAdminUpdateFunnelType = async (params = {}) => {
        const url = urlAdminUpdateFunnelType
        const payload = { ...params }
        const response = await axiosPost(url, payload)
        return response
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const form_data = { ...formData }
        const payload = {
            id: form_data.id,
            description: form_data.description
        }
        setApiCalling(true)

        let apiRes = await apiAdminUpdateFunnelType(payload)
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
                                        <InputLabel htmlFor="description">Funnel Description:</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="description"
                                            value={formData.description ?? ""}
                                            name="description"
                                            onChange={(e) => handleChangeText(e, "description")}
                                            placeholder="Enter description"
                                            required={true}
                                            multiline
                                            maxRows={8}
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
                                Save
                            </Button>
                        </Stack>
                    </form>
                </MainCard>
            </Modal>
        </>
    );
};

export default FunnelInfoModal;
