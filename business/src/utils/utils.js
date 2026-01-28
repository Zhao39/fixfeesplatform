import toast, { Toaster } from 'react-hot-toast';
import { empty, get_data_value } from './misc';

export const showToast = (msg, type="success") => { // type: success, error, info, warning
	if(empty(msg)) {
		return false
	}

	if(type === "success") {
		toast.success(msg);
	}
	else if(type === "error") {
		toast.error(msg);
	}
	else{
		toast(msg);
	}
};


const SETTING_PERSIST_KEY = "ecomscout_setting_persist";

export const getSettingPersist = (key, default_value) => {
  let settingObj = {}
  let setting = window.localStorage.getItem(SETTING_PERSIST_KEY);
  if (setting) {
    settingObj = JSON.parse(setting)
  }
  if (key) {
    let value = get_data_value(settingObj, key, default_value)
    return value
  } else {
    return settingObj
  }
}
export const setSettingPersist = (key, value) => {
  let settingObj = getSettingPersist()
  settingObj[key] = value
  let setting = JSON.stringify(settingObj)
  window.localStorage.setItem(SETTING_PERSIST_KEY, setting);
  return value
}