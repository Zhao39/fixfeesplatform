import { APP_NAME } from 'config/constants';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { console_log, get_data_value } from 'utils/misc';

const ACTIVE_MANDATORY_ROUTES = []

const WebPageFooter = () => {
  const pageDataStore = useSelector((x) => x.page);
  //console.log("pageDataStore======================", pageDataStore) 
  const userDataStore = useSelector((x) => x.auth);
  const user = get_data_value(userDataStore, "user");

  const navigate = useNavigate()
  const location = useLocation();
  // console_log("WebPageFooter location::::", location);
  useEffect(() => {
    console_log("WebPageFooter location::::", location);
    updateWebPageTitle()

  }, [location, navigate]);

  const updateWebPageTitle = () => {
    if (location) {
      let pageTitle = ""
      const pathname = location.pathname
      if (pathname === "/") {
        pageTitle = "Home"
      }
      else if (pathname === "/privacy-policy") {
        pageTitle = "Privacy Policy"
      }
      else if (pathname === "/terms-service") {
        pageTitle = "Terms of Service"
      }
      else if (pathname === "/cookies-settings") {
        pageTitle = "Cookie Policy"
      }
      else if (pathname === "/disclaimer") {
        pageTitle = "Disclaimer"
      }
      else if (pathname === "/login") {
        pageTitle = "Login"
      }
      else if (pathname === "/register") {
        pageTitle = "Register"
      }
      else if (pathname === "/forgot-password") {
        pageTitle = "Forgot Password"
      }
      else if (pathname === "/reset-password") {
        pageTitle = "Reset Password"
      }
      else if (pathname === "/check-email") {
        pageTitle = "Check Email"
      }
      else if (pathname === "/confirm-email") {
        pageTitle = "Confirm Email"
      }
      /////////////////// user pages /////////////////////////////////
      else if (pathname === "/user/dashboard") {
        pageTitle = "Dashboard"
      }
      else if (pathname === "/user/calendar/events") {
        pageTitle = "Events"
      }
      else if (pathname === "/user/calendar/calendar-settings") {
        pageTitle = "Calendar Settings"
      }
      else if (pathname === "/user/websites") {
        pageTitle = "Websites"
      }
      else if (pathname === "/user/training") {
        pageTitle = "Training"
      }
      else if (pathname === "/user/settings/account-info/kyc-verification") {
        pageTitle = "Account Info - KYC Verification"
      }
      else if (pathname === "/user/settings/account-settings/profile") {
        pageTitle = "Account Settings - Profile"
      }
      else if (pathname === "/user/settings/account-settings/change-password") {
        pageTitle = "Account Settings - Change Password"
      }
      else if (pathname === "/user/settings/account-settings/mfa") {
        pageTitle = "Account Settings - 2FA"
      }


    
      else if (pathname === "/user/profiles/settings") {
        pageTitle = "Settings"
      }
      else if (pathname === "/user/wallet") {
        pageTitle = "Wallet"
      }
      else if (pathname === "/user/support/ticket") {
        pageTitle = "Support Tickets"
      }
      else if (pathname === "/user/payment-list") {
        pageTitle = "Payment History"
      }
      /////////////////// admin pages /////////////////////////////////
      else if (pathname === "/admin/training-videos") {
        pageTitle = "Training Videos"
      }
      else if (pathname === "/admin/user-list") {
        pageTitle = "Merchants"
      }
      else if (pathname === "/admin/subscriber-list") {
        pageTitle = "Subscribed emails"
      }
      else if (pathname === "/admin/profile") {
        pageTitle = "Profile"
      }
      else if (pathname === "/admin/payment-list") {
        pageTitle = "Payments"
      }
      else if (pathname === "/admin/withdrawal-list") {
        pageTitle = "Withdrawals"
      }
      else if (pathname === "/admin/company-stats") {
        pageTitle = "Company Stats"
      }
      else if (pathname === "/admin/ticket") {
        pageTitle = "Ticket Management"
      }
      else if (pathname === "/admin/announcement") {
        pageTitle = "Ammouncement"
      }
      else if (pathname === "/admin/setting") {
        pageTitle = "Settings"
      }
      else if (pathname === "/admin/coupon-list") {
        pageTitle = "Coupons"
      }
      else {
        pageTitle = ""
      }

      checkRouteIsAvailable(pathname)

      /////////////////////////////////////////////////////////
      setWebPageTitle(pageTitle)
    }
  }

  const setWebPageTitle = (currentPageTitle) => {
    let doc_title = APP_NAME;
    if (currentPageTitle) {
      doc_title = currentPageTitle + " | " + APP_NAME;
    } else {
      doc_title = APP_NAME;
    }
    document.title = doc_title;
  }

  const checkRouteIsAvailable = (pathname) => {
    if(user?.is_active === 1) {
      return true
    }else{
      for(let k in ACTIVE_MANDATORY_ROUTES) {
        const routeName = ACTIVE_MANDATORY_ROUTES[k]
        if(pathname.includes(routeName)) {
          navigate(`/user/profiles/membership`)
          return false
        }
      }
    }
  }

  return (
    <>
    </>
  )
}

export default WebPageFooter;
