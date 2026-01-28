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

const BrandPartner = (props) => {
    return (
        <Grid container spacing={2} style={{ marginTop: "20px" }}>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'white', color: 'red' }}>Prospects</Item>

            </Grid>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'yellow', color: '#9605fc' }}>Opt-In</Item>
            </Grid>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'orange', color: '#9605fc' }}>Active</Item>
            </Grid>
            <Grid item xs={2}>
                <Item style={{ backgroundColor: 'blue', color: 'white' }}>Inactive</Item>
            </Grid>
        </Grid>
    )
}

export default BrandPartner;