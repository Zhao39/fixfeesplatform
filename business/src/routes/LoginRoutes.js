import { lazy } from 'react';

// project import
import GuestGuard from 'utils/route-guard/GuestGuard';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/auth/login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/register')));
const AuthConfirmMail = Loadable(lazy(() => import('pages/auth/confirm-mail')));

const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/code-verification')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <GuestGuard>
          <CommonLayout layout="auth" />
        </GuestGuard>
      ),
      children: [
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'register',
          element: <RegisterPage />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'check-email',
          element: <AuthCheckMail />
        },
        {
          path: 'reset-password/:id',
          element: <AuthResetPassword />
        },
        // {
        //   path: 'code-verification',
        //   element: <AuthCodeVerification />
        // },

        {
          path: 'confirm-email/:id',
          element: <AuthConfirmMail />
        },
      ]
    }
  ]
};

export default LoginRoutes;
