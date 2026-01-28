import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
// material-ui
import { Stack, Typography, Link, Divider, Grid, InputLabel, TextField, FormControl, Select, MenuItem, Alert, AlertTitle, InputAdornment, OutlinedInput, Button, IconButton, Autocomplete } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthRegisterWizard from 'sections/auth/auth-forms/AuthRegisterWizard';
import { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { showToast } from 'utils/utils';
import { console_log, get_data_value, get_utc_timestamp_ms, trim_phone } from 'utils/misc';
import MainCard from 'components/MainCard';
import { BUSINESS_ENTITY_TYPE_LIST, BUSINESS_OWNER_TITLE_LIST } from 'config/constants';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import { CloseOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import AnimateButton from 'components/@extended/AnimateButton';
import OwnerInformationBox from './OwnerInformationBox';
import NumberFormat from 'react-number-format';
import { LocalizationProvider, DateTimePicker, DesktopDatePicker, MobileDatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import { getUsaStateList } from 'utils/world-utils';
import { apiRegistraterBusiness } from 'services/authService';
import AuthRegisterCheckBox from 'sections/auth/auth-forms/AuthRegisterCheckBox';

// ================================|| REGISTER ||================================ //
const RegisterPage = (props) => {
    const history = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const sponsorName = searchParams.get('ref')
    console_log(`sponsorName::::`, sponsorName)

    const defaultFormData = {
        business_start_date: moment().format('YYYY-MM-DD'),
        owner_list: [{}],
    }
    const [formData, setFormData] = useState(defaultFormData)
    const [apiLoading, setApiLoading] = useState(false)

    useEffect(() => {
        getPageData()
    }, [])

    const getPageData = async () => {

    }

    const handleChangeText = (e) => {
        const val = e.target.value
        const field_name = e.target.name
        console_log(`val:::`, e, val, field_name, formData)
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const handleChangeSelect = (e) => {
        const val = e.target.value
        const field_name = e.target.name
        console_log(`val:::`, e, val, field_name, formData)
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

    const getStateList = () => {
        const arr = []
        const states = getUsaStateList()
        for (let k in states) {
            const name = states[k]?.name
            const abbreviation = states[k]?.abbreviation
            // arr.push({
            //     id: states[k]['abbreviation'],
            //     label: states[k]['abbreviation']
            // })
            arr.push(states[k]['abbreviation'])
        }
        return arr
    }

    //////////////////////////////// OwnerInformation list //////////////////////////////////////
    const onClickAddOwner = () => {
        const form_data = { ...formData }
        const owner_list = form_data['owner_list']
        owner_list.push({})
        form_data['owner_list'] = owner_list
        setFormData(form_data)
    }
    const onClickDeleteOwner = (i) => {
        const form_data = { ...formData }
        const owner_list = form_data['owner_list']
        form_data['owner_list'] = owner_list.filter((item, index) => index !== i)
        setFormData(form_data)
    }
    ///////////////////////////////////////////////////////////////////////////////////////////// 

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleChangeDate = (v, field_name) => {
        const value = moment(v).format('YYYY-MM-DD') // moment(v).unix() // moment(v).format('LLL')
        console.log(`handleChangeDob:::`, v, value)
        const e = {
            target: {
                name: field_name,
                value: value
            }
        }
        handleChangeText(e)
    }

    const checkFormValidate = () => {
        const form_data = { ...formData }
        const password = form_data['password']
        const password_c = form_data['password_c']
        if (password !== password_c) {
            showToast("Password does not match")
            return false
        }
        const business_phone = trim_phone(form_data['business_phone'])
        console_log(`business_phone.length:::`, business_phone, business_phone.length)
        if (business_phone.length < 10) {
            showToast("Please input business phone correctly", "error")
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!allChecked) {
            //showToast(`Please confirm all checkboxes`, 'error')
            return false
        }

        const isValid = checkFormValidate()
        if (!isValid) {
            return false
        }

        const form_data = { ...formData }
        const files = {}
        if (form_data['business_statement'] && form_data['business_statement'][0]) {
            files['business_statement'] = form_data['business_statement'][0]
        }
        if (form_data['business_statement_1'] && form_data['business_statement_1'][0]) {
            files['business_statement_1'] = form_data['business_statement_1'][0]
        }
        if (form_data['business_statement_2'] && form_data['business_statement_2'][0]) {
            files['business_statement_2'] = form_data['business_statement_2'][0]
        }
        if (form_data['financial_statement'] && form_data['financial_statement'][0]) {
            files['financial_statement'] = form_data['financial_statement'][0]
        }
        if (form_data['financial_statement_1'] && form_data['financial_statement_1'][0]) {
            files['financial_statement_1'] = form_data['financial_statement_1'][0]
        }
        if (form_data['financial_statement_2'] && form_data['financial_statement_2'][0]) {
            files['financial_statement_2'] = form_data['financial_statement_2'][0]
        }

        const business_info = {
            ...form_data,
            business_statement: "",
            business_statement_1: "",
            business_statement_2: "",
            financial_statement: "",
            financial_statement_1: "",
            financial_statement_2: ""
        }

        if (sponsorName) {
            business_info['ref_name'] = sponsorName
        }

        setApiLoading(true)
        const apiRes = await apiRegistraterBusiness(business_info, files)
        setApiLoading(false)
        if (apiRes['status'] === '1') {
            showToast(apiRes.message, 'success');
            const redirectUrl = `/login`
            history(redirectUrl)
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }

    const [allChecked, setAllChecked] = useState(false)

    return (
        <AuthWrapper type="register">
            {/* <AuthRegisterHeader layout={`auth`} /> */}

            <div className="block">
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* <Grid item xs={12}>
                            <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                                <Typography variant="h3" component="h1" >Register</Typography>
                            </Stack>
                        </Grid> */}

                        <Grid item xs={12}>
                            <MainCard>
                                <Grid container spacing={3}>
                                    <Grid item container xs={12} md={12} spacing={3}>
                                        <Grid item xs={12} md={12}>
                                            <Typography variant="h4" component="p">Business Information</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={12}>
                                            <Divider />
                                        </Grid>
                                        <Grid item container xs={12} md={12} spacing={3}>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_dba">DBA (Doing Business As)*</InputLabel>
                                                    <TextField
                                                        id="business_dba"
                                                        name="business_dba"
                                                        value={get_data_value(formData, 'business_dba')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_legal_name">Legal Business Name*</InputLabel>
                                                    <TextField
                                                        id="business_legal_name"
                                                        name="business_legal_name"
                                                        value={get_data_value(formData, 'business_legal_name')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_contact_first_name">Contact First Name*</InputLabel>
                                                    <TextField
                                                        id="business_contact_first_name"
                                                        name="business_contact_first_name"
                                                        value={get_data_value(formData, 'business_contact_first_name')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_contact_last_name">Contact Last Name*</InputLabel>
                                                    <TextField
                                                        id="business_contact_last_name"
                                                        name="business_contact_last_name"
                                                        value={get_data_value(formData, 'business_contact_last_name')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_address">Business Address*</InputLabel>
                                                    <TextField
                                                        id="business_address"
                                                        name="business_address"
                                                        value={get_data_value(formData, 'business_address')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_city">City*</InputLabel>
                                                    <TextField
                                                        id="business_city"
                                                        name="business_city"
                                                        value={get_data_value(formData, 'business_city')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_state">State*</InputLabel>
                                                    <Autocomplete
                                                        disablePortal
                                                        id="business_state"
                                                        //sx={{ width: 300 }}
                                                        fullWidth
                                                        required
                                                        options={getStateList()}
                                                        value={get_data_value(formData, 'business_state')}
                                                        onChange={(e, newValue) => {
                                                            console_log(`newValue:::`, newValue)
                                                            setFormData({ ...formData, business_state: newValue });
                                                        }}
                                                        renderInput={(params) => <TextField {...params} label="" />}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_zip">Zip*</InputLabel>
                                                    <TextField
                                                        id="business_zip"
                                                        name="business_zip"
                                                        value={get_data_value(formData, 'business_zip')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_phone">Business Phone*</InputLabel>
                                                    <NumberFormat
                                                        id="business_phone"
                                                        name="business_phone"
                                                        format="###-###-####"
                                                        mask="_"
                                                        customInput={TextField}
                                                        onValueChange={(values, sourceInfo) => {
                                                            console_log(`values, sourceInfo:::`, values, sourceInfo);
                                                        }}
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_email">Business Email*</InputLabel>
                                                    <TextField
                                                        id="business_email"
                                                        name="business_email"
                                                        value={get_data_value(formData, 'business_email')}
                                                        type="email"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_website">Business Website (if you have one)</InputLabel>
                                                    <TextField
                                                        id="business_website"
                                                        name="business_website"
                                                        value={get_data_value(formData, 'business_website')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_start_date">Business Start Date*</InputLabel>
                                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                        <DesktopDatePicker
                                                            id="business_start_date"
                                                            name="business_start_date"
                                                            label=""
                                                            inputFormat="MM/dd/yyyy"
                                                            value={get_data_value(formData, 'business_start_date', new Date())}
                                                            onChange={(v) => handleChangeDate(v, 'business_start_date')}
                                                            renderInput={(params) => <TextField {...params} />}
                                                            required={true}
                                                        />
                                                    </LocalizationProvider>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_federal_tax_id">Federal Tax ID*</InputLabel>
                                                    <TextField
                                                        id="business_federal_tax_id"
                                                        name="business_federal_tax_id"
                                                        value={get_data_value(formData, 'business_federal_tax_id')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_entity_type">Entity Type*</InputLabel>
                                                    <FormControl fullWidth required={true}>
                                                        <Select
                                                            id="business_entity_type"
                                                            name="business_entity_type"
                                                            value={get_data_value(formData, 'business_entity_type')}
                                                            placeholder=""
                                                            onChange={handleChangeSelect}
                                                        >
                                                            {
                                                                BUSINESS_ENTITY_TYPE_LIST.map((item, index) => {
                                                                    return (
                                                                        <MenuItem value={item.value} key={index}>{item.text}</MenuItem>
                                                                    )
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_statement">Merchant Statement</InputLabel>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.business_statement}
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
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_statement_1">Additional Statement</InputLabel>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.business_statement_1}
                                                                fieldName="business_statement_1"
                                                                placeholderType="CUSTOM"
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 80 }}
                                                                placeholderSecondaryText=""
                                                                acceptedFileTypes={
                                                                    { '*': [] }
                                                                }
                                                                fileUrl={userDocs?.business_statement_1}
                                                                fileName={userDocs?.business_statement_1}
                                                                removeFile={() => removeFile('business_statement_1')}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="business_statement_2">Additional Statement</InputLabel>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.business_statement_2}
                                                                fieldName="business_statement_2"
                                                                placeholderType="CUSTOM"
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 80 }}
                                                                placeholderSecondaryText=""
                                                                acceptedFileTypes={
                                                                    { '*': [] }
                                                                }
                                                                fileUrl={userDocs?.business_statement_2}
                                                                fileName={userDocs?.business_statement_2}
                                                                removeFile={() => removeFile('business_statement_2')}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Grid>

                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MainCard>
                        </Grid>

                        <Grid item xs={12}>
                            <MainCard>
                                <Grid container spacing={3}>
                                    <Grid item container xs={12} md={12} spacing={3}>
                                        <Grid item xs={12} md={12}>
                                            <Typography variant="h4" component="p">Business Financial Information</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={12}>
                                            <Divider />
                                        </Grid>
                                        <Grid item container xs={12} md={12} spacing={3}>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="bank_name">Bank Name*</InputLabel>
                                                    <TextField
                                                        id="bank_name"
                                                        name="bank_name"
                                                        value={get_data_value(formData, 'bank_name')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="bank_routing">Bank Routing #</InputLabel>
                                                    <TextField
                                                        id="bank_routing"
                                                        name="bank_routing"
                                                        value={get_data_value(formData, 'bank_routing')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="bank_account">Bank Account #</InputLabel>
                                                    <TextField
                                                        id="bank_account"
                                                        name="bank_account"
                                                        value={get_data_value(formData, 'bank_account')}
                                                        type="password"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="product_sold">Products & Services Sold*</InputLabel>
                                                    <TextField
                                                        id="product_sold"
                                                        name="product_sold"
                                                        value={get_data_value(formData, 'product_sold')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="annual_business_revenue">Annual Business Revenue (all payment types)*</InputLabel>
                                                    <OutlinedInput
                                                        id="annual_business_revenue"
                                                        name="annual_business_revenue"
                                                        value={get_data_value(formData, 'annual_business_revenue')}
                                                        type="number"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        startAdornment={
                                                            <InputAdornment position="end">
                                                                {`$`}
                                                            </InputAdornment>
                                                        }
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="monthly_credit_card_volumn">Monthly Credit Card Volume*</InputLabel>
                                                    <OutlinedInput
                                                        id="monthly_credit_card_volumn"
                                                        name="monthly_credit_card_volumn"
                                                        value={get_data_value(formData, 'monthly_credit_card_volumn')}
                                                        type="number"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        startAdornment={
                                                            <InputAdornment position="end">
                                                                {`$`}
                                                            </InputAdornment>
                                                        }
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="average_transaction">Average Transaction Size (Dollar Amount)*</InputLabel>
                                                    <OutlinedInput
                                                        id="average_transaction"
                                                        name="average_transaction"
                                                        value={get_data_value(formData, 'average_transaction')}
                                                        type="number"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        startAdornment={
                                                            <InputAdornment position="end">
                                                                {`$`}
                                                            </InputAdornment>
                                                        }
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="max_transaction">Max Transaction Size (Dollar Amount)*</InputLabel>
                                                    <OutlinedInput
                                                        id="max_transaction"
                                                        name="max_transaction"
                                                        value={get_data_value(formData, 'max_transaction')}
                                                        type="number"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        startAdornment={
                                                            <InputAdornment position="end">
                                                                {`$`}
                                                            </InputAdornment>
                                                        }
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="frequency_per_transaction">Frequency of Max Transactions (per year)*</InputLabel>
                                                    <TextField
                                                        id="frequency_per_transaction"
                                                        name="frequency_per_transaction"
                                                        value={get_data_value(formData, 'frequency_per_transaction')}
                                                        type="text"
                                                        onChange={handleChangeText}
                                                        placeholder=""
                                                        fullWidth
                                                        required={true}
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Alert color="warning" variant="border" icon={false}>
                                                    <Typography variant="h5" component="p" align="center" sx={{ fontWeight: 400, opacity: 0.75 }}>
                                                        Please upload copies of your recent merchant statements, if available. These documents help our team underwrite your business properly and outline the types of cards your business processes.
                                                    </Typography>
                                                </Alert>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="financial_statement">Merchant Statement</InputLabel>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.financial_statement}
                                                                fieldName="financial_statement"
                                                                placeholderType="CUSTOM"
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 80 }}
                                                                placeholderSecondaryText=""
                                                                acceptedFileTypes={
                                                                    { '*': [] }
                                                                }
                                                                fileUrl={userDocs?.financial_statement}
                                                                fileName={userDocs?.financial_statement}
                                                                removeFile={() => removeFile('financial_statement')}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="financial_statement_1">Additional Statement</InputLabel>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.financial_statement_1}
                                                                fieldName="financial_statement_1"
                                                                placeholderType="CUSTOM"
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 80 }}
                                                                placeholderSecondaryText=""
                                                                acceptedFileTypes={
                                                                    { '*': [] }
                                                                }
                                                                fileUrl={userDocs?.financial_statement_1}
                                                                fileName={userDocs?.financial_statement_1}
                                                                removeFile={() => removeFile('financial_statement_1')}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={1.25}>
                                                    <InputLabel htmlFor="financial_statement_2">Additional Statement</InputLabel>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Stack spacing={1.5} alignItems="flex-start">
                                                            <UploadSingleFile
                                                                setFieldValue={setFileFieldValue}
                                                                file={formData.financial_statement_2}
                                                                fieldName="financial_statement_2"
                                                                placeholderType="CUSTOM"
                                                                //sx={{ maxWidth: '450px' }}
                                                                placeholderSx={{ width: 80 }}
                                                                placeholderSecondaryText=""
                                                                acceptedFileTypes={
                                                                    { '*': [] }
                                                                }
                                                                fileUrl={userDocs?.financial_statement_2}
                                                                fileName={userDocs?.financial_statement_2}
                                                                removeFile={() => removeFile('financial_statement_2')}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Grid>

                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MainCard>
                        </Grid>

                        <Grid item xs={12}>
                            <Alert color="warning" variant="border" icon={false}>
                                <Typography variant="h5" component="p" align="center" sx={{ fontWeight: 400, opacity: 0.75 }}>
                                    Please fill in the information of the primary business owner in this section. Use the "Add Owners Information" section to add additional owners, if they own 25% or more of the business.
                                </Typography>
                            </Alert>
                        </Grid>

                        <Grid item container xs={12} spacing={3}>
                            {
                                formData['owner_list'].map((item, index) => {
                                    return (
                                        <OwnerInformationBox
                                            key={index}
                                            index={index}
                                            onClickDelete={() => onClickDeleteOwner(index)}
                                            formData={formData}
                                            setFormData={setFormData}
                                            apiLoading={apiLoading}
                                            setApiLoading={setApiLoading}
                                        />
                                    )
                                })
                            }
                            <Grid item xs={12} md={6}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    startIcon={<PlusOutlined />}
                                    fullWidth
                                    onClick={() => onClickAddOwner()}
                                >Add Owners Information</Button>
                            </Grid>
                        </Grid>

                        <Grid item container xs={12} spacing={3}>
                            <Grid item xs={12} md={3}></Grid>
                            <Grid item xs={12} md={6}>
                                <MainCard>
                                    <Grid container spacing={3}>
                                        <Grid item container xs={12} md={12} spacing={3}>
                                            <Grid item xs={12} md={12}>
                                                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`flex-start`}>
                                                    <Typography variant="h4" component="p">Login Details</Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <Divider />
                                            </Grid>
                                            <Grid item container xs={12} md={12} spacing={3}>
                                                <Grid item xs={12} md={12}>
                                                    <Stack spacing={1.25}>
                                                        <InputLabel htmlFor="name">Username*</InputLabel>
                                                        <TextField
                                                            id="name"
                                                            name="name"
                                                            value={get_data_value(formData, 'name')}
                                                            type="text"
                                                            onChange={handleChangeText}
                                                            placeholder=""
                                                            fullWidth
                                                            required={true}
                                                        />
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={12}>
                                                    <Stack spacing={1.25}>
                                                        <InputLabel htmlFor="password">Password*</InputLabel>
                                                        <OutlinedInput
                                                            id="password"
                                                            name="password"
                                                            value={get_data_value(formData, 'password')}
                                                            type={showPassword ? 'text' : 'password'}
                                                            onChange={handleChangeText}
                                                            fullWidth
                                                            required={true}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handleClickShowPassword}
                                                                        edge="end"
                                                                        color="secondary"
                                                                    >
                                                                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                            placeholder="******"
                                                            inputProps={{}}
                                                        />
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={12}>
                                                    <Stack spacing={1.25}>
                                                        <InputLabel htmlFor="password_c">Confirm Password*</InputLabel>
                                                        <OutlinedInput
                                                            id="password_c"
                                                            name="password_c"
                                                            value={get_data_value(formData, 'password_c')}
                                                            type={showPassword ? 'text' : 'password'}
                                                            onChange={handleChangeText}
                                                            fullWidth
                                                            required={true}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handleClickShowPassword}
                                                                        edge="end"
                                                                        color="secondary"
                                                                    >
                                                                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                            placeholder="******"
                                                            inputProps={{}}
                                                        />
                                                    </Stack>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <AuthRegisterCheckBox
                                                        allChecked={allChecked}
                                                        setAllChecked={setAllChecked}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={12}>
                                                    <Button disableElevation disabled={apiLoading || !allChecked} fullWidth size="large" type="submit" variant="contained" color="primary">
                                                        Submit
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </MainCard>
                            </Grid>
                            <Grid item xs={12} md={3}></Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Box>
                                <Divider>
                                    <Link
                                        variant="h6"
                                        component={RouterLink}
                                        to={'/login'}
                                        color="text.primary"
                                    >
                                        Already have an account?
                                    </Link>
                                </Divider>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </AuthWrapper>
    );
};

export default RegisterPage;
