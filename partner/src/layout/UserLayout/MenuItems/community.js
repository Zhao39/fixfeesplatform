// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { CloudOutlined, GoldOutlined, GlobalOutlined } from '@ant-design/icons';
import { COMMUNITY_URL } from 'config/constants';

const community = {
  id: 'group-community',
  type: 'group',
  children: [
    {
      id: 'community',
      title: "Community",
      type: 'item',
      url: COMMUNITY_URL,
      icon: CloudOutlined,
      external: true,
      target: '_blank'
    },
  ]
};

export default community;
