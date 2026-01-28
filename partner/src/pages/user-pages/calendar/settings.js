import { useDispatch } from 'react-redux';
import { useSearchParams } from "react-router-dom";
import {
    Box,
    Button,
    Divider,
    FormHelperText,
    Grid,
    InputLabel,
    Stack,
    TextField
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

import MainCard from 'components/MainCard';

// assets
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';
import { apiUserGetProfile, apiUserUpdateProfile } from 'services/userProfileService';
import { useEffect, useState } from 'react';
import { updateAuthProfile } from 'store/reducers/auth';
import PageLayout from 'layout/UserLayout/PageLayout';
import { apiUserGetCalendarAuthUrl, apiUserSaveGoogleOauthToken } from 'services/userCalendarService';

const CalendarSettings = (props) => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams()
    const googleOauthToken = searchParams.get("token")
    console.log(`googleOauthToken::::`, googleOauthToken)

    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        saveGoogleOauthToken()
    }, [])

    const saveGoogleOauthToken = async () => {
        try {
            if (googleOauthToken) {
                const tokenObj = JSON.parse(googleOauthToken)
                if (tokenObj && tokenObj['access_token']) {
                    const payload = { token: tokenObj }
                    await apiUserSaveGoogleOauthToken(payload)
                    showToast("Google authentication successful!", "success")
                } else {
                    showToast("Google authentication failed!", "error")
                }
                setSearchParams(params => {
                    params.delete("token");
                    params.delete("status");
                    return params;
                })
            }
        } catch (e) {
            console.log(`saveGoogleOauthToken error:::`, e)
        }
    }

    const onClickConnect = async () => {
        setSubmitting(true)
        const payload = {}
        const apiRes = await apiUserGetCalendarAuthUrl()
        setSubmitting(false)

        if (apiRes['status'] === '1') {
            const authUrl = apiRes['data']['authUrl']
            window.location.href = authUrl
        } else {
            showToast(apiRes.message, 'error');
        }
    }

    return (
        <PageLayout title="Calendar Settings" cardType="">
            <MainCard content={false} sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={12}>
                        <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={1.25}>
                                <Grid item container xs={12} sm={12} spacing={2} alignItems={`center`}>
                                    {/* <Grid item xs={12} sm={6}>
                                            <TextField
                                                id="calendar_gmail"
                                                name="calendar_gmail"
                                                type="email"
                                                required={true}
                                                //value={values.name}
                                                // onBlur={handleBlur}
                                                // onChange={handleChange}
                                                placeholder="demo@gmail.com"
                                                fullWidth                                                
                                            />
                                        </Grid> */}
                                    <Grid item xs={12} sm={6}>
                                        <Button disabled={submitting} type="button" variant="contained" size="medium" className="btn-main" onClick={() => onClickConnect()}>
                                            Connect
                                        </Button>
                                    </Grid>
                                </Grid>
                              
                            </Grid>
                        </Box>
                    </Grid>

                    {/* <Grid item xs={12} sm={12}>
                        <form onSubmit={handleSubmit} style={{maxWidth: '1000px'}}>
                            <Box sx={{ p: 2.5 }}>
                                <Grid container spacing={1.25}>
                                    <Grid item xs={12} sm={12}>
                                        <InputLabel htmlFor="calendar_caledly">Caledly:</InputLabel>
                                    </Grid>
                                    <Grid item container xs={12} sm={12} spacing={2} alignItems={`center`}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                id="calendar_caledly"
                                                name="calendar_caledly"
                                                type="email"
                                                required={true}
                                                //value={values.name}
                                                // onBlur={handleBlur}
                                                // onChange={handleChange}
                                                placeholder="demo@gmail.com"
                                                fullWidth                                                
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Button disabled={submitting} type="submit" variant="contained" size="large" className="btn-main1">
                                                Connect
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        <Divider sx={{ mt: 2 }} />
                                    </Grid>
                                </Grid>
                            </Box>
                        </form>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <form onSubmit={handleSubmit} style={{maxWidth: '1000px'}}>
                            <Box sx={{ p: 2.5 }}>
                                <Grid container spacing={1.25}>
                                    <Grid item xs={12} sm={12}>
                                        <InputLabel htmlFor="calendar_zoom">Zoom:</InputLabel>
                                    </Grid>
                                    <Grid item container xs={12} sm={12} spacing={2} alignItems={`center`}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                id="calendar_zoom"
                                                name="calendar_zoom"
                                                type="email"
                                                required={true}
                                                //value={values.name}
                                                // onBlur={handleBlur}
                                                // onChange={handleChange}
                                                placeholder="demo@gmail.com"
                                                fullWidth                                                
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Button disabled={submitting} type="submit" variant="contained" size="medium" className="btn-main">
                                                Connect
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        <Divider sx={{ mt: 2 }} />
                                    </Grid>
                                </Grid>
                            </Box>
                        </form>
                    </Grid> */}
                </Grid>
            </MainCard>
        </PageLayout>
    )
}

export default CalendarSettings;
