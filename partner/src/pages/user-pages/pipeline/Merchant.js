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
import { useEffect, useState } from "react"
import axios from 'utils/axios';
import { APP_NAME, BASE_API_URL, MERCHANT_COLORS, MERCHANT_STATUS_LIST } from "config/constants";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
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



const Merchant = (props) => {
    const { merchantData, handleMerchantProspectAdd, openAddEmailModal, setOpenAddEmailModal, handleRemoveMerchantProspect } = props;

    const [openModal, setOpenModal] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [mData, setMData] = useState({
        name: "",
        email: "",
        company_name: "",
        phone: ""
    });
    const [deleteModal, setDeleteModal] = useState(false);

    // Function to open the modal with selected merchant data
    const handleOpenModal = (merchant) => {
        setSelectedMerchant(merchant);
        setOpenModal(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedMerchant(null);
    };

    const handleClickAddBtn = () => {
        setMData({
            name: "",
            email: "",
            company_name: "",
            phone: ""
        })
        setOpenAddEmailModal(true);
    }


    return (
        <>
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
                <Grid item xs={2}>
                    <Item
                        style={{
                            background: MERCHANT_COLORS["-1"],
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
                    {Array.isArray(merchantData) ? (
                        merchantData
                            .filter(item => item.status === -1)
                            .map((item, index) => {
                                return (
                                    <Card
                                        key={index}
                                        sx={{
                                            background: MERCHANT_COLORS["-1"],
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
                                                    onClick={() => handleOpenModal(item)} src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />
                                                <Stack direction={`column`} spacing={0}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                        {item.business_email}
                                                    </Typography>
                                                </Stack>

                                                {/* Delete Icon */}
                                                <DeleteOutlinedIcon
                                                    sx={{
                                                        cursor: 'pointer',
                                                        color: 'black'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedMerchant(item)
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
                    <Item style={{ background: MERCHANT_COLORS["0"], color: 'black', fontSize: '15px', filter: `drop-shadow(0px 2px 5px yellow)` }}>Onboarding</Item>
                    {
                        Array.isArray(merchantData) ? merchantData.filter(item => item.status === 0).map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: MERCHANT_COLORS["0"], color: 'black', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />
                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.business_email}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>)
                        }) : <></>
                    }
                </Grid>
                <Grid item xs={2}>
                    <Item style={{ background: MERCHANT_COLORS["1"], color: 'black', fontSize: '15px', filter: `drop-shadow(0px 2px 5px orange)` }}>Underwriting</Item>
                    {
                        Array.isArray(merchantData) ? merchantData.filter(item => item.status === 1).map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: MERCHANT_COLORS["1"], color: 'black', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}

                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.business_email}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>)
                        }) : <></>
                    }
                </Grid>
                <Grid item xs={2}>
                    <Item style={{ background: MERCHANT_COLORS["2"], color: 'white', fontSize: '15px', filter: `drop-shadow(0px 2px 5px blue)` }}>Install</Item>
                    {
                        Array.isArray(merchantData) ? merchantData.filter(item => item.status === 2).map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: MERCHANT_COLORS["2"], color: 'white', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.business_email}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>)
                        }) : <></>
                    }
                </Grid>
                <Grid item xs={2}>
                    <Item style={{ background: MERCHANT_COLORS["3"], color: 'white', fontSize: '15px', filter: `drop-shadow(0px 2px 5px green)` }}>Active Merchant</Item>
                    {
                        Array.isArray(merchantData) ? merchantData.filter(item => item.status === 3).map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: MERCHANT_COLORS["3"], color: 'white', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.business_email}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>)
                        }) : <></>
                    }
                </Grid>
                <Grid item xs={2}>
                    <Item style={{ background: MERCHANT_COLORS["4"], color: 'white', fontSize: '15px', filter: `drop-shadow(0px 2px 5px red)` }}>Closed Merchant</Item>
                    {
                        Array.isArray(merchantData) ? merchantData.filter(item => item.status === 4).map((item, index) => {
                            return (
                                <Card
                                    key={index}
                                    sx={{ background: MERCHANT_COLORS["4"], color: 'white', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <CardContent sx={{ padding: '5px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* Avatar on the left */}
                                            <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                            <Stack direction={`column`} spacing={0}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                                    {item.business_email}
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
                        {selectedMerchant && (
                            <>
                                <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                                    Merchant Details
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Email:</strong> {selectedMerchant.business_email}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Name:</strong> {selectedMerchant.name}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Phone:</strong> {selectedMerchant.business_phone}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Company Name:</strong> {selectedMerchant.business_legal_name}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Stage:</strong> {MERCHANT_STATUS_LIST[selectedMerchant.status]}
                                </Typography>
                                {/* Add more details about the merchant as needed */}
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>
            <Dialog
                open={openAddEmailModal}
                onClose={() => setOpenAddEmailModal(false)}
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
                        id="company_name"
                        name="company_name"
                        label="Company Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={mData.company_name}
                        onChange={(e) => setMData({ ...mData, company_name: e.target.value })}
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
                    <Button onClick={() => setOpenAddEmailModal(false)}>Cancel</Button>
                    <Button type="button" onClick={() => handleMerchantProspectAdd(mData)}>Add</Button>
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
                    handleRemoveMerchantProspect(selectedMerchant);
                    setSelectedMerchant(null);
                    setDeleteModal(false);
                }}
                onClickNo={() => {
                    setDeleteModal(false);
                    setSelectedMerchant(null);
                }}
            />
        </>
    )
}

export default Merchant;