import { axiosGet, axiosPost } from "./ajaxServices";
import { urlGetUserDetail, urlGetUserMembershipDetail, urlUserBillMembership, urlUserCancelMembership, urlUserCheckBillMembershipRequired, urlUserGetProfile, urlUserRecoverMembership, urlUserRemoveCardDetail, urlUserUpdateCardDetail, urlUserUpdateMembership, urlUserUpdatePassword, urlUserUpdateProfile } from "./constants";

export const apiUserGetProfile = async (params) => {
  const url = urlUserGetProfile;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserUpdateProfile = async (params) => {
  const url = urlUserUpdateProfile;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiUserCheckBillMembershipRequired = async (params) => {
  const url = urlUserCheckBillMembershipRequired;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserBillMembership = async (params) => {
  const url = urlUserBillMembership;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiUserUpdateMembership = async (params) => {
  const url = urlUserUpdateMembership;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiUserCancelMembership = async (params) => {
  const url = urlUserCancelMembership;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiUserRecoverMembership = async (params) => {
  const url = urlUserRecoverMembership;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiUserUpdatePassword = async (params) => {
  const url = urlUserUpdatePassword;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiGetUserDetail = async (params) => {
  const url = urlGetUserDetail;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiGetUserMembershipDetail = async (params) => {
  const url = urlGetUserMembershipDetail;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserUpdateCardDetail = async (params = {}) => {
  const url = urlUserUpdateCardDetail;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiUserRemoveCardDetail = async (params = {}) => {
  const url = urlUserRemoveCardDetail;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}
