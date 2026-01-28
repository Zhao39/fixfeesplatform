// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, ButtonBase, CardContent, Divider, Grid, Link, Modal, Stack, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { console_log } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import { apiUserRequestWithdrawal } from 'services/userWalletService';
import { get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';

import MainCard from 'components/MainCard';
import StepBar from 'components/StepBar';

const LeadStatusModal = (props) => {
    const { show, setShow, title = "", info, tableTimestamp, setTableTimestamp } = props
    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (show) {
            setFormData({ ...info })
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

    const defaultFormData = {}
    const [formData, setFormData] = useState(defaultFormData);
    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }

    const validateForm = () => {
        let isValid = true
        const form_data = { ...formData }
        return isValid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const isValid = validateForm()
        if (!isValid) {
            return false
        }

        const form_data = { ...formData }
        const payload = {
            ...form_data
        }
        setApiCalling(true)
        const apiRes = await apiUserRequestWithdrawal(payload)
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

    const onClickUploadStatement = () => {
        console_log(`onClickUploadStatement:::`)

    }

    const getStepListData = () => {
        const stepListData = [
            (<Typography key={-1} variant="subtitle1">{`Prospects`}</Typography>),
            (<Typography key={0} variant="subtitle1">{`Onboarding`}</Typography>),
            (<Typography key={1} variant="subtitle1">{`Underwriting (In progress)`}</Typography>),
            (<Typography key={2} variant="subtitle1">{`Install`}</Typography>),
            (<Typography key={3} variant="subtitle1">{`Active Merchant`}</Typography>),
            (<Typography key={4} variant="subtitle1">{`Closed Merchant`}</Typography>)
        ]

        const userInfo = info
        if (userInfo?.upload_require_file) {
            stepListData[1] = (
                <Fragment key={1}>
                    <Stack direction={`column`} justifyContent={`center`} alignItems={`center`}>
                        <Typography variant="subtitle1">{`Underwriting`}</Typography>
                        <Typography variant="subtitle1">{`(Already uploaded)`}</Typography>
                        <ButtonBase disableRipple={true}>
                            <Link href={userInfo?.upload_require_file} target="_blank" variant="subtitle1" underline="always">{`${userInfo?.upload_require_name}`}</Link>
                        </ButtonBase>
                    </Stack>
                </Fragment>
            )
        }
        else if (userInfo?.upload_require_name) {
            stepListData[1] = (
                <Fragment key={1}>
                    <Stack direction={`column`} justifyContent={`center`} alignItems={`center`}>
                        <Typography variant="subtitle1">{`Underwriting`}</Typography>
                        <Typography variant="subtitle1">{`(Upload required: ${userInfo?.upload_require_name})`}</Typography>
                    </Stack>
                </Fragment>
            )
        }
        return stepListData
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false} >
                    <form onSubmit={handleSubmit}>
                        <CardContent sx={{ maxWidth: '100%', width: '800px' }}>
                            <Grid container spacing={3} direction="column">
                                <Grid item xs={12} md={12}>
                                    <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} sx={{ width: '100%', px: 3 }}>
                                        <StepBar
                                            steps={getStepListData()}
                                            step={info?.status ? parseInt(info?.status) - 1 : 0}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                        <Divider />
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="error" size="medium" onClick={handleClose}>
                                Close
                            </Button>
                            {/* <Button variant="contained" size="medium" type="submit" disabled={apiCalling}>
                                Submit
                            </Button> */}
                        </Stack>
                    </form>
                </MainCard>
            </Modal>
        </>
    );
};

export default LeadStatusModal;
