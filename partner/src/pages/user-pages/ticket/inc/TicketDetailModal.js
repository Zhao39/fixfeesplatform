// material-ui
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Button, Card, CardContent, Chip, Divider, Grid, InputLabel, Link, Modal, Stack, TextField, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { console_log, empty, getTicketAttachmentUrl, get_data_value, get_utc_timestamp_ms, timeConverter } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import { ClockCircleOutlined, CloudDownloadOutlined, CommentOutlined, InfoCircleOutlined, SendOutlined } from '@ant-design/icons';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import { APP_NAME } from 'config/constants';
import { apiUserCloseTicket, apiUserGetTicketDetail, apiUserSubmitTicketMessage } from 'services/userTicketService';
import { SocketContext } from 'contexts/socket';
import UserAvatar from 'sections/apps/chat/UserAvatar';
import ConfirmDialog from 'components/ConfirmDialog/ConfirmDialog';

const TicketDetailModal = (props) => {
    const { show, setShow, title = "", ticketid, tableTimestamp, setTableTimestamp } = props
    const theme = useTheme();
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    const user = userDataStore?.user
    const userId = user?.id
    const settingPersistDataStore = useSelector((x) => x.settingPersist);

    const scrollToBottom = () => {
        const el = document.querySelector('#ticket-message-form');
        el.scrollTop = el.scrollHeight;
        //el.scrollIntoView(false);
    }
    const setTextInputFocus = () => {
        const el = document.querySelector('#ticket-message-input');
        if (el) {
            el.focus();
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const [apiCalling, setApiCalling] = useState(false)
    const [row, setRow] = useState(null)
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (show) {
            if (ticketid) {
                loadTicketInfo(ticketid)
            }
            handleOpen()
        }
    }, [show])

    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = (refresh = false) => {
        if (refresh) {
            setTableTimestamp(get_utc_timestamp_ms())
        }
        setOpen(false)
        setShow(false)
    }

    const defaultFormData = {
        description: "",
    }
    const [formData, setFormData] = useState(defaultFormData);

    const loadTicketInfo = async (id) => {
        setApiCalling(true)
        const payload = {
            ticketid: id
        }
        const apiRes = await apiUserGetTicketDetail(payload)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            const ticket_info = apiRes?.data?.ticket_info
            if (ticket_info) {
                setRow(ticket_info)
                return true
            }
            else {
                showToast("Invalid request!", 'error');
                handleClose(true)
                return false
            }

        } else {
            showToast(apiRes.message, 'error');
            handleClose(true)
            return false
        }
    }

    const handleChangeText = (e, field_name) => {
        const val = e.target.value
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
    }
    const setFileFieldValue = (field_name, val) => {
        const form_data = { ...formData }
        form_data[field_name] = val
        setFormData(form_data)
        setTimeout(function () {
            scrollToBottom();
        }, 700);
    }

    const validateForm = () => {
        let isValid = true
        //console.log("formData:::", formData)
        const form_data = { ...formData }
        const description = form_data['description'].trim()
        if (description === "") {
            showToast("Your reply is empty", "error")
            return false;
        }
        return isValid
    }

    const resetForm = () => {
        const form_data = { ...defaultFormData }
        setFormData(form_data)
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const isValid = validateForm()
        if (!isValid) {
            return false
        }

        const form_data = { ...formData }
        const payload = {
            ticket_id: ticketid,
            description: form_data.description,
        }
        const uploadFile = formData?.files ? formData?.files[0] : null
        setApiCalling(true)
        const apiRes = await apiUserSubmitTicketMessage(payload, uploadFile)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            const ticket_info = apiRes?.data?.ticket_info
            setRow(ticket_info)
            emitNewTicketNewMessage()
            //showToast(apiRes.message, 'success');
            resetForm()
            setTableTimestamp(get_utc_timestamp_ms())
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }


    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const [confirmAction, setConfirmAction] = useState("")
    const handleCloseTicket = () => {
        setConfirmText(`Are you sure you want to close current ticket?`)
        setConfirmAction("close_ticket")
        setShowConfirmModal(true)
    }

    const onClickYesConfirm = () => {
        if (confirmAction === "close_ticket") {
            closeTicket()
        }
    }
    const onClickNoConfirm = () => {
        setShowConfirmModal(false)
    }

    const closeTicket = async () => {
        const payload = {
            id: ticketid,
        }
        setApiCalling(true)
        const apiRes = await apiUserCloseTicket(payload)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            showToast(apiRes.message, 'success');
            handleClose(true)
            return true
        } else {
            showToast(apiRes.message, 'error');
            return false
        }
    }


    //////////////////////////socket part////////////////////////////////
    const socket = useContext(SocketContext);
    //const socketDataStore = useSelector((x) => x.socketDataStore);
    const token = get_data_value(userDataStore, "token");
    const socketHeader = { token: token };

    const [socketMessageList, setSocketMessageList] = useState([]);
    const [lastPostId, setLastPostId] = useState(0);

    const onGetTicketMessageList = (data) => {
        console_log("-------------get_ticket_message_list reply data---------", data)
        if (parseInt(data["ticketid"]) === parseInt(ticketid)) {
            if (!empty(data)) {
                setSocketMessageList(data["ticket_message_list"]);
                console_log('--------------read_ticket_message_list---------------')
                socket.emit("read_ticket_message_list", {
                    ...socketHeader,
                    ticketid: ticketid,
                });
            }
            setTimeout(function () {
                scrollToBottom();
                setTextInputFocus();
            }, 100);
        }
    }

    const addSocketListener = () => {
        if (!empty(socket)) {
            socket.on("get_ticket_message_list", onGetTicketMessageList);
        }
    }

    const unbindSocketListener = () => {
        if (!empty(socket)) {
            socket.off("get_ticket_message_list", onGetTicketMessageList);
        }
    };

    useEffect(() => {
        if (!empty(socket)) {
            addSocketListener();
            getTicketNewMessageList();
        }
        return () => {
            // before the component is destroyed
            // unbind all event handlers used in this component
            unbindSocketListener()
        };
    }, [socket, ticketid]);

    const getTicketNewMessageList = () => {
        socket.emit("get_ticket_message_list", {
            ...socketHeader,
            last_id: lastPostId,
            ticketid: ticketid,
        });
        //setLastPostId(lastPostId + 1)
    };
    const emitNewTicketNewMessage = () => {
        socket.emit("submit_new_ticket_message", {
            ...socketHeader,
            ticketid: ticketid,
        });
    };
    ///////////////////////////end socket part/////////////////////////////

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false}>
                    <form onSubmit={handleSubmit}>
                        <CardContent sx={{ maxWidth: 'calc(100vw - 50px)', width: '1000px' }} id="ticket-message-form" >
                            {
                                (row) && (
                                    <Grid container spacing={3} direction="column">
                                        <Grid item xs={12} sm={12}>
                                            <Alert
                                                color="primary"
                                                variant="border"
                                                icon={false}
                                                action={
                                                    <Chip
                                                        label={row["status"]}
                                                        variant="light"
                                                        size="small"
                                                        color={row["status"] === "Opened" ? "error" : row["status"] === "Answered" ? "warning" : row["status"] === "Replied" ? "success" : row["status"] === "Closed" ? "secondary" : "warning"}
                                                    />
                                                }
                                            >
                                                <AlertTitle sx={{ fontSize: '1.35em' }}><CommentOutlined /> : {row['title']}</AlertTitle>
                                                {
                                                    (row.description) && (
                                                        <div className="ticket-details" style={{ opacity: 0.85 }}>
                                                            <span className="info">
                                                                {row.description}
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    (row.attachment_path) && (
                                                        <div className="ticket-details ticket-attachment" style={{ marginTop: '0.25rem' }}>
                                                            <a
                                                                style={{textDecoration: 'none'}}
                                                                href={`${getTicketAttachmentUrl(row.attachment_path)}`}
                                                                target="_blank"
                                                                download
                                                                rel="noreferrer"
                                                            >
                                                                <Typography variant="p" color="primary"><CloudDownloadOutlined /> File attachment</Typography>
                                                            </a>
                                                        </div>
                                                    )
                                                }

                                                <div className="ticket-details" style={{ opacity: 0.6, marginTop: '0.5rem' }}>
                                                    <Stack direction={`row`} alignItems={`center`} justifyContent={`flex-start`} spacing={1.5}>
                                                        <span className="info">
                                                            <InfoCircleOutlined />&nbsp;Ticket ID: {row.id}
                                                        </span>
                                                        <span className="info">
                                                            <ClockCircleOutlined />&nbsp;{timeConverter(row.add_timestamp)}
                                                        </span>
                                                    </Stack>
                                                </div>
                                            </Alert>
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <Divider sx={{ borderBottomWidth: 1, bgcolor: "secondary.200" }} />
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <div className="ticket-message-list-box">
                                                <Grid container spacing={2.5}>
                                                    {socketMessageList.map((history, index) => (
                                                        <Grid item xs={12} key={index}>
                                                            {history.sender_id === user.id ? (
                                                                <Stack spacing={1.25} direction="row">
                                                                    <Grid container spacing={1} justifyContent="flex-end">
                                                                        <Grid item xs={2} md={3} xl={4} />

                                                                        <Grid item xs={10} md={9} xl={8}>
                                                                            <Stack direction="row" justifyContent="flex-end" alignItems="flex-start">
                                                                                <Card
                                                                                    sx={{
                                                                                        display: 'inline-block',
                                                                                        float: 'right',
                                                                                        bgcolor: theme.palette.primary.main,
                                                                                        boxShadow: 'none',
                                                                                        ml: 1
                                                                                    }}
                                                                                >
                                                                                    <CardContent sx={{ p: 1, pb: '8px !important', width: 'fit-content', ml: 'auto' }}>
                                                                                        <Grid container spacing={1}>
                                                                                            <Grid item xs={12}>
                                                                                                <Typography variant="h6" color={theme.palette.grey[0]}>
                                                                                                    {history.message}
                                                                                                </Typography>
                                                                                            </Grid>
                                                                                        </Grid>
                                                                                    </CardContent>
                                                                                </Card>
                                                                            </Stack>
                                                                        </Grid>
                                                                        {
                                                                            (history['attachment_path']) && (
                                                                                <Grid item xs={12}>
                                                                                    <a
                                                                                        className="pull-right"
                                                                                        href={`${getTicketAttachmentUrl(history.attachment_path)}`}
                                                                                        target="_blank"
                                                                                        download
                                                                                        style={{textDecoration: 'none'}}
                                                                                        rel="noreferrer"
                                                                                    >
                                                                                        <Typography align="right" variant="h6" color="primary"><CloudDownloadOutlined /> File attachment</Typography>
                                                                                    </a>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        <Grid item xs={12}>
                                                                            <Typography align="right" variant="subtitle2" color="textSecondary">
                                                                                {timeConverter(history["add_timestamp"])}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                    <UserAvatar user={{ avatar: '', name: user.name }} />
                                                                </Stack>
                                                            ) : (
                                                                <Stack direction="row" spacing={1.25} alignItems="flext-start">
                                                                    <UserAvatar user={{ avatar: 'admin.png', name: 'Admin' }} />

                                                                    <Grid container>
                                                                        <Grid item xs={12} sm={7}>
                                                                            <Card
                                                                                sx={{
                                                                                    display: 'inline-block',
                                                                                    float: 'left',
                                                                                    bgcolor: theme.palette.mode === 'dark' ? 'background.background' : 'grey.0',
                                                                                    boxShadow: 'none'
                                                                                }}
                                                                            >
                                                                                <CardContent sx={{ p: 1, pb: '8px !important' }}>
                                                                                    <Grid container spacing={1}>
                                                                                        <Grid item xs={12}>
                                                                                            <Typography variant="h6" color="textPrimary">
                                                                                                {history.message}
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                </CardContent>
                                                                            </Card>
                                                                        </Grid>
                                                                        {
                                                                            (history['attachment_path']) && (
                                                                                <Grid item xs={12}>
                                                                                    <a
                                                                                        className="pull-left"
                                                                                        href={`${getTicketAttachmentUrl(history.attachment_path)}`}
                                                                                        target="_blank"
                                                                                        download
                                                                                        style={{textDecoration: 'none'}}
                                                                                        rel="noreferrer"
                                                                                    >
                                                                                        <Typography align="left" variant="h6" color="primary"><CloudDownloadOutlined /> File attachment</Typography>
                                                                                    </a>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        <Grid item xs={12} sx={{ mt: 1 }}>
                                                                            <Typography align="left" variant="subtitle2" color="textSecondary">
                                                                                {timeConverter(history["add_timestamp"])}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Stack>
                                                            )}
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </div>
                                        </Grid>

                                        {
                                            (row?.status !== "Closed") && (
                                                <>
                                                    <Grid item xs={12} sm={12}>
                                                        <Stack spacing={1.25}>
                                                            <InputLabel htmlFor="description">Your reply: *</InputLabel>
                                                            <TextField
                                                                id="ticket-message-input"
                                                                fullWidth
                                                                multiline
                                                                rows={5}
                                                                value={formData.description}
                                                                onChange={(e) => handleChangeText(e, "description")}
                                                                placeholder="Type here..."
                                                                required={true}
                                                            />
                                                        </Stack>
                                                    </Grid>

                                                    <Grid item xs={12} sm={12}>
                                                        <Stack spacing={1.25}>
                                                            <InputLabel htmlFor="paypal_address">File attachment</InputLabel>
                                                            <Stack spacing={1.5} alignItems="flex-start">
                                                                <UploadSingleFile
                                                                    setFieldValue={setFileFieldValue}
                                                                    file={formData.files}
                                                                    sx={{ maxWidth: '450px' }}
                                                                />
                                                            </Stack>
                                                        </Stack>
                                                    </Grid>
                                                </>
                                            )
                                        }

                                    </Grid>
                                )
                            }
                        </CardContent>
                        <Divider />
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="error" size="medium" onClick={handleClose}>
                                Cancel
                            </Button>

                            {
                                (row?.status !== "Closed") && (
                                    <>
                                        <Button variant="contained" color="secondary" size="medium" onClick={handleCloseTicket}>
                                            Close Ticket
                                        </Button>
                                        <Button variant="contained" startIcon={<SendOutlined />} size="medium" type="submit" disabled={apiCalling}>
                                            Send
                                        </Button>
                                    </>
                                )
                            }
                        </Stack>
                    </form>
                </MainCard>
            </Modal>

            {
                (showConfirmModal) ? (
                    <>
                        <ConfirmDialog
                            open={showConfirmModal}
                            setOpen={setShowConfirmModal}
                            title={APP_NAME}
                            content={confirmText}
                            textYes={`Yes`}
                            textNo={`No`}
                            onClickYes={() => onClickYesConfirm()}
                            onClickNo={() => onClickNoConfirm()}
                        />
                    </>
                ) : (
                    <></>
                )
            }
        </>
    );
};

export default TicketDetailModal;
