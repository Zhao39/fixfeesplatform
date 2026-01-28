// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, InputLabel, Modal, OutlinedInput, Stack, TextField, Select, MenuItem, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { empty, getVideoIdFromUrl, get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { apiAdminAddVideoInfo, apiAdminUpdateVideoInfo } from 'services/adminService';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

const VideoInfoModal = (props) => {
    const { show, setShow, title = "", info, tableTimestamp, setTableTimestamp, trainingType } = props
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
        video_url_text: "",
        video_id: "",
        headline: "",
        link: "",
        fields: [""]
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
        let form_data = { ...formData }
        form_data = trimFields(form_data)
        const video_id = getVideoIdFromUrl(form_data.video_url_text)

        const payload = {
            id: form_data.id ?? 0,
            video_url_text: form_data.video_url_text,
            video_id: video_id,
            headline: form_data.headline,
            link: form_data.link,
            training_data: JSON.stringify(form_data),
            training_type: trainingType
        }
        if (empty(payload.video_id)) {
            showToast("Please input correct video url or id", "error")
            return false
        }
        setApiCalling(true)

        let apiRes = null
        if (formData.id && formData.id > 0) {
            apiRes = await apiAdminUpdateVideoInfo(payload)
        } else {
            apiRes = await apiAdminAddVideoInfo(payload)
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

    const trimFields = (form_data) => {
        let fields = form_data['fields']
        let new_fields = fields.filter((item, index) => item.trim() !== "")
        form_data['fields'] = new_fields
        return form_data
    }
    const removeVideoField = (field_index) => {
        const form_data = { ...formData }
        let fields = form_data['fields']
        let new_fields = fields.filter((item, index) => index !== field_index)
        form_data['fields'] = new_fields
        setFormData(form_data)
    }
    const addVideoField = () => {
        const form_data = { ...formData }
        form_data['fields'].push("")
        setFormData(form_data)
    }
    const handleChangeFieldText = (e, field_index) => {
        const val = e.target.value
        const form_data = { ...formData }
        let fields = form_data['fields']
        fields[field_index] = val
        form_data['fields'] = fields
        setFormData(form_data)
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
                                        <InputLabel htmlFor="video_url_text">Video URL or ID (Vimeo) *</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="video_url_text"
                                            value={formData.video_url_text ?? ""}
                                            name="video_url_text"
                                            onChange={(e) => handleChangeText(e, "video_url_text")}
                                            placeholder="Enter vimeo url or id"
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
                                        <InputLabel htmlFor="headline">Headline</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="headline"
                                            value={formData.headline ?? ""}
                                            name="headline"
                                            onChange={(e) => handleChangeText(e, "headline")}
                                            placeholder="Enter headline text"
                                            inputProps={{
                                                type: 'text',
                                            }}
                                        />
                                    </Stack>
                                </Grid>

                                {/* <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="link">Link</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="link"
                                            value={formData.link ?? ""}
                                            name="link"
                                            onChange={(e) => handleChangeText(e, "link")}
                                            placeholder="https://example.com"
                                            inputProps={{
                                                type: 'text',
                                            }}
                                        />
                                    </Stack>
                                </Grid> */}

                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="fields">Fields</InputLabel>
                                        <Stack direction={`column`} spacing={1.25}>
                                            {
                                                formData.fields.map((item, index) => {
                                                    return (
                                                        <Stack direction={`row`} spacing={1.25} key={index}>
                                                            <OutlinedInput
                                                                fullWidth
                                                                id="fields"
                                                                value={item ?? ""}
                                                                name="fields"
                                                                onChange={(e) => handleChangeFieldText(e, index)}
                                                                placeholder=""
                                                                inputProps={{
                                                                    type: 'text',
                                                                }}
                                                            />
                                                            <IconButton size="large" color={`error`} onClick={() => removeVideoField(index)} title="Delete">
                                                                <MinusOutlined />
                                                            </IconButton>
                                                        </Stack>
                                                    )
                                                })
                                            }
                                        </Stack>
                                        <Button size="large" color={`success`} variant="dashed" startIcon={<PlusOutlined />} onClick={() => addVideoField()}>
                                            Add Field
                                        </Button>
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

export default VideoInfoModal;
