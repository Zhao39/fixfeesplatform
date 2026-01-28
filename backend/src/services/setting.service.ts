import { empty } from '../helpers/misc';
import { isObject } from "lodash";
import { TB_SETTING } from "../var/tables";
import { BaseService } from "./base.service";
import { ENVIRONMENT } from '../var/config';

export default class SettingService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_SETTING;
  }

  /**
   * get website setting data
   */
  public get_app_settings = async (environment = null) => {
    if (environment === null) {
      environment = ENVIRONMENT.PARTNER // by default
    }
    let app_settings = {};
    let i;
    const condition = { environment: environment }
    let setting_list = await this.getAll(condition);
    for (i = 0; i < setting_list.length; i++) {
      app_settings[setting_list[i]['option_name']] = setting_list[i]['option_value'];
    }
    return app_settings
  }

  /**
   * get setting field of website setting
   */
  public get_app_setting = async (field_name, environment = null) => {
    if (environment === null) {
      environment = ENVIRONMENT.PARTNER // by default
    }
    let app_settings = {};
    let conidtion = {}
    conidtion['option_name'] = field_name
    let setting = await this.getOne(conidtion);
    if (!empty(setting)) {
      return setting['option_value']
    } else {
      return null
    }
  }

  /**
   * update website setting
   */
  public update_app_settings = async (setting_data: object, environment = null) => {
    if (environment === null) {
      environment = ENVIRONMENT.PARTNER // by default
    }

    let app_settings = await this.get_app_settings();
    let update_data: any;
    if (isObject(setting_data)) {
      for (let key in setting_data) {
        if (app_settings[key] === undefined) {
          update_data = {
            option_name: key,
            option_value: setting_data[key]
          };
          await this.insert(update_data);
        } else {
          update_data = {
            option_value: setting_data[key]
          }
          let condition = { option_name: key };
          await this.update(update_data, condition);
        }
      }
    }
    return true
  }

  /**
   * check if website mode is maintenance_mode
   */
  public checkIsMaintenanceMode = async (app_settings: object) => {
    if (app_settings['maintenance_mode'] == "true") {
      let msg: string = "The website is under maintenance, please check back later."
      return { is_maintance_mode: true, msg: msg }
    }
    return { is_maintance_mode: false, msg: "" }
  }


}

export const settingService = new SettingService();
