import { BulbOutlined, BarChartOutlined, CommentOutlined, VideoCameraOutlined, DashboardOutlined, DollarOutlined, LogoutOutlined, NotificationOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined, FileTextOutlined, UserOutlined, WalletOutlined, HomeOutlined, ApartmentOutlined, CalendarOutlined, TableOutlined } from '@ant-design/icons';
import { ADMIN_TYPE } from 'config/constants';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    {
      id: 'admin-group-user-list',
      type: 'group',
      role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
      children: [
        {
          id: 'admin-user-list',
          title: "Users",
          type: 'item',
          url: '/admin/user-list',
          icon: TeamOutlined,
          role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
        },
      ]
    },
    {
      id: 'group-calendar',
      title: "",
      type: 'group',
      role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
      children: [
        {
          id: 'calendar',
          title: "Calendar",
          type: 'collapse',
          icon: CalendarOutlined,
          children: [
            {
              id: 'calender-events',
              title: "Events",
              type: 'item',
              url: '/admin/calendar/events',
              role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
            },
            {
              id: 'calender-settings',
              title: "Calendar Settings",
              type: 'item',
              url: '/admin/calendar/calendar-settings',
              role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
            }
          ]
        }
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
    // {
    //   id: 'admin-group-payment-list',
    //   type: 'group',
    //   children: [
    //     {
    //       id: 'admin-payment-list',
    //       title: "Payments",
    //       type: 'item',
    //       url: '/admin/payment-list',
    //       icon: DollarOutlined
    //     },
    //   ]
    // },
    // {
    //   id: 'admin-group-withdrawal-list',
    //   type: 'group',
    //   children: [
    //     {
    //       id: 'admin-withdrawal-list',
    //       title: "Withdrawal",
    //       type: 'item',
    //       url: '/admin/withdrawal-list',
    //       icon: WalletOutlined
    //     },
    //   ]
    // },
    // {
    //   id: 'admin-group-company-stats',
    //   type: 'group',
    //   children: [
    //     {
    //       id: 'admin-company-stats',
    //       title: "Company Stats",
    //       type: 'item',
    //       url: '/admin/company-stats',
    //       icon: BarChartOutlined
    //     },
    //   ]
    // },

    {
      id: 'admin-group-training-videos',
      title: "",
      type: 'group',
      role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
      children: [
        {
          id: 'training-videos',
          title: "Training Videos",
          type: 'collapse',
          icon: VideoCameraOutlined,
          children: [
            {
              id: 'training-videos-merchant-training',
              title: "Merchant Trainings",
              type: 'item',
              url: '/admin/training-videos/merchant-training',
              role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
            },
            {
              id: 'training-videos-brand-partner-training',
              title: "Brand Partner Trainings",
              type: 'item',
              url: '/admin/training-videos/brand-partner-training',
              role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
            },
            {
              id: 'training-videos-live-training',
              title: "Live Trainings Vault",
              type: 'item',
              url: '/admin/training-videos/live-training',
              role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
            }
          ]
        }
      ]
    },
    {
      id: 'admin-group-tickets',
      type: 'group',
      children: [
        {
          id: 'admin-tickets',
          title: "Support",
          type: 'item',
          url: '/admin/ticket',
          icon: CommentOutlined
        },
      ]
    },
    {
      id: 'admin-group-coupon-list',
      type: 'group',
      role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
      children: [
        {
          id: 'admin-coupon-list',
          title: "Coupons",
          type: 'item',
          url: '/admin/coupon-list',
          icon: FileTextOutlined,
          role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
        },
      ]
    },
    {
      id: 'admin-group-prospect-list',
      type: 'group',
      role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
      children: [
        {
          id: 'admin-prospect-list',
          title: "Prospect List",
          type: 'item',
          url: '/admin/prospect-list',
          icon: ApartmentOutlined,
          role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
        },
      ]
    },
    {
      id: 'admin-group-funnel-list',
      type: 'group',
      role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
      children: [
        {
          id: 'admin-funnel-list',
          title: "Funnels",
          type: 'item',
          url: '/admin/funnels',
          icon: TableOutlined,
          role: [ADMIN_TYPE.SUPER_ADMIN, ADMIN_TYPE.ADMIN],
        },
      ]
    },

    // {
    //   id: 'admin-group-announcement',
    //   type: 'group',
    //   children: [
    //     {
    //       id: 'admin-announcement',
    //       title: "Announcement",
    //       type: 'item',
    //       url: '/admin/announcement',
    //       icon: NotificationOutlined
    //     },
    //   ]
    // },
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
