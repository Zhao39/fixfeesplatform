import axios from "axios";
import { BASE_APP_URL } from "config/constants";
const URL_LOGIN = BASE_APP_URL + "/login"

const redirectToLoginPage = async (currentHref) => {
  console.log("gggg:", currentHref)
  // if (currentHref !== URL_LOGIN) {
  //   window.location.href = URL_LOGIN
  // } else {
  //   console.log("current pge is login page")
  // }
  // return false
}

export const axiosPost = async (url, param, cancelToken = null, errorMessage = "") => {
  try {
    let options = null
    if (cancelToken) {
      options = {
        cancelToken: cancelToken
      }
    }
    const { data } = await axios.post(url, param, options)
    if (data.data && data.data.login_required === "1") {
      return await redirectToLoginPage(window.location.href)
    } else {
      return data
    }
  } catch (error) {
    console.error(errorMessage, error);
    return false
  }
}

export const axiosPostMultipart = async (url, param, cancelToken = null, errorMessage = "") => {
  try {
    let options = {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }
    if (cancelToken) {
      options = {
        ...options,
        cancelToken: cancelToken
      }
    }
    const { data } = await axios.post(url, param, options)
    if (data.data && data.data.login_required === "1") {
      return await redirectToLoginPage(window.location.href)
    } else {
      return data
    }
  } catch (error) {
    console.error(errorMessage, error);
    return false
  }
}

export const axiosPut = async (url, param, cancelToken = null, errorMessage = "") => {
  try {
    let options = null
    if (cancelToken) {
      options = {
        cancelToken: cancelToken
      }
    }
    const { data } = await axios.put(url, param, options)
    if (data.data && data.data.login_required === "1") {
      return await redirectToLoginPage(window.location.href)
    } else {
      return data
    }
  } catch (error) {
    console.error(errorMessage, error);
    return false
  }
}

export const axiosGet = async (url, param, cancelToken = null, errorMessage = "") => {
  try {
    let options = { params: param }
    if (cancelToken) {
      options = {
        ...options,
        cancelToken: cancelToken
      }
    }
    const { data } = await axios.get(url, options)
    if (data.data && data.data.login_required === "1") {
      return await redirectToLoginPage(window.location.href)
    } else {
      return data
    }
  } catch (error) {
    console.error(errorMessage, error);
    return false
  }
}

export const axiosDelete = async (url, param, cancelToken = null, errorMessage = "") => {
  try {
    let options = { data: param }
    if (cancelToken) {
      options = {
        ...options,
        cancelToken: cancelToken
      }
    }
    const { data } = await axios.delete(url, options)
    if (data.data && data.data.login_required === "1") {
      return await redirectToLoginPage(window.location.href)
    } else {
      return data
    }
  } catch (error) {
    console.error(errorMessage, error);
    return false
  }
}
