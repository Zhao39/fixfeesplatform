import { APP_NAME, BASE_API_URL } from "config/constants";
import ScrollX from 'components/ScrollX';
import { get_utc_timestamp_ms, timeConverter } from "utils/misc";
import { useState } from "react";
import { Box, Button, IconButton, Stack, Tooltip, Typography, Icon, Link } from "@mui/material";
import { BorderVerticleOutlined, CheckCircleOutlined, CloseOutlined, DeleteOutlined, EditOutlined, HolderOutlined, KeyOutlined, MinusOutlined, PlusOutlined, PushpinOutlined, StopOutlined } from "@ant-design/icons";
import DataTableWrapper from "components/DataTable/DataTableWrapper";
import PageLayout from "layout/AdminLayout/PageLayout";
import ConfirmDialog from "components/ConfirmDialog/ConfirmDialog";
import { showToast } from "utils/utils";
import { apiAdminDeleteVideoInfo, apiAdminGetVideoList, apiAdminUpdateUserStatus, apiAdminUpdateVideoPriority } from "services/adminService";
import VideoInfoModal from "./inc/VideoInfoModal";
import { Container, Draggable } from "react-smooth-dnd";
import { arrayMoveImmutable, arrayMoveMutable } from "array-move";
import { createStyles, makeStyles } from '@mui/styles';
import { useEffect } from "react";
import MainCard from "components/MainCard";

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
      cursor: 'move',
      display: 'flex',
      alignItems: 'center'
    },
    moveIconDisabled: {
      padding: '6px 10px',
      opacity: 0.5,
      cursor: 'not-allowed'
    },
  })
);

const TrainingVideosPageContainer = (props) => {
  const { pageTitle, trainingType } = props

  const classes = useStyles();
  const [apiCalling, setApiCalling] = useState(false)
  const [currentRow, setCurrentRow] = useState(null)
  const [showVideoInfoModal, setShowVideoInfoModal] = useState(false)
  const [showAddVideoInfoModal, setShowAddVideoInfoModal] = useState(false)
  const [videoList, setVideoList] = useState([])
  const [tableTimestamp, setTableTimestamp] = useState(get_utc_timestamp_ms())

  const getVideoList = async () => {
    setApiCalling(true)
    const payload = { training_type: trainingType }
    const apiRes = await apiAdminGetVideoList(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      const video_list = apiRes['data']['vide_list']
      console.log(`video_list:::`, video_list)
      setVideoList(video_list)
    }

  }

  useEffect(() => {
    getVideoList()
  }, [tableTimestamp])

  const defaultVideoData = {
    video_url_text: "",
    video_id: "",
    headline: "",
    link: "",
    fields: [""]
  }

  const handleAdd = () => {
    setCurrentRow(defaultVideoData)
    setShowAddVideoInfoModal(true)
  }

  const onClickEditVideo = (row) => {
    const training_data = JSON.parse(row.training_data)
    setCurrentRow({
      ...row,
      ...training_data
    })
    setShowVideoInfoModal(true)
  }

  const onClickDeleteVideo = (row) => {
    const training_data = JSON.parse(row.training_data)
    setCurrentRow({
      ...row,
      ...training_data
    })
    setConfirmText(`Are you sure you want to delete?`)
    setConfirmAction("delete_video")
    setShowConfirmModal(true)
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [confirmAction, setConfirmAction] = useState("")

  const onClickYesConfirm = () => {
    if (confirmAction === "delete_video") {
      submitDeleteVideo()
    }
  }

  const onClickNoConfirm = () => {
    setShowConfirmModal(false)
  }

  const submitDeleteVideo = async () => {
    const payload = { ...currentRow }
    setApiCalling(true)
    let apiRes = await apiAdminDeleteVideoInfo(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      setTableTimestamp(get_utc_timestamp_ms())
      showToast(apiRes.message, 'success');
    } else {
      showToast(apiRes.message, 'error');
    }
    setShowConfirmModal(false)
  }

  const onDrop = async ({ removedIndex, addedIndex }) => {
    let video_list = [...videoList]
    const new_video_list = arrayMoveImmutable(video_list, removedIndex, addedIndex);
    setVideoList(new_video_list)

    for (let k in new_video_list) {
      new_video_list['priority'] = k
    }

    const payload = {
      video_list: JSON.stringify(new_video_list),
      training_type: trainingType
    }
    setApiCalling(true)
    let apiRes = await apiAdminUpdateVideoPriority(payload)
    setApiCalling(false)
    if (apiRes['status'] === '1') {
      const video_list = apiRes['data']['vide_list']
      setVideoList(video_list)
    }
  }

  return (
    <PageLayout title={pageTitle} cardType="">
      <Stack direction={`column`} spacing={2}>
        <Stack direction={`row`} justifyContent={`space-between`}>
          <div></div>
          <Button type="button" variant="contained" startIcon={<PlusOutlined />} size="medium" onClick={() => handleAdd()}>Add Video</Button>
        </Stack>
        <MainCard title="">
          <ScrollX>
            <Stack direction={`column`}>
              <Container getGhostParent={() => { return document.body }} dragHandleSelector=".drag-handle" nonDragAreaSelector=".non-drag-handle" lockAxis="y" onDrop={onDrop}>
                {
                  videoList.map((item, index) => {
                    const searchMatched = true // filterTableColumnInfo(item, searchKey)
                    const videoUrl = `https://vimeo.com/${item.video_id}`
                    return (
                      <Draggable key={index}>
                        {
                          (item && searchMatched) ? (
                            <Box className={classes.columnListItem}>
                              <Stack direction={`row`} justifyContent={`flex-start`} alignItems={`center`} spacing={1}>
                                <Box className={`drag-handle`}>
                                  <Tooltip title="Move" placement="left" arrow>
                                    <Box className={classes.moveIcon}>
                                      <Icon sx={{ height: 'auto' }}>
                                        <BorderVerticleOutlined />
                                      </Icon>
                                    </Box>
                                  </Tooltip>
                                </Box>
                                <Stack direction={`row`} justifyContent={`space-between`} alignItems={`center`} spacing={1} flex={1}>
                                  <Link variant="h6" href={videoUrl} target="_blank" className="text-emphasis" style={{ maxWidth: 'calc(100vw - 230px)' }}>
                                    {item.video_url_text}
                                  </Link>
                                  <Stack direction={`row`} justifyContent={`flex-end`} alignItems={`center`} spacing={0.5} sx={{ px: 1 }}>
                                    <IconButton color={`info`} onClick={() => onClickEditVideo(item)}>
                                      <EditOutlined />
                                    </IconButton>
                                    <IconButton color={`error`} onClick={() => onClickDeleteVideo(item)}>
                                      <DeleteOutlined />
                                    </IconButton>
                                  </Stack>
                                </Stack>
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
          </ScrollX>
        </MainCard>
      </Stack>
      {
        (showVideoInfoModal) && (
          <>
            <VideoInfoModal
              show={showVideoInfoModal}
              setShow={setShowVideoInfoModal}
              title="Edit Training Video"
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
              trainingType={trainingType}
            />
          </>
        )
      }

      {
        (showAddVideoInfoModal) && (
          <>
            <VideoInfoModal
              show={showAddVideoInfoModal}
              setShow={setShowAddVideoInfoModal}
              title="Add Training Video"
              info={currentRow}
              tableTimestamp={tableTimestamp}
              setTableTimestamp={setTableTimestamp}
              trainingType={trainingType}
            />
          </>
        )
      }

      {
        (showConfirmModal) ? (
          <>
            <ConfirmDialog
              open={showConfirmModal}
              setOpen={setShowConfirmModal}
              title={APP_NAME}
              content={confirmText}
              textYes={`Yes`}
              textNo={`No`}
              onClickYes={() => onClickYesConfirm()}
              onClickNo={() => onClickNoConfirm()}
            />
          </>
        ) : (
          <></>
        )
      }

    </PageLayout>
  )
}

export default TrainingVideosPageContainer;