import { axiosGet, axiosPost } from "./ajaxServices";
import { urlUserSendGptRequest } from "./constants";

export const apiUserSendGptRequest = async (params = {}, cancelToken = null) => {
  const url = urlUserSendGptRequest;
  var payload = { ...params };
  const response = await axiosPost(url, payload, cancelToken)
  return response
}
