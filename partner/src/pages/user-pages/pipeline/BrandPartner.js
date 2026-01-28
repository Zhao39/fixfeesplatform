import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    styled,
    Paper,
    Modal,
    Fade,
    Backdrop,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Stack
} from "@mui/material";
import { useState } from "react"
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { APP_NAME, BASE_API_URL, BRAND_PARTNER_STATUS_LIST, MERCHANT_COLORS, PARTNER_COLORS } from "config/constants";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#333',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    marginBottom: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: '18px',
    // ...theme.applyStyles('dark', {
    //     backgroundColor: 'green',
    //     color: 'white'
    // }),
}));

const BrandPartner = (props) => {
    const { partnerData, handlePartnerProspectAdd, openAddModal, setOpenAddModal, handleRemovePartnerProspect } = props;

    const [openModal, setOpenModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [mData, setMData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    // Function to open the modal with selected merchant data
    const handleOpenModal = (merchant) => {
        setSelectedPartner(merchant);
        setOpenModal(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedPartner(null);
    };

    const handleClickAddBtn = () => {
        setMData({
            name: "",
            email: "",
            phone: ""
        })
        setOpenAddModal(true);
    }


    return (
        <>
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
                <Grid item xs={2}>
                    <Item
                        style={{
                            background: PARTNER_COLORS["3"],
                            color: 'black',
                            fontSize: '15px',
                            filter: `drop-shadow(0px 2px 5px white)`
                        }}
                    >
                        Prospects
                    </Item>
                    <Card style={{ marginBottom: '20px' }}>
                        <Button style={{ width: '100%' }} onClick={handleClickAddBtn}>
                            ADD
                        </Button>
                    </Card>
                    {Array.isArray(partnerData) ? (
                        partnerData
                            .filter(item => parseInt(item.status) === 3)
                            .map((item, index) => {
                                return (
                                    <Card
                                        key={index}
                                        sx={{
                                            background: PARTNER_COLORS["3"],
                                            color: 'black',
                                            marginBottom: 2,
                                            borderRadius: '10px',
                                            boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)',
                                        }}
                                    >
                                        <CardContent sx={{ padding: '5px !important' }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between' // Push items to edges
                                                }}
                                            >
                                                <Avatar
                                                    onClick={() => handleOpenModal(item)} src="/assets/img/user-avatar.png" alt={item.email} sx={{ marginRight: 2 }} />

                                                <Stack direction={`column`} spacing={0}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                        {item.email}
                                                    </Typography>
                                                </Stack>

                                                {/* Delete Icon */}
                                                <DeleteOutlinedIcon
                                                    sx={{
                                                        cursor: 'pointer',
                                                        color: 'black'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedPartner(item)
                                                        setDeleteModal(true)
                                                    }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })
                    ) : (
                        <></>
                    )}
                </Grid>
                <Grid item xs={2}>
                    <Item style={{ background: PARTNER_COLORS["2"], color: 'black', fontSize: '15px', filter: `drop-shadow(0px 2px 5px yellow)` }}>Opt-In</Item>
                    {
                        Array.isArray(partnerData) ? partnerData.filter(item => parseInt(item.status) === 2).map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: PARTNER_COLORS["2"], color: 'black', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.email} sx={{ marginRight: 2 }} />

                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.email}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>)
                        }) : <></>
                    }
                </Grid>
                <Grid item xs={2}>
                    <Item style={{ background: PARTNER_COLORS["1"], color: 'black', fontSize: '15px', filter: `drop-shadow(0px 2px 5px green)` }}>Active</Item>
                    {
                        Array.isArray(partnerData) ? partnerData.filter(item => item.status == "1").map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: PARTNER_COLORS["1"], color: 'black', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.email} sx={{ marginRight: 2 }} />

                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.email}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>)
                        }) : <></>
                    }
                </Grid>
                <Grid item xs={2}>
                    <Item style={{ background: PARTNER_COLORS["0"], color: 'black', fontSize: '15px', filter: `drop-shadow(0px 2px 5px red)` }}>Inactive</Item>
                    {
                        Array.isArray(partnerData) ? partnerData.filter(item => parseInt(item.status) === 0).map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: PARTNER_COLORS["0"], color: 'black', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.email} sx={{ marginRight: 2 }} />

                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.email}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>)
                        }) : <></>
                    }
                </Grid>

            </Grid>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '10px'
                    }}>
                        {selectedPartner && (
                            <>
                                <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                                    Brand Partner Details
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Email:</strong> {selectedPartner.email}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Name:</strong> {selectedPartner.name}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Phone:</strong> {selectedPartner.business_phone}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Stage:</strong> {BRAND_PARTNER_STATUS_LIST[selectedPartner.status]}
                                </Typography>
                                {/* Add more details about the merchant as needed */}
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>
            <Dialog
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
            >
                <DialogTitle>Add Prospects</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To add new Prospects, please enter your email address here. You can add the email manually.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={mData.name}
                        onChange={(e) => setMData({ ...mData, name: e.target.value })}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={mData.email}
                        onChange={(e) => setMData({ ...mData, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        fullWidth
                        variant="standard"
                        value={mData.phone}
                        onChange={(e) => setMData({ ...mData, phone: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
                    <Button type="button" onClick={() => handlePartnerProspectAdd(mData)}>Add</Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog
                open={deleteModal}
                setOpen={setDeleteModal}
                title={APP_NAME}
                content={'Are you sure you want to delete?'}
                textYes={`Yes`}
                textNo={`No`}
                onClickYes={() => {
                    handleRemovePartnerProspect(selectedPartner);
                    setSelectedPartner(null);
                    setDeleteModal(false);
                }}
                onClickNo={() => {
                    setDeleteModal(false);
                    setSelectedPartner(null);
                }}
            />
        </>
    )
}

export default BrandPartner;