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
import { checkSummaryBlockIsActive, getSummaryBlockInfo } from 'utils/ad-stats-utils';

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

const SectionPickerModal = (props) => {
    const { open = false, setOpen } = props

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
    const visibleBlockList = summaryBlockData.blockList.filter((item) => item.is_hidden !== true)
    const hiddenBlockList = summaryBlockData.blockList.filter((item) => item.is_hidden === true)

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        revokeBlockList()
        setOpen(false)
    }

    const applyCurrentBlockList = () => {
        setOpen(false)
    }

    const [revisionSummaryBlockList, setRevisionSummaryBlockList] = useState([])

    useEffect(() => {
        setRevisionSummaryBlockList(copyObject(summaryBlockData.blockList))
    }, [])

    const saveBlockData = (blockData) => {
        //console.log("saveBlockData blockData::::", blockData)
        const block_data = copyObject(blockData)
        const settingData = {
            ...settingPersistDataStore,
            summaryBlockData: {
                ...block_data
            }
        }
        dispatch(setSettingData(settingData))
    }

    const removeItemFromBlockList = (sectionInfo) => {
        const summary_block_data = copyObject(summaryBlockData)
        const blockList = summary_block_data.blockList
        if (sectionInfo.is_custom) {
            const blockDataUpdated = {
                ...sectionInfo,
                is_hidden: true
            }
            for (let k in blockList) {
                if (blockList[k].value === blockDataUpdated.value) {
                    blockList[k] = blockDataUpdated
                }
            }
            summary_block_data.blockList = blockList
            saveBlockData({ ...summary_block_data })
        } else {
            const newBlockList = blockList.filter((item) => item.value !== sectionInfo.value)
            summary_block_data.blockList = newBlockList
            saveBlockData({ ...summary_block_data })
        }
    }

    const addItemToBlockList = (sectionInfo) => {
        const summary_block_data = copyObject(summaryBlockData)
        const blockList = summary_block_data.blockList
        if (sectionInfo.is_custom) {
            const blockList = summary_block_data.blockList
            const blockDataUpdated = {
                ...sectionInfo,
                is_hidden: false
            }
            for (let k in blockList) {
                if (blockList[k].value === blockDataUpdated.value) {
                    blockList[k] = blockDataUpdated
                }
            }
            summary_block_data.blockList = blockList
            saveBlockData({ ...summary_block_data })
        } else {
            const value = sectionInfo.value
            const newBlock = getSummaryBlockInfo(value)
            blockList.push(newBlock)
            summary_block_data.blockList = blockList
            saveBlockData({ ...summary_block_data })
        }
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
        const blockList = copyObject(summaryBlockData.blockList)
        const newBlockList = arrayMoveImmutable(blockList, removedIndex, addedIndex);
        saveBlockData({
            ...summaryBlockData,
            blockList: newBlockList
        })
    }

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableAutoFocus={true}>
                <MainCard title="Select Sections" modal darkTitle content={false}>
                    <CardContent sx={{ maxWidth: '100%', width: '600px' }}>
                        <Grid container spacing={3} direction="column">
                            <Grid item container xs={12} spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>Included Sections</Typography>
                                    <Box className="included-item-list">
                                        <Stack direction={`column`}>
                                            <Stack direction={`column`}>
                                                <Container getGhostParent={() => { return document.body }} dragHandleSelector=".drag-handle" nonDragAreaSelector=".non-drag-handle" lockAxis="y" onDrop={onDrop}>
                                                    {
                                                        visibleBlockList.map((item, index) => {
                                                            return (
                                                                <Draggable key={index}>
                                                                    {
                                                                        (item) ? (
                                                                            <Box className={classes.columnListItem}>
                                                                                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                                                                                    <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                                                                        <IconButton color={`error`} onClick={() => removeItemFromBlockList(item)}>
                                                                                            <MinusOutlined />
                                                                                        </IconButton>
                                                                                        <Typography variant="h6">{item.text}</Typography>
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
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>More Sections</Typography>
                                    <Box className="included-item-list">
                                        <Stack direction={`column`}>
                                            {
                                                [...STATS_BLOCK_LIST, ...hiddenBlockList].map((item, index) => {
                                                    const skip = checkSummaryBlockIsActive(visibleBlockList, item.value)
                                                    return (
                                                        <Fragment key={index}>
                                                            {
                                                                (!skip) ? (
                                                                    <Box className={classes.columnListItem}>
                                                                        <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1}>
                                                                            <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                                                                <IconButton disabled={false} color={`success`} onClick={() => addItemToBlockList(item)}>
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
                        <Button color="primary" size="medium" onClick={() => applyCurrentBlockList()}>
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

export default SectionPickerModal;
