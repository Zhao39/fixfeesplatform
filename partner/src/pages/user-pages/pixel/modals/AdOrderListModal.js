// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Modal, Stack } from '@mui/material';

// project imports

// assets
import { get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import AdOrderListModalTableBlock from '../sections/AdOrderListModalTableBlock';
// ===========================|| Connections Integrations ||=========================== //

const AdOrderListModal = (props) => {
    const { currentRow, open = false, setOpen, source } = props

    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    //console_log("userId::::", userId)
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
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
                <MainCard title={`${currentRow.original.name}`} modal darkTitle content={false}>
                    <CardContent sx={{ maxWidth: '100%', width: '800px' }}>
                        <AdOrderListModalTableBlock
                            currentRow={currentRow}
                            source={source}
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

export default AdOrderListModal;
