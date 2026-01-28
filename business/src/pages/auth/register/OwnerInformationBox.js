import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
// material-ui
import { Stack, Typography, Link, Divider, Grid, InputLabel, TextField, FormControl, Select, MenuItem, Alert, AlertTitle, InputAdornment, OutlinedInput, Button, IconButton, useMediaQuery } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthRegisterWizard from 'sections/auth/auth-forms/AuthRegisterWizard';
import { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { apiGetRegistraterPageData } from 'services/authService';
import { showToast } from 'utils/utils';
import { console_log, get_data_value, get_utc_timestamp_ms } from 'utils/misc';
import MainCard from 'components/MainCard';
import { BUSINESS_ENTITY_TYPE_LIST, BUSINESS_OWNER_TITLE_LIST } from 'config/constants';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import { CloseOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import NumberFormat from 'react-number-format';
import { LocalizationProvider, DateTimePicker, DesktopDatePicker, MobileDatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';

const OwnerInformationBox = (props) => {
    const {
        index,
        onClickDelete,
        list_name = "owner_list",
        formData = {},
        setFormData,
        apiLoading,
        setApiLoading
    } = props

    const isPrimary = index === 0 ? true : false

    const theme = useTheme();
    const dispatch = useDispatch();
    const history = useNavigate()
    const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id

    const itemData = formData[list_name][index]

    const handleChangeText = (e) => {
        const val = e.target.value
        const field_name = e.target.name
        //console_log(`val:::`, e, val, field_name, formData)
        const form_data = { ...formData }
        form_data[list_name][index][field_name] = val
        setFormData(form_data)
        //console_log(`form_data:::`, form_data)
    }

    const handleChangeSelect = (e) => {
        const val = e.target.value
        const field_name = e.target.name
        console_log(`val:::`, e, val, field_name, formData)
        const form_data = { ...formData }
        form_data[list_name][index][field_name] = val
        setFormData(form_data)
        //console_log(`form_data:::`, form_data)
    }

    const handleChangeDob = (v, field_name) => {
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

    ///////////////////////////////////////////////////////////////////////
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }
    ///////////////////////////////////////////////////////////////////////

    return (
        <>
            <Grid item xs={12} md={6}>
                <MainCard>
                    <Grid container spacing={3}>
                        <Grid item container xs={12} md={12} spacing={3}>
                            <Grid item xs={12} md={12}>
                                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`flex-start`}>
                                    <Typography variant="h4" component="p">
                                        {
                                            isPrimary ? `Primary Owners Information` : `Owners Information #${index + 1}`
                                        }
                                    </Typography>
                                    <div>
                                        {
                                            isPrimary ? (
                                                <IconButton type="button" variant="contained" color="error" style={{ visibility: 'hidden' }}>
                                                    <CloseOutlined />
                                                </IconButton>
                                            ) : (
                                                <IconButton type="button" variant="contained" color="error" onClick={() => onClickDelete(index)}>
                                                    <CloseOutlined />
                                                </IconButton>
                                            )
                                        }
                                    </div>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <Divider />
                            </Grid>
                            <Grid item container xs={12} md={12} spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor={`owner_first_name_${index}`}>First Name*</InputLabel>
                                        <TextField
                                            id={`owner_first_name_${index}`}
                                            name={`owner_first_name`}
                                            value={get_data_value(itemData, 'owner_first_name')}
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
                                        <InputLabel htmlFor={`owner_last_name_${index}`}>Last Name*</InputLabel>
                                        <TextField
                                            id={`owner_last_name_${index}`}
                                            name={`owner_last_name`}
                                            value={get_data_value(itemData, 'owner_last_name')}
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
                                        <InputLabel htmlFor={`owner_title_${index}`}>Title</InputLabel>
                                        <FormControl fullWidth required={true}>
                                            <Select
                                                labelId={`owner_title_${index}`}
                                                id={`owner_title_${index}`}
                                                name={`owner_title`}
                                                value={get_data_value(itemData, 'owner_title')}
                                                onChange={handleChangeSelect}
                                                placeholder=""
                                            >
                                                {
                                                    BUSINESS_OWNER_TITLE_LIST.map((item, index) => {
                                                        return (
                                                            <MenuItem value={item.value} key={index}>{item.text}</MenuItem>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor={`owner_ownership_${index}`}>Ownership*</InputLabel>
                                        <TextField
                                            id={`owner_ownership_${index}`}
                                            name={`owner_ownership`}
                                            value={get_data_value(itemData, 'owner_ownership')}
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
                                        <InputLabel htmlFor={`owner_home_address_${index}`}>Home Address*</InputLabel>
                                        <TextField
                                            id={`owner_home_address_${index}`}
                                            name={`owner_home_address`}
                                            value={get_data_value(itemData, 'owner_home_address')}
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
                                        <InputLabel htmlFor={`owner_city_${index}`}>City*</InputLabel>
                                        <TextField
                                            id={`owner_city_${index}`}
                                            name={`owner_city`}
                                            value={get_data_value(itemData, 'owner_city')}
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
                                        <InputLabel htmlFor={`owner_state_${index}`}>State*</InputLabel>
                                        <TextField
                                            id={`owner_state_${index}`}
                                            name={`owner_state`}
                                            value={get_data_value(itemData, 'owner_state')}
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
                                        <InputLabel htmlFor={`owner_zip_${index}`}>ZIP*</InputLabel>
                                        <TextField
                                            id={`owner_zip_${index}`}
                                            name={`owner_zip`}
                                            value={get_data_value(itemData, 'owner_zip')}
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
                                        <InputLabel htmlFor={`owner_phone_${index}`}>Personal Phone*</InputLabel>
                                        <NumberFormat
                                            id={`owner_phone_${index}`}
                                            name={`owner_phone`}
                                            format="###-###-####"
                                            mask="_"
                                            customInput={TextField}
                                            // onValueChange={(values, sourceInfo) => {
                                            //     console.log(`values, sourceInfo:::`, values, sourceInfo);
                                            // }}
                                            value={get_data_value(itemData, 'owner_phone')}
                                            onChange={handleChangeText}
                                            placeholder=""
                                            fullWidth
                                            required={true}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor={`owner_email_${index}`}>Personal Email*</InputLabel>
                                        <TextField
                                            id={`owner_email_${index}`}
                                            name={`owner_email`}
                                            value={get_data_value(itemData, 'owner_email')}
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
                                        <InputLabel htmlFor={`owner_dob_${index}`}>Date of Birth*</InputLabel>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DesktopDatePicker
                                                id={`owner_dob_${index}`}
                                                name={`owner_dob`}
                                                label=""
                                                inputFormat="MM/dd/yyyy"
                                                value={get_data_value(itemData, 'owner_dob', new Date())}
                                                onChange={(v) => handleChangeDob(v, 'owner_dob')}
                                                renderInput={(params) => <TextField {...params} />}
                                                required={true}
                                            />
                                        </LocalizationProvider>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor={`owner_social_security_number_${index}`}>Social Security Number*</InputLabel>
                                        <OutlinedInput
                                            id={`owner_social_security_number_${index}`}
                                            name={`owner_social_security_number`}
                                            value={get_data_value(itemData, 'owner_social_security_number')}
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
                            </Grid>
                        </Grid>
                    </Grid>
                </MainCard>
            </Grid>
        </>
    );
};

export default OwnerInformationBox;
