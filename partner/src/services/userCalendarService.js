import { axiosGet, axiosPost } from "./ajaxServices";
import { urlUserSaveCalendarEvent, urlUserGetCalendarAuthUrl, urlUserGetCalendarEvents, urlUserSaveGoogleOauthToken, urlUserGetCalendarColors } from "./constants";

export const apiUserGetCalendarAuthUrl = async (params = {}) => {
  const url = urlUserGetCalendarAuthUrl;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserSaveGoogleOauthToken = async (params = {}) => {
  const url = urlUserSaveGoogleOauthToken;
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiUserGetCalendarEvents = async (params = {}) => {
  const url = urlUserGetCalendarEvents
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiUserSaveCalendarEvent = async (params = {}) => {
  const url = urlUserSaveCalendarEvent
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiUserGetCalendarColors = async (params = {}) => {
  const url = urlUserGetCalendarColors
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}
