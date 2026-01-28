import {
  CalendarOutlined,
  CloudOutlined,
  CommentOutlined,
  ContainerOutlined,
  GlobalOutlined,
  HomeOutlined,
  InboxOutlined,
  LogoutOutlined,
  PlaySquareOutlined,
  ProfileOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined,
  LocalAtmOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import dashboard from './dashboard';
import ticket from './ticket';
import calendar from './calendar';
import community from './community';
import websites from './websites';
import training from './training';
import settings from './settings';
import { COMMUNITY_URL } from 'config/constants';

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
      id: 'group-leads',
      title: "",
      type: 'group',
      children: [
        {
          id: 'leads',
          title: "Leads",
          type: 'collapse',
          icon: UnorderedListOutlined,
          children: [
            {
              id: 'contacts',
              title: "Contacts",
              type: 'item',
              url: '/user/leads/contact-list'
            },
            {
              id: 'pipelines',
              title: "Pipelines",
              type: 'item',
              url: '/user/leads/pipeline-list'
            }
          ]
        }
      ]
    },
    {
      id: 'group-merchants',
      type: 'group',
      children: [
        {
          id: 'merchants',
          title: "Merchants",
          type: 'item',
          url: '/user/merchant-list',
          icon: TeamOutlined
        },
      ]
    },
    {
      id: 'group-trains',
      title: "",
      type: 'group',
      children: [
        {
          id: 'trains',
          title: "Trainings",
          type: 'collapse',
          icon: PlaySquareOutlined,
          children: [
            {
              id: 'merchant-training',
              title: "Merchant Trainings",
              type: 'item',
              url: '/user/trains/merchant-training'
            },
            {
              id: 'brand-partner-training',
              title: "Brand Partner Trainings",
              type: 'item',
              url: '/user/trains/brand-partner-training'
            },
            {
              id: 'live-training',
              title: "Live Trainings Vault",
              type: 'item',
              url: '/user/trains/live-training'
            }
          ]
        }
      ]
    },
    {
      id: 'group-funnels',
      type: 'group',
      children: [
        {
          id: 'funnels',
          title: "Funnels",
          type: 'item',
          url: '/user/funnels',
          icon: TableOutlined
        },
      ]
    },
    {
      id: 'payment_history',
      type: 'group',
      children: [
        {
          id: 'payment_history',
          title: "Payment History",
          type: 'item',
          url: '/user/payment_history',
          icon: LocalAtmOutlinedIcon
        },
      ]
    },
    {
      id: 'group-email-sms',
      title: "",
      type: 'group',
      children: [
        {
          id: 'email-sms',
          title: "Lead-Gen",
          type: 'collapse',
          icon: GlobalOutlined,
          children: [
            {
              id: 'email',
              title: "Pay Per Lead",
              type: 'item',
              url: '/user/email-sms/email'
            },
            // {
            //   id: 'sms',
            //   title: "SMS Broadcast",
            //   type: 'item',
            //   url: '/user/email-sms/sms'
            // }
          ]
        }
      ]
    },
    {
      id: 'group-calendar',
      title: "",
      type: 'group',
      children: [
        {
          id: 'calendar',
          title: "Calendar",
          type: 'item',
          icon: CalendarOutlined,
          url: '/user/calendar/events'
        }
      ]
    },
    {
      id: 'group-genealogy',
      title: "",
      type: 'group',
      children: [
        {
          id: 'genealogy-business',
          title: "Genealogy",
          type: 'item',
          url: '/user/genealogy/business',
          icon: ContainerOutlined,
          // children: [
          //   {
          //     id: 'genealogy-business',
          //     title: "Merchants",
          //     type: 'item',
          //     url: '/user/genealogy/business'
          //   },
          //   // {
          //   //   id: 'genealogy-brand-partner',
          //   //   title: "Brand Partners",
          //   //   type: 'item',
          //   //   url: '/user/genealogy/brand-partner'
          //   // }
          // ]
        }
      ]
    },
    {
      id: 'group-commission',
      title: "",
      type: 'group',
      children: [
        {
          id: 'commission',
          title: "Commissions",
          type: 'collapse',
          icon: ProfileOutlined,
          children: [
            {
              id: 'commission-rank-stats',
              title: "Rank Stats",
              type: 'item',
              url: '/user/commission/rank-stats'
            },
            {
              id: 'commission-wallet',
              title: "Wallet",
              type: 'item',
              url: '/user/commission/wallet'
            },
            {
              id: 'commission-residuals',
              title: "Residuals",
              type: 'item',
              url: '/user/commission/residuals'
            },
            // {
            //   id: 'commission-reports',
            //   title: "Reports",
            //   type: 'item',
            //   url: '/user/commission/reports'
            // }
          ]
        }
      ]
    },
    // {
    //   id: 'group-wallet',
    //   type: 'group',
    //   children: [
    //     {
    //       id: 'wallet',
    //       title: "Wallet",
    //       type: 'item',
    //       url: '/user/wallet',
    //       icon: WalletOutlined
    //     },
    //   ]
    // },
    {
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
    },
    {
      id: 'group-settings',
      title: "",
      type: 'group',
      children: [
        {
          id: 'collapse-settings',
          title: "Settings",
          type: 'collapse',
          icon: SettingOutlined,
          children: [
            {
              id: 'settings-account-info',
              title: "Account Info",
              type: 'item',
              url: '/user/settings/account-info/kyc-verification'
            },
            {
              id: 'settings-account-settings',
              title: "Account Settings",
              type: 'item',
              url: '/user/settings/account-settings/profile',
            }
          ]
        }
      ]
    },
    {
      id: 'group-support',
      title: "",
      type: 'group',
      children: [
        {
          id: 'support',
          title: "Support",
          type: 'collapse',
          icon: CommentOutlined,
          children: [
            {
              id: 'resource-center',
              title: "Resource Center",
              type: 'item',
              url: '/user/support/resource-center'
            },
            {
              id: 'ticketing',
              title: "Ticketing",
              type: 'item',
              url: '/user/support/ticket',
            }
          ]
        }
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
