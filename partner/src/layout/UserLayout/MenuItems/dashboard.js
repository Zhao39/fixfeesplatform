// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { HomeOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - summary ||============================== //

const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: "Dashboard",
      type: 'item',
      url: '/user/dashboard',
      icon: HomeOutlined
    },
  ]
};

export default dashboard;
