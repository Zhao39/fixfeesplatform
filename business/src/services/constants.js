import { BASE_API_URL } from "config/constants";

const URL_PREFIX = "/business"

export const urlRegistraterBusiness = BASE_API_URL + "/business/register";

export const urlLogin = BASE_API_URL + URL_PREFIX + "/login";
export const urlLoginTwoFactAuth = BASE_API_URL + URL_PREFIX + "/login-two-fact-auth";
export const urlLogout = BASE_API_URL + URL_PREFIX + "/logout";
export const urlSendForgotPasswordEmail = BASE_API_URL + URL_PREFIX + "/send-forgot-password-email";
export const urlResetPassword = BASE_API_URL + URL_PREFIX + "/reset-password";

export const urlGetBusinessDetail = BASE_API_URL + URL_PREFIX + "/get-business-detail";
export const urlUserSubmitTicket = BASE_API_URL + "/business/ticket/add";
export const urlUserGetTicketDetail = BASE_API_URL + "/business/ticket/detail";
export const urlUserSubmitTicketMessage = BASE_API_URL + "/business/ticket/submit-ticket-message";
export const urlUserCloseTicket = BASE_API_URL + "/business/ticket/close-ticket";

export const urlUserGetDashboardData = BASE_API_URL + "/business/dashboard/get-page-detail";
export const urlUserUploadBusinessDoc = BASE_API_URL + "/business/dashboard/upload-business-doc";

export const urlAdminGetProfile = BASE_API_URL + "/business-admin/get-profile-info";
export const urlAdminUpdateProfile = BASE_API_URL + "/business-admin/update-profile-info";
export const urlAdminSubmitTicket = BASE_API_URL + "/business-admin/ticket/submit-ticket";
export const urlAdminGetTicketList = BASE_API_URL + "/business-admin/ticket/get-data-list";
export const urlAdminGetTicketDetail = BASE_API_URL + "/business-admin/ticket/detail";
export const urlAdminSubmitTicketMessage = BASE_API_URL + "/business-admin/ticket/submit-ticket-message";

export const urlAdminUpdateUserInfo = BASE_API_URL + "/business-admin/user";
export const urlAdminSetUserTmpPassword = BASE_API_URL + "/business-admin/user/set-tmp-password";
export const urlAdminUpdateUserStatus = BASE_API_URL + "/business-admin/user/update-status";


///////////////////////////////////////////////////////////////////////////////////////////////////////
export const urlCheckSponsor = BASE_API_URL + "/check-sponsor";
export const urlSaveRegistraterDetail = BASE_API_URL + "/save-register-detail";
export const urlSaveRegisterBillingInfo = BASE_API_URL + "/save-register-billing-info";
export const urlCompleteRegister = BASE_API_URL + "/complete-register";

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

export const urlUserGetWalletPageData = BASE_API_URL + "/user/wallet/get-page-detail";
export const urlUserRequestWithdrawal = BASE_API_URL + "/user/wallet/request-withdrawal";

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

//////////////////////////// admin api urls /////////////////////////////////////////
export const urlAdminGetCompanyStats = BASE_API_URL + "/admin/company-stats";
export const urlAdminDeleteSubscriber = BASE_API_URL + "/admin/subscriber";
export const urlAdminUpdateWithdrawStatus = BASE_API_URL + "/admin/withdraw/update-status";

export const urlAdminUpdateCouponInfo = BASE_API_URL + "/admin/coupon";
export const urlAdminAddCouponInfo = BASE_API_URL + "/admin/coupon";
export const urlAdminDeleteCouponInfo = BASE_API_URL + "/admin/coupon";

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
