import { useDispatch } from 'react-redux';
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
import { useLocation, Link, Outlet } from 'react-router-dom';

// assets
import { console_log } from 'utils/misc';
import { showToast } from 'utils/utils';
import { apiUserGetProfile, apiUserUpdateProfile } from 'services/userProfileService';
import { useEffect, useState } from 'react';
import { updateAuthProfile } from 'store/reducers/auth';
import PageLayout from 'layout/UserLayout/PageLayout';
import AccountInfoTab from './inc/AccountInfoTab';

const AccountInfo = (props) => {
    const dispatch = useDispatch();

    useEffect(() => {

    }, [])
    return (
        <PageLayout title="Account Info">
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    <AccountInfoTab />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Box>
                        <Outlet />
                    </Box>
                </Grid>
            </Grid>
        </PageLayout>
    )
}

export default AccountInfo;
