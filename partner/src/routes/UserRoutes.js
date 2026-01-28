import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import UserLayout from 'layout/UserLayout';
import UserAuthGuard from 'layout/UserLayout/AuthGuard';

const BlankPage = Loadable(lazy(() => import('pages/user-pages/blank/index')));
const PiplinePage = Loadable(lazy(() => import('pages/user-pages/pipeline/index')));
const DashboardPage = Loadable(lazy(() => import('pages/user-pages/dashboard/index')));
const EventsCalendar = Loadable(lazy(() => import('pages/user-pages/calendar/index')));
const CalendarSettings = Loadable(lazy(() => import('pages/user-pages/calendar/settings')));
const TicketPage = Loadable(lazy(() => import('pages/user-pages/ticket/index')));
const FunnelsPage = Loadable(lazy(() => import('pages/user-pages/funnels/index')));
const MerchantTrainingPage = Loadable(lazy(() => import('pages/user-pages/training/MerchantTraining')));
const BrandPartnerTrainingPage = Loadable(lazy(() => import('pages/user-pages/training/BrandPartnerTraining')));
const LiveTrainingPage = Loadable(lazy(() => import('pages/user-pages/training/LiveTraining')));
const AccountInfoPage = Loadable(lazy(() => import('pages/user-pages/settings/AccountInfo')));
const AccountSettingsProfilePage = Loadable(lazy(() => import('pages/user-pages/settings/AccountSettingsProfile')));
const AccountSettingsChangePasswordPage = Loadable(lazy(() => import('pages/user-pages/settings/AccountSettingsChangePassword')));
const AccountInfoKycPage = Loadable(lazy(() => import('pages/user-pages/settings/AccountInfoKyc')));
const AccountSettingsMfaPage = Loadable(lazy(() => import('pages/user-pages/settings/AccountSettingsMfa')));
const AccountTabMembership = Loadable(lazy(() => import('pages/user-pages/settings/AccountMembership')));
const AccountSettingsPage = Loadable(lazy(() => import('pages/user-pages/settings/AccountSettings')));
const LeadListPage = Loadable(lazy(() => import('pages/user-pages/leads/index')));
const PipeLinePage = Loadable(lazy(() => import('pages/user-pages/leads/')))
const MerchantListPage = Loadable(lazy(() => import('pages/user-pages/merchants')));
const WalletPage = Loadable(lazy(() => import('pages/user-pages/wallet/index')));
const PaymentHistoryPage = Loadable(lazy(() => import('pages/user-pages/payment/index')))
const Genealogy = Loadable(lazy(() => import('pages/user-pages/genealogy/index')));
const RankStatsPage = Loadable(lazy(() => import('pages/user-pages/rank-stats/index')));
const ResidualsPage = Loadable(lazy(() => import('pages/user-pages/residuals/index')));
const LockedPage = Loadable(lazy(() => import('pages/user-pages/locked/index')));

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
          path: 'locked',
          element: <LockedPage />
        },
        {
          path: 'dashboard',
          element: <DashboardPage />
        },
        {
          path: 'leads',
          children: [
            {
              path: 'contact-list',
              element: <LeadListPage />
            },
            {
              path: 'pipeline-list',
              element: <PiplinePage />
            }
          ]
        },
        {
          path: 'merchant-list',
          element: <MerchantListPage />
        },
        {
          path: 'trains',
          children: [
            {
              path: 'merchant-training',
              element: <MerchantTrainingPage />
            },
            {
              path: 'brand-partner-training',
              element: <BrandPartnerTrainingPage />
            },
            {
              path: 'live-training',
              element: <LiveTrainingPage />
            }
          ]
        },
        {
          path: 'funnels',
          element: <FunnelsPage />
        },
        {
          path: 'payment_history',
          element: <PaymentHistoryPage />
        },
        {
          path: 'email-sms',
          element: <BlankPage />
        },
        {
          path: 'email-sms',
          children: [
            {
              path: 'email',
              element: <BlankPage />
            },
            {
              path: 'sms',
              element: <BlankPage />
            }
          ]
        },
        {
          path: 'calendar',
          children: [
            {
              path: 'events',
              element: <EventsCalendar />
            },
            // {
            //   path: 'calendar-settings',
            //   element: <CalendarSettings />
            // }
          ]
        },
        {
          path: 'genealogy',
          children: [
            {
              path: 'business',
              element: <Genealogy />
            },
            {
              path: 'brand-partner',
              element: <BlankPage />
            }
          ]
        },
        {
          path: 'commission',
          children: [
            {
              path: 'rank-stats',
              element: <RankStatsPage />
            },
            {
              path: 'wallet',
              element: <WalletPage />
            },
            {
              path: 'residuals',
              element: <ResidualsPage />
            },
            {
              path: 'reports',
              element: <BlankPage />
            }
          ]
        },
        // {
        //   path: 'wallet',
        //   element: <WalletPage />
        // },
        {
          path: 'settings',
          children: [
            {
              path: 'account-info',
              element: <AccountInfoPage />,
              children: [
                {
                  path: 'kyc-verification',
                  element: <AccountInfoKycPage />
                },
              ]
            },
            {
              path: 'account-settings',
              element: <AccountSettingsPage />,
              children: [
                {
                  path: 'profile',
                  element: <AccountSettingsProfilePage />
                },
                {
                  path: 'change-password',
                  element: <AccountSettingsChangePasswordPage />
                },
                {
                  path: 'mfa',
                  element: <AccountSettingsMfaPage />
                },
                {
                  path: 'membership',
                  element: <AccountTabMembership />
                }
              ]
            }
          ]
        },

        {
          path: 'support',
          children: [
            {
              path: 'resource-center',
              element: <BlankPage />
            },
            {
              path: 'ticket',
              element: <TicketPage />
            }
          ]
        }
      ]
    }
  ]
}

export default UserRoutes;
