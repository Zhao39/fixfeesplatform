import { axiosGet, axiosPost, axiosPostMultipart } from "./ajaxServices";
import { urlAdminGetTicketDetail, urlAdminSubmitTicket, urlAdminSubmitTicketMessage } from "./constants";

export const apiAdminSubmitTicket = async (params, uploadFile = null) => {
  const url = urlAdminSubmitTicket;
  var formData = new FormData();
  formData.append("receiver_id", params.receiver_id);
  formData.append("title", params.title.trim());
  formData.append("description", params.description.trim());
  if (uploadFile) {
    formData.append("upload_file", uploadFile);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}

export const apiAdminGetTicketDetail = async (params = {}) => {
  const url = urlAdminGetTicketDetail;
  var payload = { ...params };
  const response = await axiosGet(url, payload)
  return response
}

export const apiAdminSubmitTicketMessage = async (params, uploadFile = null) => {
  const url = urlAdminSubmitTicketMessage;
  var formData = new FormData();
  formData.append("ticket_id", params.ticket_id)
  formData.append("description", params.description.trim());
  if (uploadFile) {
    formData.append("upload_file", uploadFile);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}
