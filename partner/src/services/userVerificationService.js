import { axiosGet, axiosPost, axiosPostMultipart } from "./ajaxServices";
import { urlUserCancelVerification, urlUserCompleteVerification, urlUserGetVerificationDetail } from "./constants";

export const apiUserGetVerificationDetail = async (params) => {
  const url = urlUserGetVerificationDetail;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserCompleteVerification = async (params) => {
  const url = urlUserCompleteVerification;
  var formData = new FormData();
  for (let key in params) {
    formData.append(key, params[key]);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}


export const apiUserCancelVerification = async (params) => {
  const url = urlUserCancelVerification;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}