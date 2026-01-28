// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, CardContent, Divider, Grid, InputLabel, Modal, OutlinedInput, Stack, TextField } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { console_log, empty, get_data_value, get_utc_timestamp_ms } from 'utils/misc';
import { showToast } from 'utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import { apiUserSubmitTicket } from 'services/userTicketService';
import { SocketContext } from 'contexts/socket';
import { ENVIRONMENT } from 'config/constants';

const TicketAddModal = (props) => {
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

    const defaultFormData = {
        title: "",
        description: "",
    }
    const [formData, setFormData] = useState(defaultFormData);
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
    }

    const validateForm = () => {
        let isValid = true
        //console.log("formData:::", formData)
        const form_data = { ...formData }
        const title = form_data['title'].trim()
        if (title === "") {
            showToast("Subject can not be empty", "error")
            return false;
        }
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
            title: form_data.title,
            description: form_data.description,
        }
        const uploadFile = formData?.files ? formData?.files[0] : null
        setApiCalling(true)
        const apiRes = await apiUserSubmitTicket(payload, uploadFile)
        setApiCalling(false)
        if (apiRes['status'] === '1') {
            const ticketid = apiRes['data']['ticketid']
            emitNewTicketNewMessage(ticketid)
            setTableTimestamp(get_utc_timestamp_ms())
            showToast(apiRes.message, 'success');
            handleClose()
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

    const [lastPostId, setLastPostId] = useState(0);

    const addSocketListener = () => { }

    const unbindSocketListener = () => { }

    useEffect(() => {
        if (!empty(socket)) {
            addSocketListener();
        }
        return () => {
            // before the component is destroyed
            // unbind all event handlers used in this component
            unbindSocketListener()
        };
    }, [socket]);

    const emitNewTicketNewMessage = (ticketid) => {
        socket.emit("submit_new_ticket_message", {
            ...socketHeader,
            ticketid: ticketid,
            environment: ENVIRONMENT.BUSINESS
        });
    };
    ///////////////////////////end socket part/////////////////////////////

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={title} modal darkTitle content={false}>
                    <form onSubmit={handleSubmit}>
                        <CardContent sx={{ maxWidth: 'calc(100vw - 50px)', width: '1000px' }}>
                            <Grid container spacing={3} direction="column">
                                {/* <Grid item xs={12} sm={12}>
                                    <Alert color="warning" variant="border" icon={false} sx={{ justifyContent: 'center' }}>
                                        <AlertTitle sx={{ textAlign: 'center' }}>
                                            If you have any questions or you need any assistance, please send us a support ticket and we will get back to you as soon as possible. <br />
                                            We will notify you in email and our response can be found at the top of your backoffice where the message icon is.<br />

                                            Be sure to include a detailed description of your question or issue, you can even attach files.<br />
                                            We answer customer tickets Monday to Friday / 10am - 5pm PST.
                                        </AlertTitle>
                                    </Alert>
                                </Grid> */}
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="title">Subject</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={(e) => handleChangeText(e, "title")}
                                            placeholder="Enter subject"
                                            inputProps={{
                                                type: 'text'
                                            }}
                                            required={true}
                                        // autoFocus
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="description">Description</InputLabel>
                                        <TextField
                                            id="description"
                                            fullWidth
                                            multiline
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => handleChangeText(e, "description")}
                                            placeholder="Enter description"
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
                            </Grid>
                        </CardContent>
                        <Divider />
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="error" size="medium" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" size="medium" type="submit" disabled={apiCalling}>
                                Submit
                            </Button>
                        </Stack>
                    </form>
                </MainCard>
            </Modal>
        </>
    );
};

export default TicketAddModal;
