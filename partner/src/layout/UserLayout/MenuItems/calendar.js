// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  CalendarOutlined
} from '@ant-design/icons';


const calendar = {
  id: 'group-calendar',
  title: "",
  type: 'group',
  children: [    
    {
      id: 'calendar',
      title: "Calendar",
      type: 'collapse',
      icon: CalendarOutlined,
      children: [
        {
          id: 'calender-events',
          title: "Events",
          type: 'item',
          url: '/user/calendar/events'
        },
        // {
        //   id: 'calender-settings',
        //   title: "Calendar Settings",
        //   type: 'item',
        //   url: '/user/calendar/calendar-settings',
        // }
      ]
    }
  ]
}

export default calendar;
