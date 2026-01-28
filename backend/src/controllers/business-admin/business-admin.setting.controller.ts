import { settingService } from '../../services/setting.service';
import { Request, Response } from 'express'
import { empty } from '../../helpers/misc';
import BusinessAdminBaseController from './business-admin.base.controller';
import { tokenService } from '../../services/token.service';

export default class BusinessAdminSettingController extends BusinessAdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get setting page detail
   */
  public getPageDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let app_settings = await settingService.get_app_settings(this.environment);
    data['app_settings'] = app_settings

    return this.json_output_data(data, "", res);
  };

  /**
   * update setting detail
   */
  public updateSetting = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let update_data = {}
    for (let k in post_param) {
      let val = post_param[k]
      update_data[k] = val
    }
    await settingService.update_app_settings(update_data, this.environment)
    if (post_param['maintenance_mode'] == "true") {
      await tokenService.clearUserTokens(this.environment)
    }
    data['update_data'] = update_data
    return this.json_output_data(data, "Setting has been updated successfully", res);
  };
}

export const businessAdminSettingController = new BusinessAdminSettingController()
