import { axiosGet } from "./ajaxServices";
import { urlUserGetDashboardData, urlUserGetDashboardPerformanceData, urlUserGetActiveMerchantsData } from "./constants";

export const apiUserGetDashboardData = async (params) => {
  const url = urlUserGetDashboardData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserGetDashboardPerformanceData = async (params) => {
  const url = urlUserGetDashboardPerformanceData
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserGetActiveMerchantsData = async (params) => {
  const url = urlUserGetActiveMerchantsData
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}