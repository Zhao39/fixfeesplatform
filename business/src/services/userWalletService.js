import { axiosGet, axiosPost } from "./ajaxServices";
import { urlUserGetWalletPageData, urlUserRequestWithdrawal } from "./constants";

export const apiUserGetWalletPageData = async (params) => {
  const url = urlUserGetWalletPageData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserRequestWithdrawal = async (params) => {
  const url = urlUserRequestWithdrawal;
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}
