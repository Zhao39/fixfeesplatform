// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Modal, Stack } from '@mui/material';

// project imports

// assets
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import BillingForm from './BillingForm';
// ===========================|| Connections Integrations ||=========================== //

const BillingFormModal = (props) => {
    const { title = "Confirm Purchase", open = false, setOpen, submitBillingData, sourcePage, amount } = props

    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false}>
                    <CardContent sx={{ maxWidth: '100%', width: '800px' }}>
                        <BillingForm
                            submitBillingData={(values) => submitBillingData(values)}
                            sourcePage={sourcePage}
                            formContainer="modal"
                            amount={amount}
                        />
                    </CardContent>
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                        <Button color="error" size="small" onClick={handleClose}>
                            Close
                        </Button>
                    </Stack>
                </MainCard>
            </Modal>
        </>
    )
}

export default BillingFormModal;
