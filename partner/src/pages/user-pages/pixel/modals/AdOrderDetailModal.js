// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, CardContent, Chip, Divider, Link, Modal, Stack, Typography } from '@mui/material';

// project imports

// assets
import { getMainUrlFromUrl, get_data_value, isoDateToTimezoneDate } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { CheckCircleOutlined, ShoppingCartOutlined, ExportOutlined } from '@ant-design/icons';
// ===========================|| Connections Integrations ||=========================== //

const AdOrderDetailModal = (props) => {
    const { currentRow, orderRow, open = false, setOpen, source } = props

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
                <MainCard
                    title={
                        (<div>
                            <Typography
                                variant='h4'
                            >
                                {`${currentRow.original.name}`}
                            </Typography>
                            <Typography
                                variant='h3'
                            >
                                {`#${orderRow.order_number}`}
                            </Typography>
                        </div>)
                    }
                    modal
                    darkTitle
                    content={false}>
                    <CardContent sx={{ maxWidth: '100%', width: '800px' }}>
                        <div>
                            <Chip
                                sx={{ justifyContent: 'flex-start', padding: 1, display: 'flex', height: 'auto', fontWeight: '600' }}
                                label={isoDateToTimezoneDate(orderRow.order_created_date)}
                            />
                        </div>

                        <div>
                            <Timeline
                                position="right"
                                sx={{
                                    '& .MuiTimelineItem-root': { minHeight: 90 },
                                    '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 },
                                    '& .MuiTimelineOppositeContent-root': { mt: 0.5 },
                                    '& .MuiTimelineDot-root': {
                                        borderRadius: 1.25,
                                        boxShadow: 'none',
                                        margin: 0,
                                        ml: 1.25,
                                        mr: 1.25,
                                        p: 1,
                                        '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                                    },
                                    '& .MuiTimelineContent-root': { borderRadius: 1, bgcolor: 'secondary.lighter', height: '100%' },
                                    '& .MuiTimelineConnector-root': { border: '1px dashed', borderColor: 'secondary.light', bgcolor: 'transparent' }
                                }}
                            >
                                <TimelineItem>
                                    <TimelineSeparator>
                                        <TimelineDot sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                                            <CheckCircleOutlined style={{ fontSize: '1.3rem' }} />
                                        </TimelineDot>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography variant="h6" component="div" sx={{ marginBottom: 1 }}>
                                            Viewed Order Confirmation Page
                                        </Typography>
                                        {/* <Typography color="textSecondary">Thank you page</Typography> */}
                                        <Box sx={{ padding: 1 }}>
                                            <Link
                                                variant="a"
                                                color={`primary`}
                                                title={orderRow.pixel_document_location}
                                                sx={{ cursor: 'pointer', wordBreak: 'break-all' }}
                                                href={orderRow.pixel_document_location}
                                                target="_blank"
                                            >
                                                {orderRow.pixel_document_location}
                                            </Link>
                                        </Box>
                                    </TimelineContent>
                                </TimelineItem>
                                <TimelineItem>
                                    <TimelineSeparator>
                                        <TimelineDot sx={{ color: 'success.main', bgcolor: 'success.lighter' }}>
                                            <ShoppingCartOutlined style={{ fontSize: '1.3rem' }} />
                                        </TimelineDot>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography variant="h6" component="div" sx={{ marginBottom: 1 }}>
                                            Purchase
                                        </Typography>
                                        {/* <Typography color="primary">Because it&apos;s awesome!</Typography> */}
                                        <Box sx={{ padding: 1 }}>
                                            <Link
                                                variant="a"
                                                color={`primary`}
                                                title={`Total Order`}
                                                sx={{ cursor: 'pointer', wordBreak: 'break-all' }}
                                                href={orderRow.order_data.order_status_url}
                                                target="_blank"
                                            >
                                                <ExportOutlined />&nbsp;{`Total Order: ${orderRow.total_price}`}
                                            </Link>
                                        </Box>
                                        <Box sx={{ padding: 1 }}>
                                            <Typography color="textPrimary">{`Total Discount: ${orderRow.order_data.total_discounts}`}</Typography>
                                        </Box>

                                        {
                                            (orderRow.order_data.line_items) && (
                                                <Box sx={{ padding: 1 }}>
                                                    {
                                                        orderRow.order_data.line_items.map((item, index) => {
                                                            return (
                                                                <Box sx={{ padding: 2, marginBottom: 1, borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} key={index}>
                                                                    <Typography color="textPrimary" sx={{ fontWeight: '600' }}>{`${item.name}`}</Typography>
                                                                    <Typography color="textPrimary">{`Price: ${item.price}`}</Typography>
                                                                    <Typography color="textPrimary">{`Quantity: ${item.quantity}`}</Typography>
                                                                </Box>
                                                            )
                                                        })
                                                    }
                                                </Box>
                                            )
                                        }
                                    </TimelineContent>
                                </TimelineItem>
                                <TimelineItem>
                                    <TimelineSeparator>
                                        <TimelineDot sx={{ color: 'warning.main', bgcolor: 'warning.lighter' }}>
                                            {
                                                (source === 'facebook') ? (
                                                    <>
                                                        <img src="/assets/global/images/fb-icon.png"
                                                            alt="facebook"
                                                            width={20}
                                                        />
                                                    </>
                                                ) : (source === 'tiktok') ? (
                                                    <>
                                                        <img src="/assets/global/images/tiktok-icon.png"
                                                            alt="tiktok"
                                                            width={20}
                                                        />
                                                    </>
                                                ) : (<></>)
                                            }
                                        </TimelineDot>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography variant="h6" component="div" sx={{ marginBottom: 1 }}>
                                            Viewed Product
                                        </Typography>
                                        <Box sx={{ padding: 1 }}>
                                            <Link
                                                variant="a"
                                                color={`primary`}
                                                title={orderRow.landing_referring_url}
                                                sx={{ cursor: 'pointer', wordBreak: 'break-all' }}
                                                href={`https://${getMainUrlFromUrl(orderRow.landing_referring_url)}`}
                                                target="_blank"
                                            >
                                                {`${getMainUrlFromUrl(orderRow.landing_referring_url)}`}
                                            </Link>
                                        </Box>
                                        <Box sx={{ padding: 1 }}>
                                            <Box sx={{ padding: 2, borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                {
                                                    (source === 'facebook') ? (
                                                        <>
                                                            <Typography color="textPrimary">{`Source: `}<span style={{ fontWeight: '600' }}>{`Facebook ads`}</span></Typography>
                                                            <Typography color="textPrimary">{`Campaign: `}<span style={{ fontWeight: '600' }}>{`${orderRow.ads_data.campaignInfo.name}`}</span></Typography>
                                                            <Typography color="textPrimary">{`Ad Set: `}<span style={{ fontWeight: '600' }}>{`${orderRow.ads_data.adSetInfo.name}`}</span></Typography>
                                                            <Typography color="textPrimary">{`Ad Name: `}<span style={{ fontWeight: '600' }}>{`${orderRow.ads_data.adInfo.name}`}</span></Typography>
                                                        </>
                                                    ) : (source === 'tiktok') ? (
                                                        <>
                                                            <Typography color="textPrimary">{`Source: `}<span style={{ fontWeight: '600' }}>{`Tiktok ads`}</span></Typography>
                                                            <Typography color="textPrimary">{`Campaign: `}<span style={{ fontWeight: '600' }}>{`${orderRow.ads_data.campaignInfo.campaign_name}`}</span></Typography>
                                                            <Typography color="textPrimary">{`Ad Group: `}<span style={{ fontWeight: '600' }}>{`${orderRow.ads_data.adSetInfo.adgroup_name}`}</span></Typography>
                                                            <Typography color="textPrimary">{`Ad Name: `}<span style={{ fontWeight: '600' }}>{`${orderRow.ads_data.adInfo.ad_name}`}</span></Typography>
                                                        </>
                                                    ) : (<></>)
                                                }
                                            </Box>
                                        </Box>
                                    </TimelineContent>
                                </TimelineItem>
                            </Timeline>
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
    );
};

export default AdOrderDetailModal;
