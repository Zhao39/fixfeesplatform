// material-ui
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Box, Button, CardContent, Divider, IconButton, LinearProgress, Modal, Stack, Tooltip, Typography } from '@mui/material';

// project imports

// assets
import { useEffect, useState } from 'react';
import { empty, get_data_value, is_null } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { APP_NAME } from 'config/constants';
import { showToast } from 'utils/utils';
import { apiUserSendGptRequest } from 'services/userGptService';
import { CopyOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import axios from "axios";
import { useRef } from 'react';
import { Fragment } from 'react';

const GPT_REQUEST_COUNT = 1
const getGptIndexList = (count) => {
    const arr = []
    for (let i = 0; i < count; i++) {
        arr.push(i)
    }
    return arr
}

const GptResponseItemBlock = (props) => {
    const { index, gptResponse, loading } = props

    const onCopyText = () => {
        showToast("Copied to Clipboard")
    }

    return (
        <>
            {
                (loading) ? (
                    <>
                        <Stack direction={`column`} spacing={-0.5} justifyContent={`flex-start`} alignItems={`flex-start`} style={{ width: '100%' }}>
                            <Box sx={{ width: '100%' }}>
                                <Alert color="info" variant="border" icon={false} sx={{ justifyContent: 'flex-start' }}>
                                    <AlertTitle sx={{ textAlign: 'left', whiteSpace: 'break-spaces' }}>Please wait, the AI is trying to improve this...</AlertTitle>
                                </Alert>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <LinearProgress color="info" />
                            </Box>
                        </Stack>
                    </>
                ) : (
                    <>
                        {
                            !empty(gptResponse) ? (
                                <>
                                    <Stack direction={`column`} spacing={1} justifyContent={`flex-start`} alignItems={`flex-start`} style={{ width: '100%' }}>
                                        <Box sx={{ width: '100%' }}>
                                            <Alert color="info" variant="border" icon={false}
                                                action={
                                                    <CopyToClipboard
                                                        text={gptResponse}
                                                        onCopy={() =>
                                                            onCopyText()
                                                        }
                                                    >
                                                        <Tooltip title="Copy">
                                                            <IconButton size="large" color="primary">
                                                                <CopyOutlined />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </CopyToClipboard>
                                                }
                                            >
                                                <AlertTitle sx={{ textAlign: 'left', fontSize: '1.1em', whiteSpace: 'break-spaces' }}>
                                                    {
                                                        gptResponse
                                                    }
                                                </AlertTitle>
                                            </Alert>
                                        </Box>
                                    </Stack>
                                </>
                            ) : (
                                <></>
                            )
                        }
                    </>
                )
            }
        </>
    );
};

const AdsAiModal = (props) => {
    const { userQuery, open = false, setOpen, source } = props
    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const axiosCancelled = useRef(false)
    const currentIndex = useRef(0)
    const GPT_INDEX_LIST = getGptIndexList(GPT_REQUEST_COUNT)

    const [loading, setLoading] = useState(true)
    const defaultPageData = {
        gptResponseList: []
    }
    const [pageData, setPageData] = useState(defaultPageData)

    const axiosCancelTokenSourceRef = useRef(null)
    const cancelAxiosRequest = () => {
        try {
            axiosCancelled.current = true
            if (axiosCancelTokenSourceRef.current) {
                axiosCancelTokenSourceRef.current.cancel('Request canceled due to user action!');
            }
        } catch (e) {
            console.log(`cancelAxiosRequest error:::`, e)
        }
    }

    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        cancelAxiosRequest()
        setOpen(false)
    }

    useEffect(() => {
        if (open) {
            startSendingGptRequest(GPT_REQUEST_COUNT)
        }
    }, [open])

    const startSendingGptRequest = async (count = 1) => {
        for (let i = 0; i < count; i++) {
            if (axiosCancelled.current) {
                return false
            } else {
                await sendGptRequest(i)
            }
        }
    }

    const sendGptRequest = async (reqIndex) => {
        currentIndex.current = reqIndex

        setLoading(true)
        //console.log("userQuery::::", userQuery)
        const payload = {
            user_query: userQuery,
            source: source,
            reqIndex: reqIndex
        }
        //console.log('payload::::', payload)
        axiosCancelTokenSourceRef.current = axios.CancelToken.source();
        const apiRes = await apiUserSendGptRequest(payload, axiosCancelTokenSourceRef.current.token)
        setLoading(false)
        if (apiRes['status'] === '1') {
            if (apiRes['data']['openai_response']) {
                const page_data = {
                    ...pageData
                }
                const gptResponseList = page_data.gptResponseList
                gptResponseList[reqIndex] = apiRes['data']['openai_response']
                page_data.gptResponseList = gptResponseList
                setPageData(page_data)
                return true
            } else {
                showToast("Please try later", 'error');
                handleClose()
                return false
            }
        } else {
            showToast(apiRes.message, 'error');
            handleClose()
            return false
        }
    }

    const onCopyText = () => {
        showToast("Copied to Clipboard")
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard
                    modal
                    darkTitle
                    content={false}
                    title={`${APP_NAME} AI`}
                    secondary={
                        <>
                            {
                                (!is_null(pageData?.availableRequestCount)) && (
                                    <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`flex-start`} spacing={0.5}>
                                        <Typography variant='body1'>Questions left:</Typography>
                                        <Typography sx={{ fontWeight: '700', fontSize: '1.2em', color: pageData?.availableRequestCount > 0 ? 'warning.main' : 'error.main' }} variant='body1'>{`${pageData?.availableRequestCount}`}</Typography>
                                    </Stack>
                                )
                            }
                        </>
                    }
                >
                    <CardContent sx={{ maxWidth: '100%', width: '500px' }}>
                        <Stack direction={`column`} spacing={1} justifyContent={`flex-start`} alignItems={`flex-start`} style={{ width: '100%' }}>
                            {
                                GPT_INDEX_LIST.map((idx) => {
                                    return (
                                        <Fragment key={idx}>
                                            <GptResponseItemBlock
                                                index={idx}
                                                loading={idx === currentIndex.current ? loading : false}
                                                gptResponse={pageData.gptResponseList[idx]}
                                            />
                                        </Fragment>
                                    )
                                })
                            }
                        </Stack>
                    </CardContent>
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                        {/* {
                            (!loading) && (
                                <CopyToClipboard
                                    text={pageData?.openai_response}
                                    onCopy={() =>
                                        onCopyText()
                                    }
                                >
                                    <Button color="primary" size="medium" type="button">
                                        Copy
                                    </Button>
                                </CopyToClipboard>
                            )
                        } */}

                        <Button color="error" size="medium" onClick={handleClose}>
                            Close
                        </Button>
                    </Stack>
                </MainCard>
            </Modal>
        </>
    );
};

export default AdsAiModal;
