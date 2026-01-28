import { axiosGet } from "./ajaxServices";
import { urlUserGetMerchantResidualProfitDetail, urlUserGetProcessorResidualsData, urlUserGetResidualsPageData } from "./constants";

export const apiUserGetResidualsPageData = async (params) => {
  const url = urlUserGetResidualsPageData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserGetProcessorResidualsData = async (params) => {
  const url = urlUserGetProcessorResidualsData
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserGetMerchantResidualProfitDetail = async (params) => {
  const url = urlUserGetMerchantResidualProfitDetail;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
