// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, CardContent, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, Grid, IconButton, InputLabel, Modal, OutlinedInput, Stack, TextField, Typography } from '@mui/material';

// project imports

// assets
import { Fragment, useEffect, useState } from 'react';
import { addItemToArray, copyObject, empty, get_data_value, removeItemFromArray } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Draggable } from "react-smooth-dnd";
import { arrayMoveImmutable } from "array-move";
import MainCard from 'components/MainCard';
import { HolderOutlined, MinusOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { createStyles, makeStyles } from '@mui/styles';
import { STATS_BLOCK_LIST } from 'config/stats_constants';
import { setSettingData } from 'store/reducers/settingPersist';
import { checkSummaryBlockIsActive, getStatsColumnInfo, getSummaryBlockInfo, isSummaryColumnSearchMatched } from 'utils/ad-stats-utils';
import { showToast } from 'utils/utils';

const useStyles = makeStyles((theme) =>
    createStyles({
        columnListItem: {
            flex: 1,
            paddingTop: '4px',
            paddingBottom: '4px',
            borderBottom: '1px solid rgba(127,127,127,0.5)',
            marginBottom: '16px',
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

const SectionCreateModal = (props) => {
    const { open = false, setOpen, mode = "create", blockData } = props

    const theme = useTheme();
    const dispatch = useDispatch()
    const classes = useStyles();

    const userDataStore = useSelector((x) => x.auth);
    const userId = userDataStore?.user?.id
    const settingPersistDataStore = useSelector((x) => x.settingPersist);
    const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
    const defaultBlockData = {
        blockList: [...STATS_BLOCK_LIST]
    }
    const summaryBlockData = get_data_value(settingPersistDataStore, 'summaryBlockData', defaultBlockData)
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    const saveBlockData = (blockData) => {
        const block_data = copyObject(blockData)
        const settingData = {
            ...settingPersistDataStore,
            summaryBlockData: {
                ...block_data
            }
        }
        dispatch(setSettingData(settingData))
    }

    /////////////////////////////////////////////////////////////////////////
    const defaultFormData = mode === "create" ?
        {
            text: "",
            column_list: [],
        } :
        {
            ...blockData
        }

    const [formData, setFormData] = useState({ ...defaultFormData })
    const [searchKey, setSearchKey] = useState("")

    const handleChange = (e) => {
        const v = e.target.value
        const field_name = e.target.name
        const form_data = { ...formData }
        form_data[field_name] = v
        setFormData(form_data)
    }

    const onChangeColumnCheckbox = (columnInfo, event) => {
        const value = columnInfo.value
        const form_data = { ...formData }
        let columnList = copyObject(form_data.column_list)
        if (event.target.checked) {
            columnList = addItemToArray(columnList, value)
        } else {
            columnList = removeItemFromArray(columnList, value)
        }
        form_data.column_list = columnList
        setFormData(form_data)
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        if (empty(formData['text'])) {
            showToast("Please enter Title of section", "error")
            return false
        }
        const column_list = formData.column_list
        if (column_list.length === 0) {
            showToast("Please choose columns", "error")
            return false
        }

        const summary_block_data = copyObject(summaryBlockData)
        let blockList = summary_block_data.blockList
        if (mode === "create") {
            const oldBlockData = blockList.find((item) => item.value === formData['text'])
            if (oldBlockData) {
                showToast("The section with same title already exists", "error")
                return false
            }
            const newBlock = {
                value: formData['text'],
                text: formData['text'],
                column_list: [...formData['column_list']],
                is_custom: true
            }
            blockList.push(newBlock)
        } else {
            const oldBlockData = blockList.find((item) => item.value === formData['text'])
            if (oldBlockData && oldBlockData.value !== blockData['value']) {
                showToast("The section with same title already exists", "error")
                return false
            }
            const newBlock = {
                value: formData['text'],
                text: formData['text'],
                column_list: [...formData['column_list']],
                is_custom: true
            }
            for (let k in blockList) {
                if (blockList[k]['value'] === blockData['value']) {
                    blockList[k] = newBlock
                }
            }
        }

        summary_block_data.blockList = blockList
        saveBlockData(summary_block_data)
        handleClose()
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={`${mode === "create" ? "Add": "Edit"} custom section`} modal darkTitle content={false}>
                    <form onSubmit={onSubmit}>
                        <CardContent sx={{ maxWidth: '100%', width: '600px' }}>
                            <Grid container spacing={3} direction="column">
                                <Grid item container xs={12} spacing={3}>
                                    <Grid item xs={12}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="section_title">Title <Typography variant="h6" component="span" color="error">*</Typography></InputLabel>
                                            <OutlinedInput
                                                id="section_title"
                                                type="text"
                                                value={formData.text}
                                                name="text"
                                                onChange={handleChange}
                                                placeholder="Type title here"
                                                fullWidth
                                                required={true}
                                                inputProps={{ required: true }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            name="column_keyword"
                                            value={searchKey}
                                            placeholder="Search for metric"
                                            inputProps={{ type: 'search' }}
                                            InputProps={{
                                                startAdornment: <SearchOutlined />
                                            }}
                                            onChange={(e) => setSearchKey(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box className="included-item-list">
                                            <Stack direction={`column`}>
                                                {
                                                    STATS_BLOCK_LIST.map((item, index) => {
                                                        return (
                                                            <Fragment key={index}>
                                                                {
                                                                    (item) ? (
                                                                        <Box className={classes.columnListItem}>
                                                                            <Stack direction={`column`} justifyContent={`flex-start`} alignItems={`flex-start`} spacing={1}>
                                                                                <Typography variant="h6" sx={{ fontWeight: '600' }}>{`${item.text} Metrics`}</Typography>
                                                                                <Box>
                                                                                    <FormControl component="fieldset">
                                                                                        <FormGroup aria-label="position" row>
                                                                                            {
                                                                                                item?.column_list.map((column_value, i) => {
                                                                                                    const columnInfo = getStatsColumnInfo(column_value)
                                                                                                    const searchMatched = isSummaryColumnSearchMatched(columnInfo, searchKey)
                                                                                                    return (
                                                                                                        <Fragment key={i}>
                                                                                                            {
                                                                                                                (columnInfo && searchMatched) ? (
                                                                                                                    <FormControlLabel
                                                                                                                        value={columnInfo.value}
                                                                                                                        control={
                                                                                                                            <Checkbox
                                                                                                                                checked={formData.column_list.includes(columnInfo.value)}
                                                                                                                                onChange={(e) => onChangeColumnCheckbox(columnInfo, e)}
                                                                                                                            />
                                                                                                                        }
                                                                                                                        label={columnInfo.desc}
                                                                                                                        labelPlacement="end"
                                                                                                                        sx={{ ml: 1 }}
                                                                                                                    />
                                                                                                                ) : (<></>)
                                                                                                            }
                                                                                                        </Fragment>
                                                                                                    )
                                                                                                })
                                                                                            }
                                                                                        </FormGroup>
                                                                                    </FormControl>
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
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>

                        <Divider />

                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                            <Button color="primary" size="medium" type="submit">
                                Submit
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

export default SectionCreateModal;
