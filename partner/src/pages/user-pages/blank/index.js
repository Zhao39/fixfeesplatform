import { useDispatch } from 'store';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import PageLayout from 'layout/UserLayout/PageLayout';
import { useEffect } from 'react';
import { showToast } from 'utils/utils';
import { useLocation, useNavigate } from 'react-router';

const BlankPage = (props) => {
        const theme = useTheme();
        const dispatch = useDispatch();
        const navigate = useNavigate()
        const location = useLocation();
        const userDataStore = useSelector((x) => x.auth);
        const userId = userDataStore?.user?.id

        useEffect(() => {
                showToast('Coming soon!', 'info')

        }, [location, navigate]);

        return (
                <PageLayout title="" cardType="">

                </PageLayout>
        )
}

export default BlankPage;