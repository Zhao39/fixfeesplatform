// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { TableOutlined } from '@ant-design/icons';

const websites = {
  id: 'group-websites',
  type: 'group',
  children: [
    {
      id: 'websites',
      title: "Funnels",
      type: 'item',
      url: '/user/websites',
      icon: TableOutlined
    },
  ]
};

export default websites;
