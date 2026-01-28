import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';


import {
    Box,
    Button,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    TextField,
    Typography,
    Link,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import NumberFormat from 'react-number-format';

// project import
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import { EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { console_log, getCardExpYearMonth, priceFormat, trimSpacesFromString } from 'utils/misc';
import { showToast } from 'utils/utils';
import { setPagePersistData } from 'store/reducers/pagePersist';
import { useDispatch } from 'react-redux';

// ============================|| billing form ||============================ //
const BillingFormFooterBox = (props) => {
    const { submitBillingData, formContainer = "page", sourcePage, amount } = props;
    if (formContainer === "page") {
        return (
            <AnimateButton>{props.children}</AnimateButton>
        )
    } else {
        return (
            <>{props.children}</>
        )
    }
}

const BillingForm = (props) => {
    const {
        submitBillingData,
        removeCardDetail,
        formContainer = "page",
        sourcePage,
        amount,
        showHeader = true,
        onClickGoBack,
        submittingDisabled = false
    } = props;

    const scriptedRef = useScriptRef();
    const dispatch = useDispatch()
    const history = useNavigate()

    useEffect(() => {

    }, []);
    ///////////////////////////////////////////////////////////////////////////////

    const defaultInitialValues = {
        cardName: '',
        cardNumber: '',
        expiry: new Date(),
        cvv: '',
        security: '',
        submit: null
    }

    const getInitialValues = () => {
        const values = {
            ...defaultInitialValues,
        }
        return values;
    }

    const [expiry, setExpiry] = useState(new Date());

    const onSubmitFormData = async (values) => {
        const regData = {
            ...values,
            expiry: expiry,
        }
        regData['cardNumber'] = trimSpacesFromString(regData['cardNumber'])
        const { exp_year, exp_month } = getCardExpYearMonth(expiry)
        regData['exp_year'] = exp_year
        regData['exp_month'] = exp_month
        await submitBillingData(regData)
    }

    const onClickReset = (resetForm) => {
        resetForm()
        setExpiry(new Date()) //null
    }

    const onClickRemoveCardDetail = () => {
        if (window.confirm('Are you sure?')) {
            removeCardDetail()
        }
    }

    return (
        <>
            <Formik
                initialValues={getInitialValues()}
                validationSchema={Yup.object().shape({
                    cardName: Yup.string().required('Card Name is required'),
                    cardNumber: Yup.string().required('Card Number is required'),
                    cvv: Yup.string().min(3).required('CVV is required'),
                    //security: Yup.string().min(6).required('Security Code is required')
                })}
                onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
                    try {
                        setSubmitting(true);
                        await onSubmitFormData(values);
                        setSubmitting(false);
                    } catch (err) {
                        setStatus({ success: false });
                        setErrors({ submit: err.message });
                        setSubmitting(false);
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values, resetForm }) => (
                    <form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {
                                (showHeader) ? (
                                    <Grid item xs={12}>
                                        <Stack direction="column" justifyContent="center" alignItems="center" sx={{ mb: 0 }}>
                                            <Typography variant="h5" sx={{ mb: 0.5 }}>Payment Details</Typography>
                                        </Stack>
                                    </Grid>
                                ) : (<></>)
                            }

                            <Grid item xs={12} sm={6}>
                                <Stack spacing={1.25}>
                                    <InputLabel htmlFor="payment-card-name">Name on Card</InputLabel>
                                    <TextField
                                        fullWidth
                                        id="payment-card-name"
                                        value={values.cardName}
                                        name="cardName"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Name on Card"
                                    />
                                    {touched.cardName && errors.cardName && (
                                        <FormHelperText error id="ayment-card-name-helper">
                                            {errors.cardName}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Stack spacing={1.25}>
                                    <InputLabel htmlFor="payment-card-number">Card Number</InputLabel>
                                    <NumberFormat
                                        id="payment-card-number"
                                        value={values.cardNumber}
                                        name="cardNumber"
                                        format="#### #### #### ####"
                                        prefix=""
                                        fullWidth
                                        customInput={TextField}
                                        placeholder="Card Number"
                                        onBlur={handleBlur}
                                        onValueChange={(values) => {
                                            const { value } = values;
                                            setFieldValue('cardNumber', value);
                                        }}
                                        onChange={handleChange}
                                    />
                                    {touched.cardNumber && errors.cardNumber && (
                                        <FormHelperText error id="ayment-cardNumber-helper">
                                            {errors.cardNumber}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Stack spacing={1.25}>
                                    <InputLabel htmlFor="payment-card-expiry">Expiry Date</InputLabel>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            views={['month', 'year']}
                                            value={expiry}
                                            minDate={new Date()}
                                            onChange={(newValue) => {
                                                setExpiry(newValue);
                                            }}
                                            renderInput={(params) => <TextField id="payment-card-expiry" fullWidth {...params} helperText={null} />}
                                            inputFormat="MM/yyyy"
                                            mask="__/____"
                                        />
                                    </LocalizationProvider>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Stack spacing={1.25}>
                                    <InputLabel htmlFor="payment-card-cvv">CVV Number</InputLabel>
                                    <NumberFormat
                                        id="payment-card-cvv"
                                        value={values.cvv}
                                        name="cvv"
                                        format="####"
                                        prefix=""
                                        fullWidth
                                        customInput={TextField}
                                        placeholder="CVV"
                                        onBlur={handleBlur}
                                        onValueChange={(values) => {
                                            const { value } = values;
                                            setFieldValue('cvv', value);
                                        }}
                                    />
                                    {touched.cvv && errors.cvv && (
                                        <FormHelperText error id="ayment-cvv-helper">
                                            {errors.cvv}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            {/* <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                    <InputLabel htmlFor="payment-card-security">Security Code</InputLabel>
                                    <OutlinedInput
                                        placeholder="Security Code"
                                        id="payment-card-security"
                                        type={showPassword ? 'text' : 'password'}
                                        value={values.security}
                                        name="security"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            size="large"
                                            color="secondary"
                                            >
                                            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                            </IconButton>
                                        </InputAdornment>
                                        }
                                        inputProps={{}}
                                    />
                                    {touched.security && errors.security && (
                                        <FormHelperText error id="ayment-security-helper">
                                        {errors.security}
                                        </FormHelperText>
                                    )}
                                    </Stack>
                                </Grid> */}

                            <Grid item xs={12}>
                                <BillingFormFooterBox {...props}>
                                    {
                                        (sourcePage === 'update_card') ? (
                                            <Stack direction={`row`} justifyContent={`flex-end`} alignItems={`center`} spacing={2}>
                                                {/* <Button disableElevation disabled={isSubmitting} type="button" variant="outlined" color="secondary" onClick={() => onClickReset(resetForm)}>
                                                    Cancel
                                                </Button> */}
                                                <Button disableElevation disabled={isSubmitting} type="button" variant="outlined" color="primary" onClick={() => onClickRemoveCardDetail()}>
                                                    Forgot Card
                                                </Button>
                                                <Button disableElevation disabled={isSubmitting} type="submit" variant="contained" color="primary">
                                                    Update
                                                </Button>
                                            </Stack>
                                        ) : (sourcePage === 'register_page') ? (
                                            <>
                                                <Stack direction={`column`} spacing={3}>
                                                    <Box sx={{ width: '100%' }}>
                                                        {props.children}
                                                    </Box>

                                                    <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={3}>
                                                        <Button disableElevation disabled={isSubmitting} size="large" variant="contained" color="secondary" startIcon={<ArrowLeftOutlined />} onClick={() => onClickGoBack()}>
                                                            Back
                                                        </Button>
                                                        <Button disableElevation disabled={isSubmitting || submittingDisabled} size="large" type="submit" variant="contained" color="primary">
                                                            {`Pay ( $${amount} ) & Register`}
                                                        </Button>
                                                    </Stack>
                                                </Stack>

                                            </>
                                        ) : (
                                            <>
                                                <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                                                    {
                                                        (sourcePage === 'register') ? (
                                                            <>Register</>
                                                        ) : (
                                                            <>
                                                                {
                                                                    (amount) ? (
                                                                        <>{`Pay Now (${priceFormat(amount, '$')})`}</>
                                                                    ) : (
                                                                        <>{`Pay Now`}</>
                                                                    )
                                                                }
                                                            </>
                                                        )
                                                    }
                                                </Button>
                                            </>
                                        )
                                    }
                                </BillingFormFooterBox>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default BillingForm;
