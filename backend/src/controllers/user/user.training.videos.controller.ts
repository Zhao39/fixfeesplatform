import { Request, Response } from 'express'
import { empty, get_data_value } from '../../helpers/misc';
import UserBaseController from './user.base.controller';
import { trainingVideoService } from '../../services/training.videos.service';
import { TRAINING_TYPE } from '../../var/config';

export default class UserTrainingVideosController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get training video list for data table
   */
  public getList = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      // const training_type = get_data_value(get_param, 'training_type', TRAINING_TYPE.MERCHANT)
      const vide_list = await trainingVideoService.getList(get_param)
      data['vide_list'] = vide_list;
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

}

export const userTrainingVideosController = new UserTrainingVideosController()
