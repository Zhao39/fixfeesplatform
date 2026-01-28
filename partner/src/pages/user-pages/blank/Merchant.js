import { Avatar, Box, Card, CardContent, Grid, Typography, styled, Paper } from "@mui/material";
import { useState } from "react"

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
    const { merchantData } = props;
    return (
        <Grid container spacing={2} style={{ marginTop: "20px" }}>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'white', color: 'red' }}>Prospects</Item>

            </Grid>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'yellow', color: '#9605fc' }}>Onboarding</Item>
                {
                    Array.isArray(merchantData) ? merchantData.filter(item => item.status === 3).map((item, index) => {
                        return (
                            <Card
                                key={index}
                                sx={{ backgroundColor: 'yellow', color: '#9605fc', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}>
                                <CardContent sx={{ padding: '5px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {/* Avatar on the left */}
                                        <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                        {/* Email text */}
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                            {item.business_email}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>)
                    }) : <></>
                }
            </Grid>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'orange', color: '#9605fc' }}>Underwriting</Item>
                {
                    Array.isArray(merchantData) ? merchantData.filter(item => item.status === 2).map((item, index) => {
                        return (
                            <Card key={index} sx={{ backgroundColor: 'orange', color: '#9605fc', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}>
                                <CardContent sx={{ padding: '5px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {/* Avatar on the left */}
                                        <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                        {/* Email text */}
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                            {item.business_email}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>)
                    }) : <></>
                }
            </Grid>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'blue', color: 'white' }}>Install</Item>
                {
                    Array.isArray(merchantData) ? merchantData.filter(item => item.status === 1).map((item, index) => {
                        return (
                            <Card key={index} sx={{ backgroundColor: 'blue', color: 'white', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}>
                                <CardContent sx={{ padding: '5px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {/* Avatar on the left */}
                                        <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                        {/* Email text */}
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                            {item.business_email}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>)
                    }) : <></>
                }
            </Grid>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'green', color: 'white' }}>Active Merchant</Item>
                {
                    Array.isArray(merchantData) ? merchantData.filter(item => item.status === 0).map((item, index) => {
                        return (
                            <Card key={index} sx={{ backgroundColor: 'green', color: 'white', marginBottom: 2, borderRadius: '10px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}>
                                <CardContent sx={{ padding: '5px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {/* Avatar on the left */}
                                        <Avatar src="/assets/img/user-avatar.png" alt={item.business_email} sx={{ marginRight: 2 }} />

                                        {/* Email text */}
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                                            {item.business_email}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>)
                    }) : <></>
                }
            </Grid>
            <Grid item xs={2}>
                <Item>Closed Merchant</Item>
            </Grid>
        </Grid>
    )
}

export default Merchant;