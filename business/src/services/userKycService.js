import { axiosGet, axiosPost, axiosPostMultipart } from "./ajaxServices";
import { urlUserGetKycDetail, urlUserSubmitKyc } from "./constants";

export const apiUserGetKycDetail = async (params = {}) => {
  const url = urlUserGetKycDetail;
  const response = await axiosGet(url, params)
  return response
}

export const apiUserSubmitKyc = async (params) => {
  const url = urlUserSubmitKyc;
  var formData = new FormData();
  for (let key in params) {
    formData.append(key, params[key]);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}
