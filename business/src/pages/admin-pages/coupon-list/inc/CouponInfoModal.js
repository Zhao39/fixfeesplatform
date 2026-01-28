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

const CouponInfoModal = (props) => {
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
        type_id: "",
        name: "",
        type: "",
        value: ""
    }
    const [formData, setFormData] = useState(defaultFormData);
    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const handleChangeCouponType = (e) => {
        const type_id = e.target.value
        const form_data = { ...formData }
        form_data['type_id'] = type_id
        setFormData(form_data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const form_data = { ...formData }
        const payload = {
            id: form_data.id ?? 0,
            name: form_data.name,
            type_id: form_data.type_id,
        }
        const couponTypeObj = COUPON_TYPE_LIST.find((item) => item.id === form_data.type_id)
        if(empty(couponTypeObj)) {
            showToast("Please choose coupon type", "error")
            return false
        }

        payload['type'] = couponTypeObj.type
        payload['value'] = couponTypeObj.value
        payload['desc'] = couponTypeObj.desc

        setApiCalling(true)

        let apiRes = null
        if (formData.id && formData.id > 0) {
            apiRes = await apiAdminUpdateCouponInfo(payload)
        } else {
            apiRes = await apiAdminAddCouponInfo(payload)
        }

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
                                        <InputLabel htmlFor="name">Coupon Code</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="name"
                                            value={formData.name ?? ""}
                                            name="name"
                                            onChange={(e) => handleChangeText(e, "name")}
                                            placeholder="Enter Coupon Code"
                                            inputProps={{
                                                type: 'text',
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="type">Coupon Type</InputLabel>
                                        <Select
                                            name="type_id"
                                            value={formData.type_id ?? ""}
                                            onChange={handleChangeCouponType}
                                            placeholder="Choose coupon type"
                                            inputProps={{}}
                                        >
                                            {
                                                COUPON_TYPE_LIST.map((item, index) => {
                                                    return (
                                                        <MenuItem key={index} value={item['id']}>{item['desc']}</MenuItem>
                                                    )
                                                })
                                            }
                                        </Select>
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

export default CouponInfoModal;
