import { axiosGet, axiosPost } from "./ajaxServices";
import { urlUserGetVideoList } from "./constants";

export const apiUserGetVideoList = async (params = {}) => {
  const url = urlUserGetVideoList
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
