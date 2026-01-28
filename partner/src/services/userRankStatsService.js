import { axiosGet } from "./ajaxServices";
import { urlUserGetRankStatsData } from "./constants";

export const apiUserGetRankStatsData = async (params) => {
  const url = urlUserGetRankStatsData;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
