import { axiosGet, axiosPost } from "./ajaxServices";
import { urlApplyMembershipCoupon, urlCheckCoupon, urlCheckCouponSecurity, urlCheckEmailVerified, urlCheckSponsor, urlCompleteRegister, urlConfirmEmailVerification, urlGetRegistraterPageData, urlLogin, urlLoginTwoFactAuth, urlLogout, urlResendConfirmEmail, urlResetPassword, urlSaveRegisterBillingInfo, urlSaveRegistraterBillPlan, urlSaveRegistraterDetail, urlSaveRegistraterEmail, urlSendConfirmEmail, urlSendForgotPasswordEmail } from "./constants";

export const apiCheckSponsor = async (params) => {
  const url = urlCheckSponsor;
  var formData = new FormData();
  formData.append("ref", params.ref)
  formData.append("default_sponsor", params.default_sponsor)
  const response = await axiosPost(url, formData)
  return response
}

export const apiSaveRegistraterDetail = async (userData) => { // register user detail and send confirm email
  const url = urlSaveRegistraterDetail;
  var formData = new FormData();
  formData.append("name", userData.name);
  formData.append("first_name", userData.first_name);
  formData.append("last_name", userData.last_name);
  formData.append("email", userData.email);
  formData.append("phone", userData.phone);
  formData.append("password", userData.password);
  if (userData.coupon) {
    formData.append("coupon", '1');
  }
  if (userData.ref_name) {
    formData.append("ref_name", userData.ref_name);
  }
  if (userData.register_step) {
    formData.append("register_step", userData.register_step);
  }
  if (userData.id) {
    formData.append("id", userData.id);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiCheckEmailVerified = async (userData) => {
  const url = urlCheckEmailVerified;
  var formData = new FormData();
  formData.append("email", userData.email);
  const response = await axiosPost(url, formData)
  return response
}

export const apiResendConfirmEmail = async (userData) => {
  const url = urlResendConfirmEmail;
  var formData = new FormData();
  formData.append("email", userData.email);
  const response = await axiosPost(url, formData)
  return response
}

export const apiConfirmEmailVerification = async (code) => {
  const url = urlConfirmEmailVerification;
  var formData = new FormData();
  formData.append("code", code);
  const response = await axiosPost(url, formData)
  return response
}

export const apiSaveRegisterBillingInfo = async (userData) => {
  const url = urlSaveRegisterBillingInfo;
  var formData = new FormData();
  for (let k in userData) {
    formData.append(k, userData[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiCompleteRegister = async (userData) => {
  const url = urlCompleteRegister;
  var formData = new FormData();
  for (let k in userData) {
    formData.append(k, userData[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const apiLogin = async (userData) => {
  const url = urlLogin;
  var formData = new FormData();
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  const response = await axiosPost(url, formData)
  return response
}

export const apiLoginTwoFactAuth = async (userData) => {
  const url = urlLoginTwoFactAuth;
  var formData = new FormData();
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  formData.append("code", userData.code);
  const response = await axiosPost(url, formData)
  return response
}

export const apiLogout = async (token) => {
  const url = urlLogout;
  const get_params = { token: token }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiSendForgotPasswordEmail = async (userData) => { // send the forgot password email
  const url = urlSendForgotPasswordEmail;
  var formData = new FormData();
  formData.append("email", userData.email);
  const response = await axiosPost(url, formData)
  return response
}

export const apiResetPassword = async (userData) => {
  const url = urlResetPassword;
  var formData = new FormData();
  formData.append("code", userData.code);
  formData.append("password", userData.password);
  const response = await axiosPost(url, formData)
  return response
}

export const apiSendConfirmEmail = async (userData) => { // send confirm email for registration
  const url = urlSendConfirmEmail;
  var formData = new FormData();
  formData.append("account_type", userData.account_type);
  formData.append("name", userData.name);
  formData.append("first_name", userData.first_name);
  formData.append("last_name", userData.last_name);
  formData.append("email", userData.email);
  formData.append("phone", userData.phone);
  formData.append("password", userData.password);
  formData.append("hear_from", userData.hear_from);
  if (userData.coupon) {
    formData.append("coupon", userData.coupon);
  }
  if (userData.sponsorName) {
    formData.append("ref_name", userData.sponsorName);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiApplyMembershipCoupon = async (userData) => {
  const url = urlApplyMembershipCoupon;
  var formData = new FormData();
  for (let k in userData) {
    formData.append(k, userData[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiCheckCoupon = async (params) => {
  const url = urlCheckCoupon;
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  const response = await axiosPost(url, formData)
  return response
}

export const apiCheckCouponSecurity = async (params) => {
  const url = urlCheckCouponSecurity;
  const response = await axiosGet(url, params)
  return response
}

export const apiGetRegistraterPageData = async (params) => {
  const url = urlGetRegistraterPageData;
  const response = await axiosGet(url, params)
  return response
}

export const apiSaveRegistraterEmail = async (params) => {
  const url = urlSaveRegistraterEmail;
  if (params.coupon) {
    params.coupon = '1'
  }
  const response = await axiosPost(url, params)
  return response
}

export const apiSaveRegistraterBillPlan = async (params) => {
  const url = urlSaveRegistraterBillPlan;
  const response = await axiosPost(url, params)
  return response
}