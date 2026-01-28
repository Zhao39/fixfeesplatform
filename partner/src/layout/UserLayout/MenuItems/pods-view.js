// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { UnorderedListOutlined } from '@ant-design/icons';
 
// ==============================|| MENU ITEMS - summary ||============================== //

const podsView = {
  id: 'group-pods-view',
  type: 'group',
  children: [
    {
      id: 'pods-view',
      title: "Pods",
      type: 'item',
      url: '/user/pods-view',
      icon: UnorderedListOutlined
    },
  ]
};

export default podsView;
