import { SYSTEM_ERROR } from "configs/CONSTANTS";
import { empty } from "utils/misc";
import { axiosGet, axiosPost, axiosPostMultipart } from "./ajaxServices";
import { urlSubmitTicketMessage, urlGetTicketList, urlLogin, urlGetTicketInfoPageDetail } from "./constants";

export function apiGetTicketList(get_params) {
  const url = urlGetTicketList;
  return new Promise((resolve, reject) => {
    axiosGet(url, get_params, "")
      .then(function (response) {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export const apiSubmitTicketMessage = (params) => {
  const url = urlSubmitTicketMessage;
  const config = {
    headers: {
      "content-type": "multipart/form-data",
    },
  };
  var formData = new FormData();
  formData.append("ticket_id", params.ticket_id);
  formData.append("description", params.description.trim());
  formData.append("to_email", params.to_email ? "1" : "0");

  let uploadFile = null
  if(params['upload_file'] && !empty(params['upload_file'])) {
    uploadFile = params['upload_file'][0]['originFileObj']
  }
  formData.append("upload_file", uploadFile);
  return new Promise((resolve, reject) => {
    axiosPostMultipart(url, formData, config)
      .then(function (response) {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const apiGetTickeDetailPageDetail = (ticketid) => {
  const url = urlGetTicketInfoPageDetail;
  return new Promise((resolve, reject) => {
    axiosGet(url, { ticketid: ticketid }, SYSTEM_ERROR)
      .then(function (response) {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};