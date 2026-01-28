import { Request, Response } from 'express'
import { adminService } from '../../services/admin.service';
import { empty, encrypt_md5 } from '../../helpers/misc';
import AdminBaseController from './admin.base.controller';

export default class AdminCommonController extends AdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get admin profile info
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
  }

  /**
   * update admin profile info
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
    await adminService.update(admin_info, condition);
    data['user'] = await adminService.getOne(condition)
    return this.json_output_data(data, "Profile has been updated successfully", res);
  };
}

export const adminCommonController = new AdminCommonController()
