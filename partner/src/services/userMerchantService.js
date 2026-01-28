import { axiosGet } from "./ajaxServices";
import { urlUserGetMerchantResidualData, urlUserGetMerchantData } from "./constants";

export const apiUserGetMerchantResidualData = async (params) => {
  const url = urlUserGetMerchantResidualData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserGetMerchantData = async (params) => {
  const url = urlUserGetMerchantData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
