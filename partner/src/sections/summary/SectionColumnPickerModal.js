// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, CardContent, Divider, Grid, IconButton, Modal, Stack, Typography } from '@mui/material';

// project imports

// assets
import { Fragment, useEffect, useState } from 'react';
import { copyObject, get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Draggable } from "react-smooth-dnd";
import { arrayMoveImmutable } from "array-move";
import MainCard from 'components/MainCard';
import { HolderOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { createStyles, makeStyles } from '@mui/styles';
import { STATS_BLOCK_LIST } from 'config/stats_constants';
import { setSettingData } from 'store/reducers/settingPersist';
import { checkSummaryBlockColumnIsActive, checkSummaryBlockIsActive, getStatsColumnInfo, getSummaryBlockInfo } from 'utils/ad-stats-utils';

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

const SectionColumnPickerModal = (props) => {
    const { open = false, setOpen, blockData = {} } = props

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
    const systemBlockData = getSummaryBlockInfo(blockData.value)
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        revokeBlockList()
        setOpen(false)
    }

    const applyCurrentBlock = () => {
        setOpen(false)
    }

    const [revisionSummaryBlockList, setRevisionSummaryBlockList] = useState([])

    useEffect(() => {
        setRevisionSummaryBlockList(copyObject(summaryBlockData.blockList))
    }, [])

    const saveBlockData = (summary_block_data) => {
        //console.log("saveBlockData blockData::::", blockData)
        const summary_block_data1 = copyObject(summary_block_data)
        const settingData = {
            ...settingPersistDataStore,
            summaryBlockData: {
                ...summary_block_data1
            }
        }
        dispatch(setSettingData(settingData))
    }

    const updateBlockData = (block_data) => {
        const block_data1 = copyObject(block_data)
        const value = block_data1.value
        const summaryBlockData1 = copyObject(summaryBlockData)
        for (let k in summaryBlockData1.blockList) {
            if (value === summaryBlockData1.blockList[k].value) {
                summaryBlockData1.blockList[k] = block_data1
            }
        }
        saveBlockData(summaryBlockData1)
    }

    const removeItemFromBlock = (value) => {
        const blockData1 = copyObject(blockData)
        const columnList = blockData1.column_list
        const newColumnList = columnList.filter((item) => item !== value)
        blockData1.column_list = newColumnList
        updateBlockData(blockData1)
    }

    const addItemToBlock = (value) => {
        const blockData1 = copyObject(blockData)
        const columnList = blockData1.column_list
        columnList.push(value)
        blockData1.column_list = columnList
        updateBlockData(blockData1)
    }

    const revokeBlockList = () => {
        const blockList = [...revisionSummaryBlockList]
        saveBlockData({
            ...summaryBlockData,
            blockList: blockList
        })
    }

    ///////////// drag and drop /////////////////////////////
    const onDrop = ({ removedIndex, addedIndex }) => {
        const blockData1 = copyObject(blockData)
        const columnList = blockData1.column_list
        const newColumnList = arrayMoveImmutable(columnList, removedIndex, addedIndex);
        blockData1.column_list = newColumnList
        updateBlockData(blockData1)
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title={`${blockData.text} Settings`} modal darkTitle content={false}>
                    <CardContent sx={{ maxWidth: '100%', width: '600px' }}>
                        <Grid container spacing={3} direction="column">
                            <Grid item container xs={12} spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>Included Tiles</Typography>
                                    <Box className="included-item-list">
                                        <Stack direction={`column`}>
                                            <Stack direction={`column`}>
                                                <Container getGhostParent={() => { return document.body }} dragHandleSelector=".drag-handle" nonDragAreaSelector=".non-drag-handle" lockAxis="y" onDrop={onDrop}>
                                                    {
                                                        blockData.column_list.map((value, index) => {
                                                            const item = getStatsColumnInfo(value)
                                                            return (
                                                                <Draggable key={index}>
                                                                    {
                                                                        (item) ? (
                                                                            <Box className={classes.columnListItem}>
                                                                                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                                                                                    <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                                                                        <IconButton color={`error`} onClick={() => removeItemFromBlock(item.value)}>
                                                                                            <MinusOutlined />
                                                                                        </IconButton>
                                                                                        <Typography variant="h6">{blockData.is_custom ? item.desc : item.text}</Typography>
                                                                                    </Stack>
                                                                                    <Box className={`drag-handle`}>
                                                                                        <Box className={classes.moveIcon}>
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
                                {
                                    (blockData.is_custom) ? (
                                        <></>
                                    ) : (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>More Tiles</Typography>
                                            <Box className="included-item-list">
                                                <Stack direction={`column`}>
                                                    {
                                                        systemBlockData?.column_list?.map((value, index) => {
                                                            const item = getStatsColumnInfo(value)
                                                            const skip = checkSummaryBlockColumnIsActive(blockData.column_list, item?.value)
                                                            return (
                                                                <Fragment key={index}>
                                                                    {
                                                                        (item && !skip) ? (
                                                                            <Box className={classes.columnListItem}>
                                                                                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                                                                                    <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                                                                        <IconButton disabled={false} color={`success`} onClick={() => addItemToBlock(item?.value)}>
                                                                                            <><PlusOutlined /></>
                                                                                        </IconButton>
                                                                                        <Typography variant="h6">{item?.text}</Typography>
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
                                    )
                                }
                            </Grid>
                        </Grid>
                    </CardContent>

                    <Divider />

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                        <Button color="primary" size="medium" onClick={() => applyCurrentBlock()}>
                            Apply
                        </Button>
                        <Button color="secondary" size="medium" onClick={handleClose}>
                            Cancel
                        </Button>
                    </Stack>
                </MainCard>
            </Modal>
        </>
    );
};

export default SectionColumnPickerModal;
