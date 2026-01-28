// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { ToolOutlined} from '@ant-design/icons';

// ==============================|| MENU ITEMS - tools ||============================== //

const tools = {
  id: 'group-tools',
  type: 'group',
  children: [
    {
      id: 'tools',
      title: "Tools",
      type: 'collapse',
      icon: ToolOutlined,
      children: [
        {
          id: 'reports',
          title: "Reports",
          type: 'item',
          url: '/user/tools/reports',
          breadcrumbs: false
        },      
        {
          id: 'activiy-feed',
          title: "Activity Feed",
          type: 'item',
          url: '/user/tools/activiy-feed',
          breadcrumbs: false
        },
        {
          id: 'google-analytics',
          title: "Google Analytics",
          type: 'item',
          url: '/user/tools/google-analytics',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default tools;
