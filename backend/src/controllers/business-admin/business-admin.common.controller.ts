import { Request, Response } from 'express'
import { businessAdminService } from '../../services/business.admin.service';
import { empty, encrypt_md5 } from '../../helpers/misc';
import BusinessAdminBaseController from './business-admin.base.controller';

export default class BusinessAdminCommonController extends BusinessAdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get profile info
   */
  public getProfileInfo = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    return this.json_output_data(data, "", res);
  };

  /**
   * update profile info
   */
  public updateProfileInfo = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let condition = { admin_id: user['admin_id'] }
    let admin_info = {}
    admin_info['admin_name'] = post_param['name']
    admin_info['admin_email'] = post_param['email']
    if (!empty(post_param['password'])) {
      admin_info['admin_password'] = encrypt_md5(post_param['password']);
    }
    // console.log(`admin_info::::`, admin_info)
    await businessAdminService.update(admin_info, condition);
    data['user'] = await businessAdminService.getOne(condition)
    return this.json_output_data(data, "Profile has been updated successfully", res);
  };
}

export const businessAdminCommonController = new BusinessAdminCommonController()
