import { BACKEND_LOCATION } from 'config/constants';
import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';

// project import
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import ComponentsRoutes from './ComponentsRoutes';
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';

import FrontPage from 'pages/home-pages/front/FrontPage';
import PrivacyPolicyPage from 'pages/home-pages/privacy-policy';
import TermsServicePage from 'pages/home-pages/terms-service';
import CookiesSettingsPage from 'pages/home-pages/cookies-settings';
import DisclaimerPage from 'pages/home-pages/disclaimer';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <CommonLayout layout="landing" />,
      children: [
        {
          path: '/',
          element: <FrontPage />
        }
      ]
    },
    {
      path: '/',
      element: <CommonLayout layout="simple" />,
      children: [
        {
          path: 'privacy-policy',
          element: <PrivacyPolicyPage />
        },
        {
          path: 'terms-service',
          element: <TermsServicePage />
        },
        {
          path: 'cookies-settings',
          element: <CookiesSettingsPage />
        },
        {
          path: 'disclaimer',
          element: <DisclaimerPage />
        }
      ]
    },
   
    LoginRoutes,
    ComponentsRoutes,
    (BACKEND_LOCATION === 'localhost' ? MainRoutes : {}),
    UserRoutes,
    AdminRoutes
  ]);
}
