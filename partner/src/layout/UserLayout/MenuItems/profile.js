// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { UserOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - profile ||============================== //

const profile = {
  id: 'group-profile',
  type: 'group',
  children: [
    {
      id: 'profile',
      title: "Your Account",
      type: 'item',
      url: '/user/profiles/personal',
      icon: UserOutlined,
      target: false,
    }
  ]
};

export default profile;
