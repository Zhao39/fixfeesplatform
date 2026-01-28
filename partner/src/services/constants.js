import { BASE_API_URL } from "config/constants";

export const urlCheckSponsor = BASE_API_URL + "/check-sponsor";
export const urlSaveRegistraterDetail = BASE_API_URL + "/save-register-detail";
export const urlSaveRegisterBillingInfo = BASE_API_URL + "/save-register-billing-info";
export const urlCompleteRegister = BASE_API_URL + "/complete-register";

export const urlLogin = BASE_API_URL + "/login";
export const urlLoginTwoFactAuth = BASE_API_URL + "/login-two-fact-auth";
export const urlLogout = BASE_API_URL + "/logout";
export const urlSendForgotPasswordEmail = BASE_API_URL + "/send-forgot-password-email";
export const urlResetPassword = BASE_API_URL + "/reset-password";

export const urlGetRegistraterPageData = BASE_API_URL + "/get-register-page-data";
export const urlSaveRegistraterEmail = BASE_API_URL + "/save-register-email";
export const urlSaveRegistraterBillPlan = BASE_API_URL + "/save-register-bill-plan";
export const urlCheckCouponSecurity = BASE_API_URL + "/check-coupon-security";

export const urlSendConfirmEmail = BASE_API_URL + "/check-email";
export const urlResendConfirmEmail = BASE_API_URL + "/resend-check-email";
export const urlCheckEmailVerified = BASE_API_URL + "/check-email-verified";
export const urlConfirmEmailVerification = BASE_API_URL + "/confirm-email-verification";
export const urlCheckCoupon = BASE_API_URL + "/check-coupon";
export const urlApplyMembershipCoupon = BASE_API_URL + "/apply-membership-coupon";

export const urlGetFacebookAuthUrl = BASE_API_URL + "/facebook/get-auth-url";

//////////////////////////// user api urls /////////////////////////////////////////
export const urlGetUserStoreList = BASE_API_URL + "/user/store/get-data-list";
export const urlAddUserStore = BASE_API_URL + "/user/store/add";
export const urlUpdateUserStore = BASE_API_URL + "/user/store/update";
export const urlDeleteUserStore = BASE_API_URL + "/user/store/delete";
export const urlDisconnectUserStore = BASE_API_URL + "/user/store/disconnect";
export const urlGetUserStoreData = BASE_API_URL + "/user/store/get-store-data";
export const urlDisconnectIntegration = BASE_API_URL + "/user/store-integration/disconnect";
export const urlGetFacebookBusinessAccountList = BASE_API_URL + "/user/store-integration/facebook/get-business-account-list";
export const urlGetFacebookBusinessAdsAccountList = BASE_API_URL + "/user/store-integration/facebook/get-business-ads-account-list";
export const urlGetFacebookAdsAccountList = BASE_API_URL + "/user/store-integration/facebook/get-ads-account-list";
export const urlGetFacebookSetting = BASE_API_URL + "/user/store-integration/facebook/get-setting";
export const urlUpdateFacebookSetting = BASE_API_URL + "/user/store-integration/facebook/update-setting";
export const urlGetPixelListData = BASE_API_URL + "/user/pixel/get-pixel-list";
export const urlGetFacebookCampaignInsightList = BASE_API_URL + "/user/attribution/ads/facebook/get-campaign-insight-list";
export const urlGetOpenPixelSnippet = BASE_API_URL + "/user/pixel/openpixel/get-snippet";
export const urlUserChangePixelInstallMode = BASE_API_URL + "/user/shopify-pixel/change-install-mode";
export const urlUserInstallPixel = BASE_API_URL + "/user/shopify-pixel/install";
export const urlUserUninstallPixel = BASE_API_URL + "/user/shopify-pixel/uninstall";

export const urlGetAdOrderList = BASE_API_URL + "/user/pixel/get-ad-order-list";
export const urlUserGetProfile = BASE_API_URL + "/user/profile/get-page-detail";
export const urlUserUpdateProfile = BASE_API_URL + "/user/profile/update-detail";
export const urlUserBillMembership = BASE_API_URL + "/user/profile/bill-membership";
export const urlUserUpdateMembership = BASE_API_URL + "/user/profile/update-membership";
export const urlUserCancelMembership = BASE_API_URL + "/user/profile/cancel-membership";
export const urlUserRecoverMembership = BASE_API_URL + "/user/profile/recover-membership";
export const urlUserCheckBillMembershipRequired = BASE_API_URL + "/user/profile/check-bill-membership-required";
export const urlUserUpdatePassword = BASE_API_URL + "/user/profile/update-password";
export const urlUserUpdateCardDetail = BASE_API_URL + "/user/profile/update-card-detail";
export const urlUserRemoveCardDetail = BASE_API_URL + "/user/profile/remove-card-detail";
export const urlUserGetAllStats = BASE_API_URL + "/user/stats/get-all-stats";
export const urlGetTiktokSetting = BASE_API_URL + "/user/store-integration/tiktok/get-setting";
export const urlUpdateTiktokSetting = BASE_API_URL + "/user/store-integration/tiktok/update-setting";

export const urlGetPixelInsightList = BASE_API_URL + "/user/pixel/get-pixel-insight";
export const urlGetCampaignInsightList = BASE_API_URL + "/user/pixel/get-campaign-insight";
export const urlGetAdsetInsightList = BASE_API_URL + "/user/pixel/get-adset-insight"; //get adset insight of a campaign
export const urlGetAdsInsightList = BASE_API_URL + "/user/pixel/get-ad-insight"; //get ads insight of a adset
export const urlGetAdPreviewInfo = BASE_API_URL + "/user/ad/get-ad-preview-info";
export const urlGetAdCreativeThumbnail = BASE_API_URL + "/user/ad/get-ad-creative-thumbnail";

export const urlGetStoreTeamMembers = BASE_API_URL + "/user/store/get-team-members";
export const urlAddStoreMember = BASE_API_URL + "/user/store/add-team-members";
export const urlDeleteStoreMember = BASE_API_URL + "/user/store/delete-team-members";
export const urlAcceptStoreMemberInvitation = BASE_API_URL + "/user/store/accept-team-member-invitation";
export const urlRejectStoreMemberInvitation = BASE_API_URL + "/user/store/reject-team-member-invitation";

export const urlUserGetDashboardData = BASE_API_URL + "/user/dashboard/get-page-detail";
export const urlUserGetDashboardPerformanceData = BASE_API_URL + "/user/dashboard/get-performance-data";
export const urlUserGetWalletPageData = BASE_API_URL + "/user/wallet/get-page-detail";
export const urlUserExportWalletPageData = BASE_API_URL + "/user/wallet/export";
export const urlUserRequestWithdrawal = BASE_API_URL + "/user/wallet/request-withdrawal";
export const urlUserGetActiveMerchantsData = BASE_API_URL + "/user/lead/get-merchant-data-list"

export const urlUserSubmitTicket = BASE_API_URL + "/user/ticket/add";
export const urlUserGetTicketDetail = BASE_API_URL + "/user/ticket/detail";
export const urlUserSubmitTicketMessage = BASE_API_URL + "/user/ticket/submit-ticket-message";
export const urlUserCloseTicket = BASE_API_URL + "/user/ticket/close-ticket";

export const urlUserGetKycDetail = BASE_API_URL + "/user/kyc/get-page-detail";
export const urlUserSubmitKyc = BASE_API_URL + "/user/kyc/submit";


export const urlUserSendGptRequest = BASE_API_URL + "/user/gpt/send-request";
export const urlGetUserDetail = BASE_API_URL + "/user/get-user-detail";
export const urlGetUserMembershipDetail = BASE_API_URL + "/user/get-user-membership-detail";

export const urlUserReadNotification = BASE_API_URL + "/user/notification/read";

export const urlUserGetVideoList = BASE_API_URL + "/user/training-videos/list";

export const urlUserGetVerificationDetail = BASE_API_URL + "/user/verification/get-detail";
export const urlUserCompleteVerification = BASE_API_URL + "/user/verification/complete";
export const urlUserCancelVerification = BASE_API_URL + "/user/verification/cancel";

export const urlUserGetCalendarAuthUrl = BASE_API_URL + "/user/calendar/auth-url";
export const urlUserSaveGoogleOauthToken = BASE_API_URL + "/user/calendar/save-oauth-token";
export const urlUserGetCalendarEvents = BASE_API_URL + "/user/calendar/events";
export const urlUserSaveCalendarEvent = BASE_API_URL + "/user/calendar/save-event";
export const urlUserGetCalendarColors = BASE_API_URL + "/user/calendar/colors";

export const urlUserGetMerchantResidualData = BASE_API_URL + "/user/merchants/residual-reports";
export const urlUserGetMerchantData = BASE_API_URL + "/user/lead/get-merchant-data-list";

export const urlDownloadInvoice = BASE_API_URL + "/user/transaction/download-invoice";

export const urlUserGetRankStatsData = BASE_API_URL + "/user/rank-stats/get-page-detail";
export const urlUserExportRankStatsPageData = BASE_API_URL + "/user/rank-stats/export";
export const urlUserGetResidualsPageData = BASE_API_URL + "/user/residuals/get-page-detail";
export const urlUserExportResidualsPageData = BASE_API_URL + "/user/residuals/export";
export const urlUserGetProcessorResidualsData = BASE_API_URL + "/user/residuals/get-processor-residual";
export const urlUserExportProcessorResidualsData = BASE_API_URL + "/user/residuals/export-processor-residual";
export const urlUserGetMerchantResidualProfitDetail = BASE_API_URL + "/user/residuals/get-merchant-residual-profit-detail";

export const urlUserGetFunnelTypeList = BASE_API_URL + "/user/funnel-type/get-list";

//////////////////////////// admin api urls /////////////////////////////////////////

export const urlAdminGetCalendarAuthUrl = BASE_API_URL + "/admin/calendar/auth-url";
export const urlAdminGetGoogleOauthToken = BASE_API_URL + "/admin/calendar/oauth-token";
export const urlAdminSaveGoogleOauthToken = BASE_API_URL + "/admin/calendar/oauth-token";
export const urlAdminDeleteGoogleOauthToken = BASE_API_URL + "/admin/calendar/oauth-token";
export const urlAdminGetCalendarEvents = BASE_API_URL + "/admin/calendar/events";
export const urlAdminSaveCalendarEvent = BASE_API_URL + "/admin/calendar/save-event";
export const urlAdminDeleteCalendarEvent = BASE_API_URL + "/admin/calendar/delete-event";
export const urlAdminGetCalendarColors = BASE_API_URL + "/admin/calendar/colors";

export const urlAdminGetProfile = BASE_API_URL + "/admin/get-profile-info";
export const urlAdminUpdateProfile = BASE_API_URL + "/admin/update-profile-info";

export const urlAdminGetCompanyStats = BASE_API_URL + "/admin/company-stats";
export const urlAdminDeleteSubscriber = BASE_API_URL + "/admin/subscriber";
export const urlAdminUpdateUserInfo = BASE_API_URL + "/admin/user";
export const urlAdminSetUserTmpPassword = BASE_API_URL + "/admin/user/set-tmp-password";
export const urlAdminUpdateUserStatus = BASE_API_URL + "/admin/user/update-status";
export const urlAdminUpdateWithdrawStatus = BASE_API_URL + "/admin/withdraw/update-status";

export const urlAdminGetTicketList = BASE_API_URL + "/admin/ticket/get-data-list";
export const urlAdminGetTicketDetail = BASE_API_URL + "/admin/ticket/detail";
export const urlAdminSubmitTicketMessage = BASE_API_URL + "/admin/ticket/submit-ticket-message";

export const urlAdminSubmitCouponInfo = BASE_API_URL + "/admin/coupon/submit-coupon";
export const urlAdminDeleteCouponInfo = BASE_API_URL + "/admin/coupon/delete";

export const urlAdminSubmitAnnouncement = BASE_API_URL + "/admin/announcement/submit";
export const urlAdminDeleteTransaction = BASE_API_URL + "/admin/transaction/delete-transaction";

export const urlAdminGetSetting = BASE_API_URL + "/admin/setting/get-page-detail";
export const urlAdminUpdateSetting = BASE_API_URL + "/admin/setting/update";

export const urlAdminGetVideoList = BASE_API_URL + "/admin/training-videos/list";
export const urlAdminUpdateVideoInfo = BASE_API_URL + "/admin/training-video";
export const urlAdminAddVideoInfo = BASE_API_URL + "/admin/training-video";
export const urlAdminDeleteVideoInfo = BASE_API_URL + "/admin/training-video";
export const urlAdminUpdateVideoPriority = BASE_API_URL + "/admin/training-videos/update-priority";

export const urlAdminGetUserKycDoc = BASE_API_URL + "/admin/user-kyc/get-detail";
export const urlAdminUpdateUserKycStatus = BASE_API_URL + "/admin/user-kyc/update-status";

export const urlAdminGetFunnelTypeList = BASE_API_URL + "/admin/funnel-type/get-list";
export const urlAdminUpdateFunnelType = BASE_API_URL + "/admin/funnel-type/update";

