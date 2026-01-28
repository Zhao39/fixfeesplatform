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

import Processwithus from 'pages/home-pages/funnel/Processwithus';
import Paymentprocessing from 'pages/home-pages/funnel/Paymentprocessing';
import Feefixer from 'pages/home-pages/funnel/Feefixer';
import Paymentprocessor from 'pages/home-pages/funnel/Paymentprocessor';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <CommonLayout layout="landing" />,
      children: [
        {
          path: '/',
          element: <FrontPage />,
        },
      ]
    },
    {
      path: '/',
      element: <CommonLayout layout="funnel" />,
      children: [
        {
          path: '/processwithus/:affiliate_code',
          element: <Processwithus />,
        },      
        {
          path: '/feefixer/:affiliate_code',
          element: <Feefixer />,
        }    
      ]
    },
    {
      path: '/',
      element: <CommonLayout layout="funnel"  showHeader={true} />,
      children: [        
        {
          path: '/paymentprocessing/:affiliate_code',
          element: <Paymentprocessing />,
        },       
        {
          path: '/paymentprocessor/:affiliate_code',
          element: <Paymentprocessor />,
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
