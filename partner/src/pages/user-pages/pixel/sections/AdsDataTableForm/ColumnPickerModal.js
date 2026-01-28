// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, CardContent, Divider, Grid, IconButton, Modal, Stack, TextField, Typography } from '@mui/material';

// project imports

// assets
import { Fragment, useEffect, useState } from 'react';
import { console_log, copyObject, get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Draggable } from "react-smooth-dnd";
import { arrayMoveImmutable, arrayMoveMutable } from "array-move";
import MainCard from 'components/MainCard';
import { HolderOutlined, MinusOutlined, PlusOutlined, PushpinOutlined, SearchOutlined } from '@ant-design/icons';
import { AD_TABLE_COLUMN_LIST } from 'config/ad_constants';
import { createStyles, makeStyles } from '@mui/styles';
import { checkTableColumnIsDefault, filterTableColumnInfo, getCurrentColumnPresetData, getTableColumnInfo } from 'utils/ad-table-utils';
import ColumnPresetModal from './ColumnPresetModal';
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

const ColumnPickerModal = (props) => {
    const { open = false, setOpen, adsTableFormData, saveTableFormData } = props

    const theme = useTheme();
    const dispatch = useDispatch()
    const classes = useStyles();

    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        revokeColumnPreset()
        setOpen(false)
    }

    const applyCurrentPreset = () => {
        setOpen(false)
    }

    const saveAsNewPreset = () => {
        setShowColumnPresetModal(true)
    }

    const currentColumnPresetData = getCurrentColumnPresetData(adsTableFormData)
    const [revisionAdTablePresetColumns, setRevisionAdTablePresetColumns] = useState([])

    useEffect(() => {
        setRevisionAdTablePresetColumns(copyObject(adsTableFormData.adTablePresetColumns))
    }, [])

    const updateAdTablePresetColumns = (columnPresetName, newColumnList) => {
        const adTablePresetColumns = copyObject(adsTableFormData.adTablePresetColumns)
        for (let k in adTablePresetColumns) {
            const columnInfo = adTablePresetColumns[k]
            if (columnInfo.value === columnPresetName) {
                adTablePresetColumns[k]['column_list'] = newColumnList
            }
        }
        return adTablePresetColumns
    }

    const removeItemFromColumnPreset = (value) => {
        const column_list = currentColumnPresetData.column_list
        const newColumnList = []
        for (let k in column_list) {
            if (value !== column_list[k]) {
                newColumnList.push(column_list[k])
            }
        }
        const adTablePresetColumns = updateAdTablePresetColumns(adsTableFormData['columnPresetName'], newColumnList)
        const ads_table_form_data = { ...adsTableFormData, adTablePresetColumns: adTablePresetColumns }
        saveTableFormData(ads_table_form_data)
    }

    const addItemToColumnPreset = (value) => {
        const column_list = currentColumnPresetData.column_list
        const newColumnList = []
        for (let k in column_list) {
            if (value !== column_list[k]) {
                newColumnList.push(column_list[k])
            }
        }
        newColumnList.push(value)
        const adTablePresetColumns = updateAdTablePresetColumns(adsTableFormData['columnPresetName'], newColumnList)
        const ads_table_form_data = { ...adsTableFormData, adTablePresetColumns: adTablePresetColumns }
        saveTableFormData(ads_table_form_data)
    }

    const revokeColumnPreset = () => {
        const adTablePresetColumns = [...revisionAdTablePresetColumns]
        const ads_table_form_data = { ...adsTableFormData, adTablePresetColumns: adTablePresetColumns }
        saveTableFormData(ads_table_form_data)
    }

    const [searchKey, setSearchKey] = useState("")

    ///////////// drag and drop /////////////////////////////
    const defaultColumnList = currentColumnPresetData.column_list.filter((v) => checkTableColumnIsDefault(v))
    const movableColumnList = currentColumnPresetData.column_list.filter((v) => !checkTableColumnIsDefault(v))
    const tableColumnList = {
        defaultColumnList: defaultColumnList,
        movableColumnList: movableColumnList
    }

    const onDrop = ({ removedIndex, addedIndex }) => {
        const newMovableColumnList = arrayMoveImmutable(movableColumnList, removedIndex, addedIndex);
        tableColumnList.movableColumnList = newMovableColumnList

        const newColumnList = [...defaultColumnList, ...newMovableColumnList]
        const adTablePresetColumns = updateAdTablePresetColumns(adsTableFormData['columnPresetName'], newColumnList)
        const ads_table_form_data = { ...adsTableFormData, adTablePresetColumns: adTablePresetColumns }
        saveTableFormData(ads_table_form_data)
    }


    //////////////////////////////////////////////////////////////////
    const [showColumnPresetModal, setShowColumnPresetModal] = useState(false)
    const saveColumnPreset = (presetData)=>{        
        const adTablePresetColumns = [...revisionAdTablePresetColumns]
       
        const newColumnPresetColumns = [
            ...tableColumnList.defaultColumnList,
            ...tableColumnList.movableColumnList
        ] 
        const newColumnPresetData = {
            value: presetData.text,
            text: presetData.text,
            desc: presetData.desc,
            column_list: newColumnPresetColumns,
            is_custom: true
        }

        adTablePresetColumns.push(newColumnPresetData)
        const ads_table_form_data = { ...adsTableFormData, adTablePresetColumns: adTablePresetColumns }
        saveTableFormData(ads_table_form_data)

        showToast("Saved new preset", "success")
        setOpen(false)
        return true
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title="Select Columns" modal darkTitle content={false} >
                    <CardContent sx={{ maxWidth: '100%', width: '600px' }} >
                        <Grid container spacing={3} direction="column">
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="column_keyword"
                                    value={searchKey}
                                    placeholder="Search columns..."
                                    inputProps={{ type: 'search' }}
                                    InputProps={{
                                        startAdornment: <SearchOutlined />
                                    }}
                                    onChange={(e) => setSearchKey(e.target.value)}
                                />
                            </Grid>
                            <Grid item container xs={12} spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>Included Items</Typography>
                                    <Box className="included-item-list">
                                        <Stack direction={`column`}>
                                            <Stack direction={`column`}>
                                                {
                                                    defaultColumnList.map((value, index) => {
                                                        const item = getTableColumnInfo(value)
                                                        const searchMatched = filterTableColumnInfo(item, searchKey)

                                                        return (
                                                            <Fragment key={value}>
                                                                {
                                                                    (item && searchMatched) ? (
                                                                        <Box className={classes.columnListItem}>
                                                                            <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                                                                                <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                                                                    <IconButton disabled={checkTableColumnIsDefault(item.value)} color={`${checkTableColumnIsDefault(item.value) ? 'secondary' : 'error'}`} onClick={() => removeItemFromColumnPreset(item.value)}>
                                                                                        {
                                                                                            checkTableColumnIsDefault(item.value) ? (
                                                                                                <><PushpinOutlined /></>
                                                                                            ) : (
                                                                                                <><MinusOutlined /></>
                                                                                            )
                                                                                        }
                                                                                    </IconButton>
                                                                                    <Typography variant="h6">{item.text}</Typography>
                                                                                </Stack>
                                                                                <Box>
                                                                                    <Box className={checkTableColumnIsDefault(item.value) ? classes.moveIconDisabled : classes.moveIcon}>
                                                                                        <HolderOutlined />
                                                                                    </Box>
                                                                                </Box>
                                                                            </Stack>
                                                                        </Box>
                                                                    ) : (
                                                                        <></>
                                                                    )
                                                                }
                                                            </Fragment>
                                                        )
                                                    })
                                                }
                                            </Stack>
                                            <Stack direction={`column`}>
                                                <Container getGhostParent={()=>{return document.body}} dragHandleSelector=".drag-handle" nonDragAreaSelector=".non-drag-handle" lockAxis="y" onDrop={onDrop}>
                                                    {
                                                        tableColumnList.movableColumnList.map((value, index) => {
                                                            const item = getTableColumnInfo(value)
                                                            const searchMatched = filterTableColumnInfo(item, searchKey)
                                                            return (
                                                                <Draggable key={value}>
                                                                    {
                                                                        (item && searchMatched) ? (
                                                                            <Box className={classes.columnListItem}>
                                                                                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                                                                                    <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                                                                        <IconButton disabled={checkTableColumnIsDefault(item.value)} color={`${checkTableColumnIsDefault(item.value) ? 'secondary' : 'error'}`} onClick={() => removeItemFromColumnPreset(item.value)}>
                                                                                            {
                                                                                                checkTableColumnIsDefault(item.value) ? (
                                                                                                    <><PushpinOutlined /></>
                                                                                                ) : (
                                                                                                    <><MinusOutlined /></>
                                                                                                )
                                                                                            }
                                                                                        </IconButton>
                                                                                        <Typography variant="h6">{item.text}</Typography>
                                                                                    </Stack>
                                                                                    <Box className={`${checkTableColumnIsDefault(item.value) ? 'non-drag-handle' : 'drag-handle'}`}>
                                                                                        <Box className={checkTableColumnIsDefault(item.value) ? classes.moveIconDisabled : classes.moveIcon}>
                                                                                            <HolderOutlined />
                                                                                        </Box>
                                                                                    </Box>
                                                                                </Stack>
                                                                            </Box>
                                                                        ) : (
                                                                            <></>
                                                                        )
                                                                    }
                                                                </Draggable>
                                                            )
                                                        })
                                                    }
                                                </Container>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>More Items</Typography>
                                    <Box className="included-item-list">
                                        <Stack direction={`column`}>
                                            {
                                                AD_TABLE_COLUMN_LIST.map((item, index) => {
                                                    const skip = currentColumnPresetData.column_list.includes(item.value)
                                                    const searchMatched = filterTableColumnInfo(item, searchKey)
                                                    return (
                                                        <Fragment key={index}>
                                                            {
                                                                (!skip && searchMatched) ? (
                                                                    <Box className={classes.columnListItem}>
                                                                        <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                                                                            <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                                                                <IconButton disabled={false} color={`success`} onClick={() => addItemToColumnPreset(item.value)}>
                                                                                    <><PlusOutlined /></>
                                                                                </IconButton>
                                                                                <Typography variant="h6">{item.text}</Typography>
                                                                            </Stack>
                                                                            <Box></Box>
                                                                        </Stack>
                                                                    </Box>
                                                                ) : (
                                                                    <></>
                                                                )
                                                            }
                                                        </Fragment>
                                                    )
                                                })
                                            }
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>

                    <Divider />

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                        <Button color="primary" size="medium" onClick={() => saveAsNewPreset()}>
                            Save as new preset
                        </Button>
                        <Button color="primary" size="medium" onClick={() => applyCurrentPreset()}>
                            Apply to current preset
                        </Button>
                        <Button color="secondary" size="medium" onClick={handleClose}>
                            Cancel
                        </Button>
                    </Stack>
                </MainCard>
            </Modal>

            <ColumnPresetModal
                open={showColumnPresetModal}
                setOpen={setShowColumnPresetModal}
                saveColumnPreset={(d) => saveColumnPreset(d)}
            />
        </>
    );
};

export default ColumnPickerModal;
