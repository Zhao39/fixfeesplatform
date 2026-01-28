// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Card, CardHeader, CardContent, Divider, Modal, Stack, Skeleton } from '@mui/material';

// project imports

// assets
import { useEffect, useState } from 'react';
import { empty, get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
// ===========================|| Connections Integrations ||=========================== //

const AdPreviewModal = (props) => {
    const { adId, open = false, setOpen, source } = props

    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    //console_log("userId::::", userId)
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    const [loading, setLoading] = useState(true)
    const [adPreviewInfo, setAdPreviewInfo] = useState({})

    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        if (adId) {
            loadAdPreviewInfo(adId)
        }
    }, [adId])

    const loadAdPreviewInfo = async (ad_id) => {
        
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={`Ad Preview (${adId})`} modal darkTitle content={false}>
                    <CardContent sx={{ maxWidth: '100%', width: source === 'tiktok' ? '400px' : '600px' }}>
                        <div style={{ margin: 'auto' }}>
                            {
                                (loading || empty(adPreviewInfo?.preview_link)) ? (
                                    <>
                                        <Card sx={{ maxWidth: '100%', margin: 'auto' }}>
                                            <CardHeader
                                                avatar={
                                                    <Skeleton animation="wave" variant="circular" width={40} height={40} />
                                                }
                                                title={
                                                    <Skeleton
                                                        animation="wave"
                                                        height={10}
                                                        width="80%"
                                                        style={{ marginBottom: 6 }}
                                                    />
                                                }
                                                subheader={
                                                    <Skeleton animation="wave" height={10} width="40%" />
                                                }
                                            />
                                            <Skeleton sx={{ height: 190 }} animation="wave" variant="rectangular" />
                                            <CardContent>
                                                <Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} />
                                                <Skeleton animation="wave" height={10} width="80%" />
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <div className="ad-preview-container">
                                        <iframe
                                            title={`Ad Preview`}
                                            src={adPreviewInfo.preview_link}
                                            frameBorder={0}
                                            width="100%"
                                            height="560"
                                            style={{ border: 'none', width: '100%', height: '560px' }}
                                        />
                                    </div>
                                )
                            }
                        </div>

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

export default AdPreviewModal;
