import { Express } from 'express'
import cors from 'cors';
import { homeController } from '../controllers/home.controller'
import { indexController } from '../controllers/index.controller'

import { userTestController } from '../controllers/user/user.test.controller'
import { userProfileController } from '../controllers/user/user.profile.controller'
import { userCommonController } from '../controllers/user/user.common.controller'
import { userDashboardController } from '../controllers/user/user.dashboard.controller'
import { userTicketController } from '../controllers/user/user.ticket.controller'
import { userNotificationController } from '../controllers/user/user.notification.controller'
import { userTrainingVideosController } from '../controllers/user/user.training.videos.controller'
import { userKycDocController } from '../controllers/user/user.kyc.doc.controller'
import { userVerificationController } from '../controllers/user/user.verification.controller'
import { userLeadController } from '../controllers/user/user.lead.controller'
import { userCalendarController } from '../controllers/user/user.calendar.controller'
import { userMerchantController } from '../controllers/user/user.merchant.controller'
import { userWalletController } from '../controllers/user/user.wallet.controller'
import { userTransactionController } from '../controllers/user/user.transaction.controller'
import { userRankStatsController } from '../controllers/user/user.rank.stats.controller';
import { userResidualsController } from '../controllers/user/user.residuals.controller';

import { adminCommonController } from '../controllers/admin/admin.common.controller'
import { adminSettingController } from '../controllers/admin/admin.setting.controller'
import { adminUserController } from '../controllers/admin/admin.user.controller'
import { adminTicketController } from '../controllers/admin/admin.ticket.controller'
import { adminLeadController } from '../controllers/admin/admin.lead.controller'
import { adminTrainingVideoController } from '../controllers/admin/admin.training.videos.controller'
import { adminCalendarController } from '../controllers/admin/admin.calendar.controller'
import { adminTransactionController } from '../controllers/admin/admin.transaction.controller';
import { adminCouponController } from '../controllers/admin/admin.coupon.controller';
import { adminProspectController } from '../controllers/admin/admin.prospect.controller';
import { adminFunnelTypesController } from '../controllers/admin/admin.funnel.types.controller';

import { webhookNmiController } from '../controllers/webhook/webhook.nmi.controller'

////////////// business controllers /////////////////////////////////////////////////////
import { businessHomeController } from '../controllers/business.home.controller'
import { businessProfileController } from '../controllers/business/business.profile.controller'
import { businessTicketController } from '../controllers/business/business.ticket.controller'
import { businessDashboardController } from '../controllers/business/business.dashboard.controller'

import { businessAdminTicketController } from '../controllers/business-admin/business-admin.ticket.controller'
import { businessAdminCommonController } from '../controllers/business-admin/business-admin.common.controller'
import { businessAdminSettingController } from '../controllers/business-admin/business-admin.setting.controller'
import { businessAdminUserController } from '../controllers/business-admin/business-admin.user.controller'
import { userFunnelTypesController } from '../controllers/user/user.funnel.types.controller';

export default class IndexRoute {
  constructor(app: Express) {
    app.use(cors());

    //app.get('/', indexController.index)
    app.get('/test', indexController.test)
    app.get('/wait/loading', indexController.waitLoading)
    app.post('/check-email-exist', homeController.checkEmailExist)

    ///////////////////////////////////partner home routes///////////////////////////////////////////
    app.get('/app-setting', homeController.get_app_settings)
    app.post('/check-sponsor', homeController.checkSponsor)
    app.post('/save-register-detail', homeController.registerDetail)
    app.post('/check-email', homeController.checkEmail) // check email for registration
    app.post('/resend-check-email', homeController.resendCheckEmail)
    app.post('/confirm-email-verification', homeController.confirmEmailVerification)
    app.post('/check-email-verified', homeController.checkEmailVerified)
    app.post('/save-register-billing-info', homeController.registerBillInfo)
    app.post('/complete-register', homeController.completeRegister)

    app.post('/login', homeController.login)
    app.post('/login-two-fact-auth', homeController.loginTwoFactAuth)
    app.get('/logout', homeController.logout)
    app.post('/send-forgot-password-email', homeController.sendForgotPasswordEmail)
    app.post('/reset-password', homeController.resetPassword)
    app.post('/check-coupon', homeController.checkCoupon)
    app.get('/check-coupon-security', homeController.checkCouponSecurity)
    app.get('/get-register-page-data', homeController.getRegisterPageData)
    app.post('/save-register-email', homeController.registerEmail)
    app.post('/apply-membership-coupon', homeController.applyMembershipCoupon)

    ///////////////////////////////////partner user routes//////////////////////////////////////////
    app.get('/user/training-videos/list', userTrainingVideosController.getList)

    app.get('/user/profile/get-page-detail', userProfileController.getPageDetail)
    app.post('/user/profile/update-detail', userProfileController.updateDetail)
    app.post('/user/profile/update-password', userProfileController.updatePassword)

    app.get('/user/profile/check-bill-membership-required', userProfileController.checkBillMembershipRequired)
    app.post('/user/profile/bill-membership', userProfileController.billMembership)
    app.post('/user/profile/update-membership', userProfileController.updateMembership)
    app.post('/user/profile/cancel-membership', userProfileController.cancelMembership)
    app.post('/user/profile/recover-membership', userProfileController.recoverMembership)
    
    app.post('/user/check-user-password', userCommonController.checkUserPassword)

    app.get('/user/dashboard/get-page-detail', userDashboardController.getPageDetail)
    app.get('/user/dashboard/get-performance-data', userDashboardController.getTopPerformanceData)

    app.get('/user/ticket/get-data-list', userTicketController.getDataList)
    app.post('/user/ticket/add', userTicketController.submitTicket)
    app.get('/user/ticket/detail', userTicketController.getTicketDetail)
    app.post('/user/ticket/submit-ticket-message', userTicketController.submitTicketMessage)
    app.post('/user/ticket/close-ticket', userTicketController.closeTicket)

    app.get('/user/get-user-detail', userProfileController.getDetail)
    app.get('/user/get-user-membership-detail', userProfileController.getUserMembershipDetail)

    app.put('/user/notification/read', userNotificationController.read)

    app.get('/user/kyc/get-page-detail', userKycDocController.getPageDetail)
    app.post('/user/kyc/submit', userKycDocController.submit)

    app.get('/user/verification/get-detail', userVerificationController.getDetail)
    app.post('/user/verification/complete', userVerificationController.completeVerification)
    app.get('/user/verification/cancel', userVerificationController.cancelVerification)

    app.get('/user/lead/get-merchant-data-list', userLeadController.getMerchantDataList)
    app.get('/user/lead/get-merchant-data-all-list', userLeadController.getMerchantDataAllList)
    app.get('/user/lead/get-partner-data-list', userLeadController.getPartnerDataList)
    app.get('/user/lead/get-partner-data-all-list', userLeadController.getPartnerDataAllList)
    app.post('/user/lead/add-merchant-prospects', userLeadController.addMerchantProspect)
    app.delete('/user/lead/remove-merchant-prospects', userLeadController.removeMerchantProspect)
    app.post('/user/lead/add-partner-prospects', userLeadController.addPartnerProspect)
    app.delete('/user/lead/remove-partner-prospects', userLeadController.removePartnerProspect)

    app.get('/user/calendar/auth-url', userCalendarController.getAuthUrl)
    app.get('/user/calendar/oauth2callback', userCalendarController.processOAuth2Callback)
    app.get('/user/calendar/events', userCalendarController.getEvents)
    app.get('/user/calendar/colors', userCalendarController.getColors)
    app.post('/user/calendar/create-event', userCalendarController.createEvent)
    app.post('/user/calendar/save-oauth-token', userCalendarController.saveOauthToken)

    app.get('/user/merchants/residual-reports', userMerchantController.getMerchantResidualReport)
    app.get('/user/merchants/get-merchant-data-list', userMerchantController.getMerchantDataList)

    app.get('/user/wallet/get-page-detail', userWalletController.getPageDetail)
    app.post('/user/wallet/request-withdrawal', userWalletController.requestWithdrawal)
    app.post('/user/wallet/export', userWalletController.export)

    app.get('/user/transaction/get-data-list', userTransactionController.getDataList)
    app.post('/user/transaction/download-invoice', userTransactionController.downloadInvoice)

    app.get('/user/rank-stats/get-page-detail', userRankStatsController.getPageDetail)
    app.post('/user/rank-stats/export', userRankStatsController.export)
    app.get('/user/residuals/get-page-detail', userResidualsController.getPageDetail)
    app.post('/user/residuals/export', userResidualsController.export)
    app.get('/user/residuals/get-processor-residual', userResidualsController.getProcessorResidual)
    app.post('/user/residuals/export-processor-residual', userResidualsController.exportProcessorResidualData)
    app.get('/user/residuals/get-merchant-residual-profit-detail', userResidualsController.getMerchantResidualProfitDetail)

    app.get('/user/funnel-type/get-list', userFunnelTypesController.getList)

    app.all('/user/test/test_func', userTestController.test_func)

    ///////////////////////////////////partner admin routes //////////////////////////////////////////

    app.get('/admin/coupon/get-data-list', adminCouponController.getDataList)
    app.post('/admin/coupon/submit-coupon', adminCouponController.submitCoupon)
    app.delete('/admin/coupon/delete/:id', adminCouponController.deleteCoupon)
    app.post('/admin/transaction/delete-transaction', adminTransactionController.deleteTransaction)
    app.get('/admin/transaction/get-data-list', adminTransactionController.getDataList)
    app.get('/admin/users/get-data-list', adminUserController.getDataList)
    app.put('/admin/user/:id', adminUserController.update)
    app.post('/admin/user/set-tmp-password', adminUserController.setUserTmpPassword)
    app.post('/admin/user/update-status', adminUserController.updateStatus)
    app.get('/admin/user-kyc/get-detail', adminUserController.getUserKycDoc)
    app.post('/admin/user-kyc/update-status', adminUserController.updateUserKycStatus)
    app.get('/admin/leads/get-data-list', adminLeadController.getDataList)
    app.get('/admin/ticket/get-data-list', adminTicketController.getDataList)
    app.get('/admin/ticket/detail', adminTicketController.getTicketDetail)
    app.post('/admin/ticket/submit-ticket-message', adminTicketController.submitTicketMessage)
    app.get('/admin/get-profile-info', adminCommonController.getProfileInfo)
    app.post('/admin/update-profile-info', adminCommonController.updateProfileInfo)
    app.get('/admin/setting/get-page-detail', adminSettingController.getPageDetail)
    app.post('/admin/setting/update', adminSettingController.updateSetting)
    app.get('/admin/training-videos/get-data-list', adminTrainingVideoController.getDataList)
    app.get('/admin/training-videos/list', adminTrainingVideoController.getList)
    app.post('/admin/training-video', adminTrainingVideoController.add)
    app.put('/admin/training-video/:id', adminTrainingVideoController.update)
    app.delete('/admin/training-video/:id', adminTrainingVideoController.delete)
    app.post('/admin/training-videos/update-priority', adminTrainingVideoController.updatePriority)

    app.get('/admin/calendar/auth-url', adminCalendarController.getAuthUrl)
    app.get('/admin/calendar/oauth2callback', adminCalendarController.processOAuth2Callback)
    app.get('/admin/calendar/oauth-token', adminCalendarController.getOauthToken)
    app.post('/admin/calendar/oauth-token', adminCalendarController.saveOauthToken)
    app.delete('/admin/calendar/oauth-token', adminCalendarController.deleteOauthToken)
    app.get('/admin/calendar/events', adminCalendarController.getEvents)
    app.post('/admin/calendar/save-event', adminCalendarController.saveEvent)
    app.post('/admin/calendar/delete-event', adminCalendarController.deleteEvent)
    app.get('/admin/calendar/colors', adminCalendarController.getColors)
    app.get('/admin/prospect/get-data-list', adminProspectController.getDataList)
    app.get('/admin/funnel-type/get-list', adminFunnelTypesController.getList)
    app.get('/admin/funnel-type/get-info', adminFunnelTypesController.getInfo)
    app.post('/admin/funnel-type/update', adminFunnelTypesController.updateInfo)

    ////////////////////////////////////nmi webhook route///////////////////////////////////////
    app.post('/webhook/nmi/hook-received', webhookNmiController.hookReceived)


    //////////////////// business side routes /////////////////////////////////////////////////////////////////////
    app.post('/business/register', businessHomeController.register)
    app.post('/business/login', businessHomeController.login)
    app.post('/business/login-two-fact-auth', businessHomeController.loginTwoFactAuth)
    app.get('/business/logout', businessHomeController.logout)
    app.post('/business/send-forgot-password-email', businessHomeController.sendForgotPasswordEmail)
    app.post('/business/reset-password', businessHomeController.resetPassword)
    app.get('/business/get-business-detail', businessProfileController.getDetail)
    app.get('/business/ticket/get-data-list', businessTicketController.getDataList)
    app.post('/business/ticket/add', businessTicketController.submitTicket)
    app.get('/business/ticket/detail', businessTicketController.getTicketDetail)
    app.post('/business/ticket/submit-ticket-message', businessTicketController.submitTicketMessage)
    app.post('/business/ticket/close-ticket', businessTicketController.closeTicket)
    app.get('/business/dashboard/get-page-detail', businessDashboardController.getPageDetail)
    app.post('/business/dashboard/upload-business-doc', businessDashboardController.uploadBusinessDoc)

    //////////////////// business side admin routes ////////////////////////////////////////////////////////////////
    app.post('/business-admin/ticket/submit-ticket', businessAdminTicketController.submitTicket)
    app.get('/business-admin/ticket/get-data-list', businessAdminTicketController.getDataList)
    app.get('/business-admin/ticket/detail', businessAdminTicketController.getTicketDetail)
    app.post('/business-admin/ticket/submit-ticket-message', businessAdminTicketController.submitTicketMessage)
    app.get('/business-admin/users/get-data-list', businessAdminUserController.getDataList)
    app.put('/business-admin/user/:id', businessAdminUserController.update)
    app.get('/business-admin/get-profile-info', businessAdminCommonController.getProfileInfo)
    app.post('/business-admin/update-profile-info', businessAdminCommonController.updateProfileInfo)
    app.get('/business-admin/setting/get-page-detail', businessAdminSettingController.getPageDetail)
    app.post('/business-admin/setting/update', businessAdminSettingController.updateSetting)
  }
}