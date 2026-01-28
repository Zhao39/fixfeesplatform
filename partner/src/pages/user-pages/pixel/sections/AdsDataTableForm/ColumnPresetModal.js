// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, CardContent, Chip, Divider, FormHelperText, Grid, IconButton, InputLabel, Modal, OutlinedInput, Stack, TextField, Typography } from '@mui/material';

// project imports

// assets
import { Fragment, useEffect, useState } from 'react';
import { console_log, copyObject, empty, get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Draggable } from "react-smooth-dnd";
import { arrayMoveImmutable, arrayMoveMutable } from "array-move";
import MainCard from 'components/MainCard';
import { HolderOutlined, MinusOutlined, PlusOutlined, PushpinOutlined, SearchOutlined } from '@ant-design/icons';
import { AD_TABLE_COLUMN_LIST } from 'config/ad_constants';
import { createStyles, makeStyles } from '@mui/styles';
import { checkTableColumnIsDefault, filterTableColumnInfo, getCurrentColumnPresetData, getTableColumnInfo } from 'utils/ad-table-utils';
import { showToast } from 'utils/utils';

const useStyles = makeStyles((theme) =>
    createStyles({
        columnListItem: {
            flex: 1,
            paddingTop: '4px',
            paddingBottom: '4px',
            borderBottom: '1px solid rgba(127,127,127,0.5)'
        },
        moveIcon: {
            padding: '6px 10px',
            opacity: 1,
            cursor: 'move'
        },
        moveIconDisabled: {
            padding: '6px 10px',
            opacity: 0.5,
            cursor: 'not-allowed'
        },
    })
);

const ColumnPresetModal = (props) => {
    const { open = false, setOpen, selectedCustomPreset = {}, saveColumnPreset } = props

    const theme = useTheme();
    const dispatch = useDispatch()
    const classes = useStyles();

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

    const defaultFormData = {
        value: "",
        text: "",
        desc: "",
        ...selectedCustomPreset
    }
    const [formData, setFormData] = useState(defaultFormData)

    const handleChange = (e) => {
        const v = e.target.value
        const field_name = e.target.name

        const form_data = { ...formData }
        form_data[field_name] = v
        setFormData(form_data)
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        if(empty(formData['text'])) {
            showToast("Please enter Name of Preset", "error")
            return false
        }
        saveColumnPreset({...formData})
        handleClose()
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title="Save Preset" modal darkTitle content={false} >
                    <form onSubmit={onSubmit}>
                        <CardContent sx={{ maxWidth: '100%', width: '600px' }} >
                            <Grid container spacing={3} direction="column">
                                <Grid item xs={12}>
                                    <Stack spacing={1}>
                                        <InputLabel htmlFor="preset_name">Preset Name <Typography variant="h6" component="span" color="error">*</Typography></InputLabel>
                                        <OutlinedInput
                                            id="preset_name"
                                            type="text"
                                            value={formData.text}
                                            name="text"
                                            onChange={handleChange}
                                            placeholder=""
                                            fullWidth
                                            required={true}
                                            inputProps={{ required: true }}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack spacing={1}>
                                        <InputLabel htmlFor="preset_desc">Preset Description</InputLabel>
                                        <OutlinedInput
                                            id="preset_desc"
                                            type="text"
                                            value={formData.desc}
                                            name="desc"
                                            onChange={handleChange}
                                            placeholder=""
                                            fullWidth
                                            multiline
                                            rows={3}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>

                        <Divider />

                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="primary" size="medium" type="submit">
                                Save
                            </Button>
                            <Button color="secondary" size="medium" type="button" onClick={handleClose}>
                                Cancel
                            </Button>
                        </Stack>
                    </form>

                </MainCard>
            </Modal>
        </>
    );
};

export default ColumnPresetModal;
