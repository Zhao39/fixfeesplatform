import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    Radio,
    RadioGroup,
    Stack,
    Typography,
    Chip
} from '@mui/material';

// third party

import MainCard from 'components/MainCard';

// assets
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useEffect, useState } from 'react';
import PageLayout from 'layout/UserLayout/PageLayout';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import { updateProfileData } from 'store/reducers/auth';

import idCardFrontplaceholderImg from 'assets/images/kyc/id_card_front_placeholder.png';
import idCardBackPlaceholderImg from 'assets/images/kyc/id_card_back_placeholder.png';
import passportPlaceholderImg from 'assets/images/kyc/passport_placeholder.png';
import { apiUserGetKycDetail, apiUserSubmitKyc } from 'services/userKycService';
import { CARD_TYPE_LIST, KYC_STATUS, MAIN_USER_ROUTE } from 'config/constants';
import UnlockVideoSection from './UnlockVideoSection';

const LockedPage = (props) => {
    const history = useNavigate()
    const dispatch = useDispatch();
    const userDataStore = useSelector((x) => x.auth);
    const user = userDataStore?.user

    //console.log(`user:::`, user)

    const [apiCalling, setApiCalling] = useState(false)

    const defaultFormData = {
        id_type: CARD_TYPE_LIST[0]['value'],
        deleted_fields: []
    }
    const [formData, setFormData] = useState(defaultFormData)
    const [userKycDoc, setUserKycDoc] = useState({})
    const [userInfo, setUserInfo] = useState(user)

    const getPageDetail = async () => {
        console.log(`apiUserGetKycDetail::::`)
        setApiCalling(true)
        const apiRes = await apiUserGetKycDetail()
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            const user_kyc_doc = apiRes['data']['userKycDoc']
            console_log(`user_kyc_doc:::`, user_kyc_doc)
            const form_data = { ...formData }
            if (user_kyc_doc['id_type']) {
                form_data['id_type'] = user_kyc_doc['id_type']
                setFormData(form_data)
            }
            setUserKycDoc(user_kyc_doc)
            setUserInfo(apiRes['data']['user'])
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }

    useEffect(() => {
        getPageDetail()
    }, [])

    const validateForm = () => {
        let isValid = true
        //console.log("formData:::", formData)
        const form_data = { ...formData }
        // const title = form_data['title'].trim()
        // if (title === "") {
        //     showToast("Subject can not be empty", "error")
        //     return false;
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
        setApiCalling(true)
        const payload = {
            id_type: form_data['id_type']
        }
        if (form_data['passport'] && form_data['passport'][0]) {
            payload['passport'] = form_data['passport'][0]
        }
        if (form_data['id_card_front'] && form_data['id_card_front'][0]) {
            payload['id_card_front'] = form_data['id_card_front'][0]
        }
        if (form_data['id_card_back'] && form_data['id_card_back'][0]) {
            payload['id_card_back'] = form_data['id_card_back'][0]
        }
        if (form_data['w9'] && form_data['w9'][0]) {
            payload['w9'] = form_data['w9'][0]
        }
        if (form_data['w8_ben'] && form_data['w8_ben'][0]) {
            payload['w8_ben'] = form_data['w8_ben'][0]
        }
        payload['deleted_fields'] = JSON.stringify(form_data['deleted_fields'])
        const apiRes = await apiUserSubmitKyc(payload)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            setUserInfo(apiRes['data']['user'])
            dispatch(updateProfileData(apiRes['data']['user']))
            showToast(apiRes.message, 'success');
            redirectMainPage()
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }

    const redirectMainPage = () => {
        let redirectUrl = MAIN_USER_ROUTE
        setTimeout(() => {
            history(redirectUrl)
        }, 100)
    }

    const handleChangeIdType = (e) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data['id_type'] = val
        setFormData(form_data)
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
        setUserKycDoc(user_kyc_doc)

        const form_data = { ...formData }
        let deleted_fields = form_data['deleted_fields']
        deleted_fields = [...deleted_fields, file_name]
        console.log(`deleted_fields:::`, deleted_fields)
        form_data['deleted_fields'] = deleted_fields
        setFormData(form_data)
    }

    return (
        <PageLayout title="Unlock Account" cardType="">
            <Box>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <UnlockVideoSection />
                        </Grid>

                        <Grid item xs={12}>
                            <MainCard title="Passport / ID Card">
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl>
                                            <RadioGroup row aria-label="ID Type" value={formData['id_type']} onChange={handleChangeIdType} name="id_type" id="id_type">
                                                {
                                                    (CARD_TYPE_LIST.map((item, index) => {
                                                        return (
                                                            <FormControlLabel key={index} value={item.value} control={<Radio />} label={item.text} />
                                                        )
                                                    }))
                                                }
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>

                                    <Grid item container xs={12} spacing={2} className={`${formData['id_type'] === 'passport' ? '' : 'hidden'}`}>
                                        <Grid item xs={12} sm={6}>
                                            <Stack spacing={1.25}>
                                                {/* <InputLabel>Front</InputLabel> */}
                                                <Stack spacing={1.5} alignItems="flex-start">
                                                    <UploadSingleFile
                                                        setFieldValue={setFileFieldValue}
                                                        file={formData.passport}
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
                                                    <UploadSingleFile
                                                        setFieldValue={setFileFieldValue}
                                                        file={formData.id_card_front}
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
                                                    <UploadSingleFile
                                                        setFieldValue={setFileFieldValue}
                                                        file={formData.id_card_back}
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
                                (userInfo?.country === 'US') ? (
                                    <>
                                        <MainCard title="W9 Form">
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Stack spacing={1.25}>
                                                        {/* <InputLabel>Front</InputLabel> */}
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.w9}
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
                                                        {/* <InputLabel>Front</InputLabel> */}
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.w8_ben}
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

                        <Grid item xs={12}>
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ px: 2.5, py: 2 }}>
                                <Button variant="contained" size="large" type="submit" disabled={apiCalling}>
                                    Submit
                                </Button>
                                <Button variant="outlined" color="secondary" size="large" type="reset" disabled={apiCalling}>
                                    Cancel
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </PageLayout>
    )
}

export default LockedPage;
