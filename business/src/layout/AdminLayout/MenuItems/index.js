import { BulbOutlined, BarChartOutlined, CommentOutlined, VideoCameraOutlined, DashboardOutlined, DollarOutlined, LogoutOutlined, NotificationOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined, FileTextOutlined, UserOutlined, WalletOutlined, HomeOutlined  } from '@ant-design/icons';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    {
      id: 'admin-group-user-list',
      type: 'group',
      children: [
        {
          id: 'admin-user-list',
          title: "Merchants",
          type: 'item',
          url: '/admin/user-list',
          icon: TeamOutlined
        },
      ]
    },
    // {
    //   id: 'admin-group-profile-view',
    //   type: 'group',
    //   children: [
    //     {
    //       id: 'admin-profile-view',
    //       title: "Profile",
    //       type: 'item',
    //       url: '/admin/profile',
    //       icon: UserOutlined
    //     },
    //   ]
    // },
    
    {
      id: 'admin-group-tickets',
      type: 'group',
      children: [
        {
          id: 'admin-tickets',
          title: "Support Tickets",
          type: 'item',
          url: '/admin/ticket',
          icon: CommentOutlined
        },
      ]
    },
     
    // {
    //   id: 'admin-group-setting',
    //   type: 'group',
    //   children: [
    //     {
    //       id: 'admin-setting',
    //       title: "Settings",
    //       type: 'item',
    //       url: '/admin/setting',
    //       icon: SettingOutlined
    //     },
    //   ]
    // },
    {
      id: 'admin-group-logout',
      type: 'group',
      children: [
        {
          id: 'admin-logout',
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
