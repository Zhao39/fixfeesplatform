// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { LinkOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - connections ||============================== //

const connections = {
  id: 'group-connections',
  type: 'group',
  children: [
    {
      id: 'connections',
      title: "Integrations",
      type: 'item',
      url: '/user/connections/integrations',
      icon: LinkOutlined,
    }
  ]
};

export default connections;
