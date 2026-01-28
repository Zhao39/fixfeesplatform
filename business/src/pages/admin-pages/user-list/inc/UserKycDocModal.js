import { useDispatch, useSelector } from 'react-redux';
// assets
import { showToast } from 'utils/utils';
import { useEffect, useState } from 'react';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';

import idCardFrontplaceholderImg from 'assets/images/kyc/id_card_front_placeholder.png';
import idCardBackPlaceholderImg from 'assets/images/kyc/id_card_back_placeholder.png';
import passportPlaceholderImg from 'assets/images/kyc/passport_placeholder.png';
import { CARD_TYPE_LIST, KYC_STATUS } from 'config/constants';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Button, CardContent, Divider, Grid, InputLabel, Modal, Stack, Typography, Chip
} from '@mui/material';
import { get_utc_timestamp_ms } from 'utils/misc';
import MainCard from 'components/MainCard';
import { apiAdminUpdateUserInfo, apiAdminUpdateUserKycStatus } from 'services/adminService';
import SingleFileViewer from 'components/third-party/dropzone/SingleFileViewer';

const UserKycDocModal = (props) => {
    const { show, setShow, title = "", info, tableTimestamp, setTableTimestamp, userKycDoc } = props
    const user = info

    const theme = useTheme();
    const dispatch = useDispatch()
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const [open, setOpen] = useState(false);
    const defaultFormData = {

    }
    const [formData, setFormData] = useState(defaultFormData);
    useEffect(() => {
        if (show) {
            setFormData(userKycDoc)
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
    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

    }

    const setFileFieldValue = (field_name, val) => {
        const form_data = { ...formData }
        form_data[field_name] = val
        console.log(`form_data::::`, form_data)
        setFormData(form_data)
    }

    const removeFile = (file_name) => {
        const user_kyc_doc = { ...userKycDoc }
        let key = `${file_name}`
        user_kyc_doc[key] = ""
        key = `${file_name}_name`
        user_kyc_doc[key] = ""
        setFormData(user_kyc_doc)
    }

    const getIdType = (id_type) => {
        for (let k in CARD_TYPE_LIST) {
            if (CARD_TYPE_LIST[k]['value'] === id_type) {
                return CARD_TYPE_LIST[k]['text']
            }
        }
        return ""
    }

    const renderKYCStatus = () => {
        const statusText = user?.kyc_status === KYC_STATUS.VERIVIED ? 'Verified' : user?.kyc_status === KYC_STATUS.NOT_VERIVIED ? 'Not verified' : 'Rejected'
        const statusColor = user?.kyc_status === 1 ? 'success' : 'error'
        return (
            <Stack direction={`row`} spacing={1}>
                <Typography variant="body1">KYC Status: </Typography>
                <Chip
                    label={statusText}
                    variant="light"
                    size="small"
                    //sx={{ cursor: 'pointer' }}
                    color={statusColor}
                />
            </Stack>
        )
    }

    const onClickApprove = async () => {
        await updateUserKycStatus(KYC_STATUS.VERIVIED)
    }
    const onClickReject = async () => {
        await updateUserKycStatus(KYC_STATUS.REJECTED)
    }

    const updateUserKycStatus = async (kyc_status) => {
        const payload = {
            user_id: user.id,
            kyc_status: kyc_status
        }
        setApiCalling(true)
        const apiRes = await apiAdminUpdateUserKycStatus(payload)
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
                <MainCard title={title} modal darkTitle content={false}>
                    <form onSubmit={handleSubmit}>
                        <CardContent sx={{ maxWidth: '100%', width: '1000px' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    {
                                        renderKYCStatus()
                                    }
                                </Grid>
                                <Grid item xs={12}>
                                    <MainCard title="Passport / ID Card">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="body1">ID Type:  <Typography variant="h5" component="span">{getIdType(formData['id_type'])}</Typography></Typography>
                                            </Grid>

                                            <Grid item container xs={12} spacing={2} className={`${formData['id_type'] === 'passport' ? '' : 'hidden'}`}>
                                                <Grid item xs={12} sm={6}>
                                                    <Stack spacing={1.25}>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <SingleFileViewer
                                                                fieldName="passport"
                                                                placeholderType="CUSTOM"
                                                                placeholderImg={passportPlaceholderImg}
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 160 }}
                                                                fileUrl={userKycDoc?.passport}
                                                                fileName={userKycDoc?.passport_name}
                                                                removeFile={() => removeFile('passport')}
                                                            />
                                                        </Stack>
                                                    </Stack>
                                                </Grid>
                                            </Grid>

                                            <Grid item container xs={12} spacing={2} className={`${formData['id_type'] === 'passport' ? 'hidden' : ''}`}>
                                                <Grid item xs={12} sm={6}>
                                                    <Stack spacing={1.25}>
                                                        <InputLabel>Front</InputLabel>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <SingleFileViewer
                                                                setFieldValue={setFileFieldValue}
                                                                //file={formData.id_card_front}
                                                                fieldName="id_card_front"
                                                                placeholderType="CUSTOM"
                                                                placeholderImg={idCardFrontplaceholderImg}
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 160 }}
                                                                fileUrl={userKycDoc?.id_card_front}
                                                                fileName={userKycDoc?.id_card_front_name}
                                                                removeFile={() => removeFile('id_card_front')}
                                                            />
                                                        </Stack>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Stack spacing={1.25}>
                                                        <InputLabel>Back</InputLabel>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <SingleFileViewer
                                                                setFieldValue={setFileFieldValue}
                                                                //file={formData.id_card_back}
                                                                fieldName="id_card_back"
                                                                placeholderType="CUSTOM"
                                                                placeholderImg={idCardBackPlaceholderImg}
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 160 }}
                                                                fileUrl={userKycDoc?.id_card_back}
                                                                fileName={userKycDoc?.id_card_back_name}
                                                                removeFile={() => removeFile('id_card_back')}
                                                            />
                                                        </Stack>
                                                    </Stack>
                                                </Grid>
                                            </Grid>

                                        </Grid>
                                    </MainCard>
                                </Grid>

                                <Grid item xs={12}>
                                    {
                                        (user['country'] === 'US') ? (
                                            <>
                                                <MainCard title="W9 Form">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Stack spacing={1.25}>
                                                                <Stack spacing={1.5} alignItems="flex-start">
                                                                    <SingleFileViewer
                                                                        setFieldValue={setFileFieldValue}
                                                                        //file={formData.w9}
                                                                        fieldName="w9"
                                                                        placeholderType="CUSTOM"
                                                                        //sx={{ maxWidth: '450px' }}
                                                                        placeholderSx={{ width: 160 }}
                                                                        placeholderSecondaryText="Only allowed (JPEG, JPG, PNG, DOC, DOCX, PDF)"
                                                                        acceptedFileTypes={
                                                                            { '.jpg, .jpeg, .png, .doc, .docx, .pdf': [] }
                                                                        }
                                                                        fileUrl={userKycDoc?.w9}
                                                                        fileName={userKycDoc?.w9_name}
                                                                        removeFile={() => removeFile('w9')}
                                                                    />
                                                                </Stack>
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                </MainCard>
                                            </>
                                        ) : (
                                            <>
                                                <MainCard title="W8-BEN Form">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Stack spacing={1.25}>
                                                                <Stack spacing={1.5} alignItems="flex-start">
                                                                    <SingleFileViewer
                                                                        setFieldValue={setFileFieldValue}
                                                                        //file={formData.w8_ben}
                                                                        fieldName="w8_ben"
                                                                        placeholderType="CUSTOM"
                                                                        //sx={{ maxWidth: '450px' }}
                                                                        placeholderSx={{ width: 160 }}
                                                                        placeholderSecondaryText="Only allowed (JPEG, JPG, PNG, DOC, DOCX, PDF)"
                                                                        acceptedFileTypes={
                                                                            { '.jpg, .jpeg, .png, .doc, .docx, .pdf': [] }
                                                                        }
                                                                        fileUrl={userKycDoc?.w8_ben}
                                                                        fileName={userKycDoc?.w8_ben_name}
                                                                        removeFile={() => removeFile('w8_ben')}
                                                                    />
                                                                </Stack>
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                </MainCard>
                                            </>
                                        )
                                    }
                                </Grid>
                            </Grid>
                        </CardContent>
                        <Divider />
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="error" size="medium" onClick={handleClose}>
                                Close
                            </Button>
                            <Button color="error" variant="contained" size="medium" type="button" onClick={() => onClickReject()} disabled={apiCalling}>
                                Reject
                            </Button>
                            <Button variant="contained" size="medium" type="button" onClick={() => onClickApprove()} disabled={apiCalling}>
                                Approve
                            </Button>
                        </Stack>
                    </form>
                </MainCard>
            </Modal>
        </>
    )
}

export default UserKycDocModal;
