import { curl_post } from "utils/misc";
import { axiosGet, axiosPost } from "./ajaxServices";
import { urlDownloadInvoice, urlUserExportWalletPageData, urlUserGetWalletPageData, urlUserRequestWithdrawal } from "./constants";

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

export const apiDownloadInvoice = async (params = {}) => {
  const url = `${urlDownloadInvoice}`;
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}
