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

// assets
import { PlusOutlined } from '@ant-design/icons';
import PageLayout from 'layout/UserLayout/PageLayout';
import { apiUserGetCalendarColors, apiUserGetCalendarEvents, apiUserSaveCalendarEvent } from 'services/userCalendarService';
import { getLocalTimezone } from 'utils/misc';

const selectedEventHandler = (state) => {
  const { events, selectedEventId } = state.calendar;
  if (selectedEventId) {
    return events.find((event) => event.id === selectedEventId);
  }
  return null;
};

// ==============================|| CALENDAR - MAIN ||============================== //

const EventsCalendar = () => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const calendar = useSelector((state) => state.calendar);
  const { calendarView, isModalOpen, selectedRange } = calendar;

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState()
  const [eventColors, setEventColors] = useState([])
  const eventColorsRef = useRef({})

  const loadEvents = async () => {
    const apiRes = await apiUserGetCalendarEvents()
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
  }

  const loadCalendarColors = async () => {
    const apiRes = await apiUserGetCalendarColors()
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

    dispatch(selectRange(arg.start, arg.end));
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
            editable={false}
            droppable={false}
            selectable={false}
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
            //select={handleRangeSelect}
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
        
      </Box>
    </PageLayout>
  )
};

export default EventsCalendar;
