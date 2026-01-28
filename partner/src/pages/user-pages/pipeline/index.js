import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import Merchant from './Merchant';
import BrandPartner from "./BrandPartner";
import { useEffect, useState } from 'react';
import { showToast } from 'utils/utils';
import { useLocation, useNavigate } from 'react-router';
import { Container, Grid, MenuItem, Select, Box, Card, Typography, CardContent, Avatar, Button, Alert, Stack, Snackbar, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { apiUserGetProfile } from 'services/userProfileService';
import axios from 'axios';
import { APP_NAME, BASE_API_URL } from "config/constants";
import { empty } from 'utils/misc';
import { axiosPost } from 'services/ajaxServices';


const TabList = [
    {
        value: 'Merchant',
        text: 'Merchants'
    },
    {
        value: 'Brand_Partners',
        text: 'Brand Partners'
    }
]

const boxData = [
    { text: 'Prospects' },
    { text: 'Onboarding' },
    { text: 'Underwriting' },
    { text: 'Install' },
    { text: 'Active Merchant' },
    { text: 'Closed Merchant' }
]


const PipeLineListPage = (props) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const location = useLocation();
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    const [currentTab, setCurrentTab] = useState(TabList[0]['value']);

    const defaultFormData = {}
    const [merchantData, setMerchantData] = useState(defaultFormData)
    const [partnerData, setPartnerData] = useState(defaultFormData)
    const [apiLoading, setApiLoading] = useState(false)
    const [searchKey, setSearchKey] = useState('');

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [openAddEmailModal, setOpenAddEmailModal] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    useEffect(() => {
        getMerchantData();
    }, []);

    useEffect(() => {
        if (currentTab == "Merchant") {
            getMerchantData(searchKey);
        } else {
            getPartnerData(searchKey);
        }
    }, [currentTab]);

    useEffect(() => {
        if (currentTab == "Merchant") {
            getMerchantData(searchKey);
        } else {
            getPartnerData(searchKey);
        }
    }, [searchKey])

    const onChangeTabOption = (e) => {
        setCurrentTab(e.target.value);
    }

    const getMerchantData = async (keyword) => {
        const res = await axios.get(`${BASE_API_URL}/user/lead/get-merchant-data-all-list`, { params: { keyword } });
        setMerchantData(res.data.data);
    }
    const getPartnerData = async (keyword) => {
        const res = await axios.get(`${BASE_API_URL}/user/lead/get-partner-data-all-list`, { params: { keyword } });
        setPartnerData(res.data.data);
    }
    const handleRemoveMerchantProspect = async (item) => {
        const email = item['business_email'];
        await axios.delete(`${BASE_API_URL}/user/lead/remove-merchant-prospects`, { params: { email } });
        getMerchantData(searchKey);
    }

    const handleMerchantProspectAdd = async (mData) => {
        try {
            if (!mData.name) {
                showToast('Please provide the prospect name!', 'error');
                return;
            }
            if (empty(mData.email)) {
                showToast('Please provide email!', 'error');
                return;
            }

            const url = `${BASE_API_URL}/user/lead/add-merchant-prospects`;
            const params = { ...mData }
            const apiRes = await axiosPost(url, params)
            if (apiRes['status'] === '1') {
                showToast(apiRes.message, 'success');
                getMerchantData(searchKey);
            } else {
                showToast('Failed to add prospect: ' + (apiRes.message || 'Unknown error'), 'error');
            }
            setOpenAddEmailModal(false); // Close the modal after API call
        } catch (error) {
            console.error('Error adding prospect:', error);
            showToast('An error occurred while adding the email. Please try again later.', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    }

    const handleRemovePartnerProspect = async (item) => {
        const email = item['email'];
        await axios.delete(`${BASE_API_URL}/user/lead/remove-partner-prospects`, { params: { email } });
        getPartnerData(searchKey);
    }

    const handlePartnerProspectAdd = async (mData) => {
        try {
            if (!mData.name) {
                showToast('Please provide the prospect name!', 'error');
                return;
            }
            if (!mData.email) {
                showToast('Please enter a valid email.', 'error');
                return;
            }

            const url = `${BASE_API_URL}/user/lead/add-partner-prospects`;
            const params = { ...mData }
            const apiRes = await axiosPost(url, params)
            if (apiRes['status'] === '1') {
                showToast(apiRes.message, 'success');
                getPartnerData(searchKey);
            } else {
                showToast('Failed to add prospect: ' + (apiRes.message || 'Unknown error'), 'error');
            }
            setOpenAddModal(false); // Close the modal after API call
        } catch (error) {
            console.error('Error adding prospect:', error);
            showToast('An error occurred while adding the email. Please try again later.', 'error');
        }
    }
    return (
        <PageLayout
            title=""
            cardType="MainCard"
        >
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000} // Snackbar will auto-hide after 6 seconds
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Positioning
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Select value={currentTab} onChange={(e) => onChangeTabOption(e)}>
                        {TabList.map((item, index) => (
                            <MenuItem key={index} value={item.value}>
                                {item.text}
                            </MenuItem>
                        ))}
                    </Select>
                    <TextField
                        id="standard-basic"
                        label="Search"
                        variant="standard"
                        sx={{ ml: 'auto', minWidth: 200 }}
                        value={searchKey}
                        onChange={(e) => setSearchKey(e.target.value)}
                    />
                </Box>
                {currentTab === 'Merchant' ?
                    <Merchant
                        merchantData={merchantData}
                        handleMerchantProspectAdd={handleMerchantProspectAdd}
                        openAddEmailModal={openAddEmailModal}
                        setOpenAddEmailModal={setOpenAddEmailModal}
                        handleRemoveMerchantProspect={handleRemoveMerchantProspect}
                    />
                    :
                    <BrandPartner
                        partnerData={partnerData}
                        handlePartnerProspectAdd={handlePartnerProspectAdd}
                        openAddModal={openAddModal}
                        setOpenAddModal={setOpenAddModal}
                        handleRemovePartnerProspect={handleRemovePartnerProspect}
                    />}
            </Box>
        </PageLayout>
    )
}

export default PipeLineListPage;
