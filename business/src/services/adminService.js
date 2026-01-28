import { axiosDelete, axiosGet, axiosPut, axiosPost, axiosPostMultipart } from "./ajaxServices";
import { urlAdminDeleteSubscriber, urlAdminGetCompanyStats, urlAdminSetUserTmpPassword, urlAdminUpdateUserInfo, urlAdminUpdateUserStatus, urlAdminUpdateWithdrawStatus, urlAdminGetProfile, urlAdminUpdateCouponInfo, urlAdminAddCouponInfo, urlAdminDeleteCouponInfo, urlAdminSubmitAnnouncement, urlAdminDeleteTransaction, urlAdminUpdateProfile, urlAdminUpdateSetting, urlAdminGetSetting, urlAdminUpdateVideoInfo, urlAdminAddVideoInfo, urlAdminDeleteVideoInfo, urlAdminGetVideoList, urlAdminUpdateVideoPriority, urlAdminGetUserKycDoc, urlAdminUpdateUserKycStatus } from "./constants";

export const apiAdminGetProfile = async (params = {}) => {
  const url = urlAdminGetProfile;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAdminUpdateProfile = async (params = {}) => {
  const url = urlAdminUpdateProfile;
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiAdminUpdateUserInfo = async (params = {}) => {
  const url = `${urlAdminUpdateUserInfo}/${params['id']}`;
  const payload = { ...params }
  const response = await axiosPut(url, payload)
  return response
}

export const apiAdminGetCompanyStats = async (params) => {
  const url = urlAdminGetCompanyStats;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAdminDeleteSubscriber = async (params) => {
  const url = `${urlAdminDeleteSubscriber}/${params['id']}`;
  const get_params = { ...params }
  const response = await axiosDelete(url, get_params)
  return response
}

export const apiAdminSetUserTmpPassword = async (params = {}) => {
  const url = urlAdminSetUserTmpPassword
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiAdminUpdateUserStatus = async (params = {}) => {
  const url = urlAdminUpdateUserStatus
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiAdminUpdateWithdrawStatus = async (params = {}) => {
  const url = urlAdminUpdateWithdrawStatus
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiAdminUpdateCouponInfo = async (params = {}) => {
  const url = `${urlAdminUpdateCouponInfo}/${params['id']}`;
  const payload = { ...params }
  const response = await axiosPut(url, payload)
  return response
}

export const apiAdminAddCouponInfo = async (params = {}) => {
  const url = `${urlAdminAddCouponInfo}`;
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiAdminDeleteCouponInfo = async (params = {}) => {
  const url = `${urlAdminDeleteCouponInfo}/${params['id']}`;
  const payload = { ...params }
  const response = await axiosDelete(url, payload)
  return response
}

export const apiAdminSubmitAnnouncement = async (params, uploadFile = null) => {
  const url = urlAdminSubmitAnnouncement
  var formData = new FormData();
  formData.append("title", params.title.trim());
  formData.append("description", params.description.trim());
  if (uploadFile) {
    formData.append("upload_file", uploadFile);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}

export const apiAdminDeleteTransaction = async (params = {}) => {
  const url = `${urlAdminDeleteTransaction}`;
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiAdminGetSetting = async (params = {}) => {
  const url = urlAdminGetSetting
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAdminUpdateSetting = async (params, uploadFile = null) => {
  const url = urlAdminUpdateSetting
  var formData = new FormData();
  for (let k in params) {
    let value = params[k]
    if (k === 'admin_ticket_email') {
      value = value.trim()
    }
    formData.append(k, value);
  }

  if (uploadFile) {
    formData.append("upload_file", uploadFile);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}

export const apiAdminGetVideoList = async (params = {}) => {
  const url = urlAdminGetVideoList
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAdminUpdateVideoInfo = async (params = {}) => {
  const url = `${urlAdminUpdateVideoInfo}/${params['id']}`;
  const payload = { ...params }
  const response = await axiosPut(url, payload)
  return response
}

export const apiAdminAddVideoInfo = async (params = {}) => {
  const url = `${urlAdminAddVideoInfo}`;
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}

export const apiAdminDeleteVideoInfo = async (params = {}) => {
  const url = `${urlAdminDeleteVideoInfo}/${params['id']}`;
  const payload = { ...params }
  const response = await axiosDelete(url, payload)
  return response
}

export const apiAdminUpdateVideoPriority = async (params = {}) => {
  const url = urlAdminUpdateVideoPriority
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiAdminGetUserKycDoc = async (params = {}) => {
  const url = urlAdminGetUserKycDoc
  const payload = { ...params }
  const response = await axiosGet(url, payload)
  return response
}

export const apiAdminUpdateUserKycStatus = async (params = {}) => {
  const url = urlAdminUpdateUserKycStatus
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}
