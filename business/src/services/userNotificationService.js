import { axiosGet, axiosPost, axiosPut } from "./ajaxServices";
import { urlUserReadNotification } from "./constants";

export const apiUserReadNotification = async (params = {}, cancelToken = null) => {
  const url = urlUserReadNotification;
  var payload = { ...params };
  const response = await axiosPut(url, payload, cancelToken)
  return response
}
