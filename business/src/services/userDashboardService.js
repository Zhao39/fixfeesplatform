import { axiosGet, axiosPostMultipart } from "./ajaxServices";
import { urlUserGetDashboardData, urlUserUploadBusinessDoc } from "./constants";

export const apiUserGetDashboardData = async (params) => {
  const url = urlUserGetDashboardData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserUploadBusinessDoc = async (business_info, files = null) => { // register for business
  const url = urlUserUploadBusinessDoc;
  var formData = new FormData();
  formData.append('business_info', JSON.stringify(business_info));
  if (files) {
    for (let key in files) {
      formData.append(key, files[key]);
    }
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}
