import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, get_utc_timestamp, intval, isset } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';
import AdminBaseController from './admin.base.controller';
import { funnelTypeService } from '../../services/funnel.types.service';

export default class AdminFunnelTypesController extends AdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  ///////////////////////////////////// starting apis //////////////////////////////////////////////
  public getList = async (req: Request, res: Response) => { //api for datatable
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const funnelTypeList = await funnelTypeService.getAll()
    data['funnelTypeList'] = funnelTypeList
    return this.json_output_data(data, "", res);
  }

  public getInfo = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let id = get_data_value(get_param, 'id')
    let condition = { id: id }
    let info = await funnelTypeService.getOne(condition);
    data['info'] = info;
    return this.json_output_data(data, "", res);
  }
  public updateInfo = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let id = intval(get_data_value(post_param, 'id'))
    let update_data = {}
    update_data['description'] = post_param['description'];

    if (id > 0) {
      let condition = { id: id }
      await funnelTypeService.update(update_data, condition)
      return this.json_output_data(data, "Funnel has been updated successfully", res);
    }
  }
}

export const adminFunnelTypesController = new AdminFunnelTypesController()
