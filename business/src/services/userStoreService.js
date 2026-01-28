import { getLocalTimezone } from "utils/misc";
import { axiosGet, axiosPost } from "./ajaxServices";
import { urlAddUserStore, urlDeleteUserStore, urlGetAdOrderList, urlUserGetAllStats, urlGetFacebookAdsAccountList, urlGetAdsetInsightList, urlGetAdsInsightList, urlGetFacebookAuthUrl, urlGetFacebookBusinessAccountList, urlGetFacebookBusinessAdsAccountList, urlGetFacebookCampaignInsightList, urlGetOpenPixelSnippet, urlGetPixelInsightList, urlGetPixelListData, urlGetUserStoreData, urlGetUserStoreList, urlUpdateFacebookSetting, urlUpdateUserStore, urlUpdateTiktokSetting, urlGetCampaignInsightList, urlDisconnectIntegration, urlGetTiktokSetting, urlGetFacebookSetting, urlUserChangePixelInstallMode, urlUserInstallPixel, urlUserUninstallPixel, urlDisconnectUserStore, urlGetAdPreviewInfo, urlGetAdCreativeThumbnail, urlGetUserDetail, urlGetStoreTeamMembers, urlAddStoreMember, urlDeleteStoreMember, urlAcceptStoreMemberInvitation, urlRejectStoreMemberInvitation } from "./constants";

export const apiGetUserStoreList = async (params) => {
  const url = urlGetUserStoreList;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAddUserStore = async (params) => {
  const url = urlAddUserStore;
  var formData = new FormData();
  formData.append("store_url", params.store_url);
  formData.append("industry", params.industry);
  const response = await axiosPost(url, formData)
  return response
}

export const apiUpdateUserStore = async (params) => {
  const url = urlUpdateUserStore;
  var formData = new FormData();
  formData.append("id", params.id);
  formData.append("store_url", params.store_url);
  formData.append("industry", params.industry);
  const response = await axiosPost(url, formData)
  return response
}

export const apiDisconnectUserStore = async (params) => {
  const url = urlDisconnectUserStore;
  var formData = new FormData();
  formData.append("id", params.id);
  const response = await axiosPost(url, formData)
  return response
}

export const apiDeleteUserStore = async (params) => {
  const url = urlDeleteUserStore;
  var formData = new FormData();
  formData.append("id", params.id);
  const response = await axiosPost(url, formData)
  return response
}

export const apiGetUserStoreData = async (params) => {
  const url = urlGetUserStoreData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiDisconnectIntegration = async (params = {}) => {
  const url = urlDisconnectIntegration;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetFacebookAuthUrl = async (params = {}) => {
  const url = urlGetFacebookAuthUrl;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetFacebookBusinessAccountList = async (params = {}) => {
  const url = urlGetFacebookBusinessAccountList;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
export const apiGetFacebookBusinessAdsAccountList = async (params = {}) => {
  const url = urlGetFacebookBusinessAdsAccountList;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
export const apiGetFacebookAdsAccountList = async (params = {}) => {
  const url = urlGetFacebookAdsAccountList;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
export const apiGetFacebookSetting = async (params = {}) => {
  const url = urlGetFacebookSetting;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
export const apiUpdateFacebookSetting = async (params = {}) => {
  const url = urlUpdateFacebookSetting;
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiGetPixelListData = async (params = {}) => {
  const url = urlGetPixelListData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetPixelInsightList = async (params = {}) => {
  const url = urlGetPixelInsightList;
  const get_params = { ...params }
  const local_iana_timezone = getLocalTimezone()
  get_params['local_iana_timezone'] = local_iana_timezone
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetFacebookCampaignInsightList = async (params = {}) => {
  const url = urlGetFacebookCampaignInsightList;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetAdsetInsightList = async (params = {}) => {
  const url = urlGetAdsetInsightList;
  const get_params = { ...params }
  const local_iana_timezone = getLocalTimezone()
  get_params['local_iana_timezone'] = local_iana_timezone
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetAdsInsightList = async (params = {}) => {
  const url = urlGetAdsInsightList;
  const get_params = { ...params }
  const local_iana_timezone = getLocalTimezone()
  get_params['local_iana_timezone'] = local_iana_timezone
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetOpenPixelSnippet = async (params = {}) => {
  const url = urlGetOpenPixelSnippet;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserChangePixelInstallMode = async (params = {}) => {
  const url = urlUserChangePixelInstallMode;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserInstallPixel = async (params = {}) => {
  const url = urlUserInstallPixel;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserUninstallPixel = async (params = {}) => {
  const url = urlUserUninstallPixel;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetAdOrderList = async (params = {}) => {
  const url = urlGetAdOrderList;
  const get_params = { ...params }
  const local_iana_timezone = getLocalTimezone()
  get_params['local_iana_timezone'] = local_iana_timezone
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserGetAllStats = async (params = {}) => {
  const url = urlUserGetAllStats;
  const get_params = { ...params }
  const local_iana_timezone = getLocalTimezone()
  get_params['local_iana_timezone'] = local_iana_timezone
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetTiktokSetting = async (params = {}) => {
  const url = urlGetTiktokSetting;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUpdateTiktokSetting = async (params = {}) => {
  const url = urlUpdateTiktokSetting;
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiGetCampaignInsightList = async (params = {}) => {
  const url = urlGetCampaignInsightList;
  const get_params = { ...params }
  const local_iana_timezone = getLocalTimezone()
  get_params['local_iana_timezone'] = local_iana_timezone
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetAdPreviewInfo = async (params = {}) => {
  const url = urlGetAdPreviewInfo;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetAdCreativeThumbnail = async (params = {}) => {
  const url = urlGetAdCreativeThumbnail;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetStoreTeamMembers = async (params = {}) => {
  const url = urlGetStoreTeamMembers;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAddStoreMember = async (params) => {
  const url = urlAddStoreMember;
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiDeleteStoreMember = async (params) => {
  const url = urlDeleteStoreMember;
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiAcceptStoreMemberInvitation = async (params) => {
  const url = urlAcceptStoreMemberInvitation;
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiRejectStoreMemberInvitation = async (params) => {
  const url = urlRejectStoreMemberInvitation
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}