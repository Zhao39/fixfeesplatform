// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, CardContent, Divider, Grid, InputLabel, Modal, OutlinedInput, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { apiAdminUpdateUserInfo } from 'services/adminService';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import { apiUserUploadBusinessDoc } from 'services/userDashboardService';

const UserUploadModal = (props) => {
    const { show, setShow, title = "", info, userInfo, reloadTimestamp, setReloadTimestamp } = props
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

    const [apiLoading, setApiLoading] = useState(false)

    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
        setShow(false)
    }

    const defaultFormData = {}
    const [formData, setFormData] = useState(defaultFormData);

    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const setFileFieldValue = (field_name, val) => {
        const form_data = { ...formData }
        form_data[field_name] = val
        console.log(`form_data::::`, form_data)
        setFormData(form_data)
    }

    const [userDocs, setUserDocs] = useState({})

    const removeFile = (file_name) => {
        const user_doc = { ...userDocs }
        let key = `${file_name}`
        user_doc[key] = ""
        key = `${file_name}_name`
        user_doc[key] = ""
        setUserDocs(user_doc)

        const form_data = { ...formData }
        let deleted_fields = form_data['deleted_fields']
        deleted_fields = [...deleted_fields, file_name]
        console.log(`deleted_fields:::`, deleted_fields)
        form_data['deleted_fields'] = deleted_fields
        setFormData(form_data)
    }

    const checkFormValidate = () => {
        const form_data = { ...formData }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = checkFormValidate()
        if (!isValid) {
            return false
        }

        const form_data = { ...formData }
        const files = {}
        if (form_data['business_statement'] && form_data['business_statement'][0]) {
            files['business_statement'] = form_data['business_statement'][0]
        } else {
            showToast(`Please select a file`, 'error')
            return false
        }

        const business_info = {
            ...userInfo,
            business_statement: "",
        }

        setApiLoading(true)
        const apiRes = await apiUserUploadBusinessDoc(business_info, files)
        setApiLoading(false)
        if (apiRes['status'] === '1') {
            showToast(apiRes.message, 'success');
            setReloadTimestamp(get_utc_timestamp_ms())
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
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={1.25}>
                                            <InputLabel htmlFor="business_statement">{`Upload ${userInfo?.upload_require_name}`}</InputLabel>
                                            <Box sx={{ width: '100%' }}>
                                                <Stack spacing={1.5} alignItems="flex-start">
                                                    <UploadSingleFile
                                                        setFieldValue={setFileFieldValue}
                                                        file={formData?.business_statement}
                                                        fieldName="business_statement"
                                                        placeholderType="CUSTOM"
                                                        //sx={{ maxWidth: '450px' }}
                                                        placeholderSx={{ width: 80 }}
                                                        placeholderSecondaryText=""
                                                        acceptedFileTypes={
                                                            { '*': [] }
                                                        }
                                                        fileUrl={userDocs?.business_statement}
                                                        fileName={userDocs?.business_statement}
                                                        removeFile={() => removeFile('business_statement')}
                                                    />
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                        <Divider />
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="error" size="medium" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" size="medium" type="submit" disabled={apiLoading}>
                                Submit
                            </Button>
                        </Stack>
                    </form>
                </MainCard>
            </Modal>
        </>
    )
}

export default UserUploadModal;
