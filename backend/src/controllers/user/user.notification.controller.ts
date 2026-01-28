import { Request, Response } from 'express'
import { empty, get_data_value } from '../../helpers/misc';
import UserBaseController from './user.base.controller';
import { userNotificationService } from '../../services/user.notification.service';
 
export default class UserNotificationController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * read a notification
   */  
  public read = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const id = get_data_value(post_param, 'id')
      const user_id = user['id']
      await userNotificationService.readUserNotification(user_id, id) 
      return this.json_output_data(data, "", res);
    } catch (e) {
      return this.json_output_error("", "", res)
    }
  }

}

export const userNotificationController = new UserNotificationController()
