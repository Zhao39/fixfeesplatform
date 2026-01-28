import { lazy } from 'react';
import Loadable from 'components/Loadable';

// project import
import AdminAuthGuard from 'layout/AdminLayout/AuthGuard';
import AdminLayout from 'layout/AdminLayout';
import UserListPage from 'pages/admin-pages/user-list/user-list-page';
import PaymentDetailPage from 'pages/admin-pages/user-list/payment-list-page';
import TicketListPage from 'pages/admin-pages/ticket/index';
import TrainingVideosPage from 'pages/admin-pages/training-videos/TrainingVideosPageContainer';
import MerchantTrainingVideosPage from 'pages/admin-pages/training-videos/MerchantTrainingVideosPage';
import BrandPartnerTrainingVideosPage from 'pages/admin-pages/training-videos/BrandPartnerTrainingVideosPage';
import LiveTrainingVideosPage from 'pages/admin-pages/training-videos/LiveTrainingVideosPage';
import CouponListPage from 'pages/admin-pages/coupon-list/coupon-list-page';
import ProspectListPage from 'pages/admin-pages/prospect-list/prospect-list-page';
import FunnelsPage from 'pages/admin-pages/funnels/index';

const EventsCalendar = Loadable(lazy(() => import('pages/admin-pages/calendar/index')));
const CalendarSettings = Loadable(lazy(() => import('pages/admin-pages/calendar/settings')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: 'admin',
      element: (
        <AdminAuthGuard>
          <AdminLayout />
        </AdminAuthGuard>
      ),
      children: [
        {
          path: 'user-list',
          children: [
            {
              path: '',
              element: <UserListPage />,
            },
            {
              path: 'payment-list/:user_id',
              element: <PaymentDetailPage />
            },
          ]
        },
        {
          path: 'calendar',
          children: [
            {
              path: 'events',
              element: <EventsCalendar />
            },
            {
              path: 'calendar-settings',
              element: <CalendarSettings />
            }
          ]
        },
        {
          path: 'prospect-list',
          element: <ProspectListPage />
        },
        {
          path: 'funnels',
          element: <FunnelsPage />
        },

        // {
        //   path: 'subscriber-list',
        //   element: <SubscriberListPage />
        // },
        // {
        //   path: 'profile',
        //   element: <ProfilePage />
        // },
        // {
        //   path: 'payment-list',
        //   element: <PaymentListPage />
        // },
        // {
        //   path: 'withdrawal-list',
        //   element: <WithdrawalListPage />
        // },
        // {
        //   path: 'company-stats',
        //   element: <CompanyStatsPage />
        // },
        {
          path: 'coupon-list',
          element: <CouponListPage />
        },
        {
          path: 'training-videos',
          children: [
            {
              path: 'merchant-training',
              element: <MerchantTrainingVideosPage />
            },
            {
              path: 'brand-partner-training',
              element: <BrandPartnerTrainingVideosPage />
            },
            {
              path: 'live-training',
              element: <LiveTrainingVideosPage />
            }
          ]
        },
        // {
        //   path: 'training-videos',
        //   element: <TrainingVideosPage />
        // },
        {
          path: 'ticket',
          element: <TicketListPage />
        },
        // {
        //   path: 'announcement',
        //   element: <AnnouncementPage />
        // },
        // {
        //   path: 'setting',
        //   element: <SettingPage />
        // },
      ]
    }
  ]
};

export default MainRoutes;
