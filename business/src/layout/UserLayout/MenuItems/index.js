// project import
import { CommentOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    {
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
    },
    {
      id: 'group-ticket',
      type: 'group',
      children: [
        {
          id: 'ticket',
          title: "Support Tickets",
          type: 'item',
          url: '/user/ticket',
          icon: CommentOutlined
        },
      ]
    },
    {
      id: 'user-group-logout',
      type: 'group',
      children: [
        {
          id: 'user-logout',
          title: "Logout",
          type: 'item',
          url: '/login',
          icon: LogoutOutlined
        },
      ]
    },
  ]
};

export default menuItems;
