import { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AdminAuthGuard from 'layout/AdminLayout/AuthGuard';
import AdminLayout from 'layout/AdminLayout';
import UserListPage from 'pages/admin-pages/user-list/user-list-page';
import PaymentListPage from 'pages/admin-pages/payment-list/payment-list-page';
import WithdrawalListPage from 'pages/admin-pages/withdrawal-list/withdrawal-list-page';
import TicketListPage from 'pages/admin-pages/ticket/index';
import CompanyStatsPage from 'pages/admin-pages/company-stats/company-stats-page';
import SettingPage from 'pages/admin-pages/setting/setting-page';
import AnnouncementPage from 'pages/admin-pages/announcement/announcement-page';
import SubscriberListPage from 'pages/admin-pages/subscriber-list/subscriber-list-page';
import ProfilePage from 'pages/admin-pages/profile/profile-page';
import CouponListPage from 'pages/admin-pages/coupon-list/coupon-list-page';
import TrainingVideosPage from 'pages/admin-pages/training-videos/training-videos-page';

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
          element: <UserListPage />
        },
       
        {
          path: 'ticket',
          element: <TicketListPage />
        },
        
        // {
        //   path: 'setting',
        //   element: <SettingPage />
        // },
      ]
    }
  ]
};

export default MainRoutes;
