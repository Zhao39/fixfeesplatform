import { Request, Response } from 'express'
import { checkPasswordStrenth, empty, encrypt_md5, get_data_value, is_email, trim_phone } from '../../helpers/misc';
import BusinessBaseController from './business.base.controller';
import { loggerService } from '../../services/logger.service';
import { settingService } from '../../services/setting.service';
import { businessService } from '../../services/business.service';

export default class BusinessProfileController extends BusinessBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get profile detail
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
    let ref_id = user['ref_id']
    if (!empty(ref_id)) {
      let ref_info = await businessService.getDetail({ encrypted_id: ref_id })
      if (ref_info && !empty(ref_info)) {
        user['ref_info'] = ref_info
      }
    }

    let app_settings = await settingService.get_app_settings();
    data['app_settings'] = app_settings

    data['user'] = user;
    return this.json_output_data(data, "", res);
  }

  /**
   * update profile detail
   */
  public updateDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let account_info = {
      id: user['id']
    }
    let phone = trim_phone(get_data_value(post_param, 'phone')).trim();
    account_info['first_name'] = <string>post_param['first_name'].trim();
    account_info['last_name'] = <string>post_param['last_name'].trim();
    account_info['name'] = <string>post_param['name'].trim();
    account_info['email'] = <string>post_param['email'].trim();
    account_info['phone'] = phone;

    if (empty(account_info['email'])) {
      return this.json_output_error("Email is empty", "", res)
    }
    if (!is_email(account_info['email'])) {
      return this.json_output_error("Invalid email format", "", res)
    }

    const [is_duplicated, message, check_account] = await businessService.checkDuplicatedAccount(account_info);
    if (is_duplicated) {
      return this.json_output_error(message, "", res)
    }

    await loggerService.info('User updated profile: old_info: ' + (data['user']['email']));
    let condition = { id: user['id'] }
    await businessService.updateDetail(account_info, condition);

    let condition1 = { id: user['id'] }
    let user_info = await businessService.getDetail(condition1)
    data['user'] = user_info
    return this.json_output_data(data, "", res);
  }

  /**
   * update password
   */
  public updatePassword = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    if (empty(post_param['old'])) {
      return this.json_output_error("Old password is empty", "", res)
    }
    if (empty(post_param['password'])) {
      return this.json_output_error("New password is empty", "", res)
    }

    if (user['password'] !== encrypt_md5(post_param['old'])) {
      return this.json_output_error("Incorrect Old password", "", res)
    }

    let [passwordStrenth, error_message] = checkPasswordStrenth(post_param['password'])
    if (!passwordStrenth) {
      return this.json_output_error(error_message, "", res)
    }
    let condition = { id: user['id'] }
    let update_data = {
      password: encrypt_md5(post_param['password'])
    }
    await businessService.update(update_data, condition);

    let user_info = await businessService.getOne(condition)
    data['user'] = user_info
    return this.json_output_data(data, "", res);
  }

  /**
   * get profile detail
   */
  public getDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const condition = { id: user['id'] }
    let user_info = await businessService.getDetail(condition)
    data['user'] = user_info;
    let bannerMessage = ""
    data['bannerMessage'] = bannerMessage;
    return this.json_output_data(data, "", res);
  }

}

export const businessProfileController = new BusinessProfileController()
