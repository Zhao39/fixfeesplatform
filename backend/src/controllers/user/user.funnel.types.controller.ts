import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, get_utc_timestamp, intval, isset } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';
import UserBaseController from './user.base.controller';
import { funnelTypeService } from '../../services/funnel.types.service';
import { userService } from '../../services/user.service';
import { BASE_BUSINESS_URL, BASE_PARTNER_URL } from '../../var/env.config';

export default class UserFunnelTypesController extends UserBaseController {
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
    const user_id = user['id']
    let ref_id = user['ref_id']
    if (!empty(ref_id)) {
      let ref_info = await userService.getDetail({ encrypted_id: ref_id })
      if (ref_info && !empty(ref_info)) {
        data['ref_info'] = ref_info
      }
    }

    data['base_business_url'] = BASE_BUSINESS_URL
    data['base_partner_url'] = BASE_PARTNER_URL

    let business_ref_url = `${BASE_BUSINESS_URL}register?ref=${encodeURIComponent(user['name'])}`
    data['business_ref_url'] = business_ref_url
    let partner_ref_url = `${BASE_PARTNER_URL}register?ref=${encodeURIComponent(user['name'])}`
    data['partner_ref_url'] = partner_ref_url
    data['ref_name'] = `${encodeURIComponent(user['name'])}`

    const funnelTypeList = await funnelTypeService.getAll()
    data['funnelTypeList'] = funnelTypeList
    return this.json_output_data(data, "", res);
  }
}

export const userFunnelTypesController = new UserFunnelTypesController()
