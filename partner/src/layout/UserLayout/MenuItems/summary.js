// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DashboardOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - summary ||============================== //

const summary = {
  id: 'group-summary',
  type: 'group',
  children: [
    {
      id: 'summary',
      title: "Summary",
      type: 'item',
      url: '/user/summary',
      icon: DashboardOutlined,
      coming_soon: true,
      //disabled: true
    },
  ]
};

export default summary;
