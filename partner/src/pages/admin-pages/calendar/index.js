import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useMediaQuery, Box, Dialog, SpeedDial, Tooltip } from '@mui/material';

// third-party
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';

// project import
import CalendarStyled from './inc/CalendarStyled';
import Toolbar from './inc/Toolbar';
import AddEventForm from './inc/AddEventForm';
import { getEvents, selectEvent, selectRange, toggleModal, showModal, updateCalendarView, updateEvent } from 'store/reducers/calendar';

import { useNavigate } from 'react-router';

// assets
import { PlusOutlined } from '@ant-design/icons';
import PageLayout from 'layout/AdminLayout/PageLayout';
import { apiAdminGetCalendarColors, apiAdminGetCalendarEvents, apiAdminSaveCalendarEvent } from 'services/adminCalendarService';
import { getLocalTimezone } from 'utils/misc';
import { showToast } from 'utils/utils';

// ==============================|| CALENDAR - MAIN ||============================== //

const EventsCalendar = () => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const history = useNavigate()
  const calendar = useSelector((state) => state.calendar);
  const { calendarView, isModalOpen, selectedRange } = calendar;

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState()
  const [eventColors, setEventColors] = useState([])
  const eventColorsRef = useRef({})

  const loadEvents = async () => {
    const apiRes = await apiAdminGetCalendarEvents()
    if (apiRes['status'] === '1') {
      const items = apiRes['data']['items']
      console.log(`loadEvents items::::`, items)

      const event_items = items.map((event) => {
        return {
          ...event,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          backgroundColor: event.colorId ? getColor(event.colorId).background : '',
        }
      })
      console.log(`event_items:::`, event_items)
      setEvents(event_items)
    }
    else {
      showToast(apiRes['message'], 'error')
      if (apiRes['data']['google_oauth_token'] === "") {
        const redirectUrl = `/admin/calendar/calendar-settings`
        history(redirectUrl)
      }
    }
  }

  const loadCalendarColors = async () => {
    const apiRes = await apiAdminGetCalendarColors()
    if (apiRes['status'] === '1') {
      const event_colors = apiRes['data']['items']['event']
      console.log(`loadCalendarColors event_colors::::`, event_colors)
      eventColorsRef.current = event_colors

      const event_color_list = []
      for (let k in event_colors) {
        const color_item = {
          id: k,
          ...event_colors[k]
        }
        event_color_list.push(color_item)
      }
      setEventColors(event_color_list)
    }
  }

  const loadPageData = async () => {
    await loadCalendarColors()
    await loadEvents()
  }

  useEffect(() => {
    loadPageData()
  }, []);

  const getColor = (colorId) => {
    const colors = eventColorsRef.current
    return colors[colorId] || { background: '#3788d8', foreground: '#1d1d1d' }; // Default color
  }


  // useEffect(() => {
  //   dispatch(getEvents());
  // }, [dispatch]);

  const calendarRef = useRef(null);

  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = matchDownSM ? 'listWeek' : 'dayGridMonth';
      calendarApi.changeView(newView);
      dispatch(updateCalendarView(newView));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownSM]);

  const [date, setDate] = useState(new Date());

  // calendar toolbar events
  const handleDateToday = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  };

  const handleViewChange = (newView) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(newView);
      dispatch(updateCalendarView(newView));
    }
  };

  const handleDatePrev = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  };

  const handleDateNext = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  };

  // calendar events
  const handleRangeSelect = (arg) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.unselect();
    }

    const updatedEvent = {
      start: arg.start.toISOString(),
      end: arg.end.toISOString()
    }
    console.log(`updatedEvent::::::`, updatedEvent)
    //dispatch(selectRange(arg.start, arg.end));
    setSelectedEvent(updatedEvent)
    dispatch(showModal(true));
  };

  const handleEventSelect = (arg) => { // called when each event is selected
    const selectedEventId = arg.event.id
    if (selectedEventId) {
      const selected_event = events.find((event) => event.id === selectedEventId);
      setSelectedEvent(selected_event)
      dispatch(showModal(true));
    }
  }

  const handleEventUpdate = async ({ event }) => {
    try {
      // dispatch(
      //   updateEvent(event.id, {
      //     allDay: event.allDay,
      //     start: event.start,
      //     end: event.end
      //   })
      // );

      const local_iana_timezone = getLocalTimezone()
      const updatedEvent = {
        id: event?.id,
        start: {
          dateTime: event.start,
          timeZone: local_iana_timezone,
        },
        end: {
          dateTime: event.end,
          timeZone: local_iana_timezone,
        }
      }
      console.log(`updatedEvent::::`, updatedEvent)
      await apiAdminSaveCalendarEvent(updatedEvent)
    } catch (error) {
      console.error(error);
    }
  };

  const handleModal = (reload = false) => {
    dispatch(toggleModal());
    if (reload) {
      loadEvents()
    }
  };

  const onClickAddEvent = () => {
    setSelectedEvent(null)
    dispatch(showModal(true));
  }

  return (
    <PageLayout title="" cardType="">
      <Box sx={{ position: 'relative' }}>
        <CalendarStyled>
          <Toolbar
            date={date}
            view={calendarView}
            onClickNext={handleDateNext}
            onClickPrev={handleDatePrev}
            onClickToday={handleDateToday}
            onChangeView={handleViewChange}
          />

          <FullCalendar
            weekends
            editable
            droppable
            selectable
            events={events}
            ref={calendarRef}
            rerenderDelay={10}
            initialDate={date}
            initialView={calendarView}
            dayMaxEventRows={3}
            eventDisplay="block"
            headerToolbar={false}
            allDayMaintainDuration
            eventResizableFromStart
            select={handleRangeSelect}
            eventDrop={handleEventUpdate}
            eventClick={handleEventSelect}
            eventResize={handleEventUpdate}
            height={matchDownSM ? 'auto' : 720}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
          />
        </CalendarStyled>

        {/* Dialog renders its body even if not open */}
        <Dialog maxWidth="sm" fullWidth onClose={handleModal} open={isModalOpen} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
          {
            isModalOpen && <AddEventForm
              event={selectedEvent}
              eventColors={eventColors}
              range={selectedRange}
              onCancel={handleModal}
            />
          }
        </Dialog>
        <Tooltip title="Add New Event">
          <SpeedDial
            ariaLabel="add-event-fab"
            sx={{ display: 'inline-flex', position: 'sticky', bottom: 24, left: '100%', transform: 'translate(-50%, -50% )' }}
            icon={<PlusOutlined style={{ fontSize: '1.5rem' }} />}
            onClick={onClickAddEvent}
          />
        </Tooltip>
      </Box>
    </PageLayout>
  )
};

export default EventsCalendar;
