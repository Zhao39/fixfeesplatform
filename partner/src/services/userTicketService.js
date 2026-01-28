import { axiosGet, axiosPost, axiosPostMultipart } from "./ajaxServices";
import { urlUserGetTicketDetail, urlUserSubmitTicket, urlUserSubmitTicketMessage, urlUserCloseTicket } from "./constants";

export const apiUserSubmitTicket = async (params, uploadFile = null) => {
  const url = urlUserSubmitTicket;
  var formData = new FormData();
  formData.append("title", params.title.trim());
  formData.append("description", params.description.trim());
  if (uploadFile) {
    formData.append("upload_file", uploadFile);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}

export const apiUserGetTicketDetail = async (params = {}) => {
  const url = urlUserGetTicketDetail;
  var payload = { ...params };
  const response = await axiosGet(url, payload)
  return response
}

export const apiUserSubmitTicketMessage = async (params, uploadFile = null) => {
  const url = urlUserSubmitTicketMessage;
  var formData = new FormData();
  formData.append("ticket_id", params.ticket_id)
  formData.append("description", params.description.trim());
  if (uploadFile) {
    formData.append("upload_file", uploadFile);
  }
  const response = await axiosPostMultipart(url, formData)
  return response
}

export const apiUserCloseTicket = async (params = {}) => {
  const url = urlUserCloseTicket;
  const payload = { ...params }
  const response = await axiosPost(url, payload)
  return response
}