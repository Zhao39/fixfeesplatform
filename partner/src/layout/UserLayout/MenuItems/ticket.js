// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { CommentOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - summary ||============================== //

const ticket = {
  id: 'group-ticket',
  type: 'group',
  children: [
    {
      id: 'ticket',
      title: "Support",
      type: 'item',
      url: '/user/ticket',
      icon: CommentOutlined
    },
  ]
};

export default ticket;
