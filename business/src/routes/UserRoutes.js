import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import UserLayout from 'layout/UserLayout';
import UserAuthGuard from 'layout/UserLayout/AuthGuard';
 
const DashboardPage = Loadable(lazy(() => import('pages/user-pages/dashboard/index')));
const TicketPage = Loadable(lazy(() => import('pages/user-pages/ticket/index')));

// ==============================|| MAIN ROUTING ||============================== //

const UserRoutes = {
  path: '/',
  children: [
    {
      path: 'user',
      element: (
        <UserAuthGuard>
          <UserLayout />
        </UserAuthGuard>
      ),
      children: [
        {
          path: 'dashboard',
          element: <DashboardPage />
        },
        {
          path: 'ticket',
          element: <TicketPage />
        },
      ]
    }
  ]
}

export default UserRoutes;
