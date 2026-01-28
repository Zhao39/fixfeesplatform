// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { BorderLeftOutlined } from '@ant-design/icons';
 

// ==============================|| MENU ITEMS - pixel ||============================== //

const pixel = {
  id: 'group-pixel',
  type: 'group',
  children: [
    {
      id: 'pixel',
      title: "ES Pixel",
      type: 'collapse',
      icon: BorderLeftOutlined,
      children: [
        {
          id: 'all',
          title: "All",
          type: 'item',
          url: '/user/pixel/all',
          breadcrumbs: false
        },
        {
          id: 'all-ads',
          title: "Ads",
          type: 'item',
          url: '/user/pixel/ads',
        },
        {
          id: 'pixel-settings',
          title: "Pixel Settings",
          type: 'item',
          url: '/user/pixel/pixel-settings',
        },
        {
          id: 'tracking-settings',
          title: "Tracking Settings",
          type: 'item',
          url: '/user/pixel/tracking-settings',
        }
      ]
    }
  ]
};

export default pixel;
