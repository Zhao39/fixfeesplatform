import { axiosDelete, axiosGet, axiosPost } from "./ajaxServices";
import { urlAdminDeleteCalendarEvent, urlAdminDeleteGoogleOauthToken, urlAdminGetCalendarAuthUrl, urlAdminGetCalendarColors, urlAdminGetCalendarEvents, urlAdminGetGoogleOauthToken, urlAdminSaveCalendarEvent, urlAdminSaveGoogleOauthToken } from "./constants";

export const apiAdminGetCalendarAuthUrl = async (params = {}) => {
  const url = urlAdminGetCalendarAuthUrl;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAdminSaveGoogleOauthToken = async (params = {}) => {
  const url = urlAdminSaveGoogleOauthToken;
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiAdminGetGoogleOauthToken = async (params = {}) => {
  const url = urlAdminGetGoogleOauthToken;
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAdminDeleteGoogleOauthToken = async (params = {}) => {
  const url = urlAdminDeleteGoogleOauthToken;
  const get_params = { ...params }
  const response = await axiosDelete(url, get_params)
  return response
}

export const apiAdminGetCalendarEvents = async (params = {}) => {
  const url = urlAdminGetCalendarEvents
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}

export const apiAdminSaveCalendarEvent = async (params = {}) => {
  const url = urlAdminSaveCalendarEvent
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiAdminDeleteCalendarEvent = async (params = {}) => {
  const url = urlAdminDeleteCalendarEvent
  const get_params = { ...params }
  const response = await axiosPost(url, get_params)
  return response
}

export const apiAdminGetCalendarColors = async (params = {}) => {
  const url = urlAdminGetCalendarColors
  const get_params = { ...params }
  const response = await axiosGet(url, get_params)
  return response
}