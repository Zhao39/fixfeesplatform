import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, intval, isset } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';
import AdminBaseController from './admin.base.controller';

import { TB_BUSINESS, TB_USER } from '../../var/tables';
import { businessService } from '../../services/business.service';
import { userService } from '../../services/user.service';

export default class AdminProspectController extends AdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get lead list for data table 
   */
  public getDataList = async (req: Request, res: Response) => { //api for datatable
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      /**************************************************************************************************/
      let sql = ""
      sql = `select a.id, a.business_email as user_email, b.name as sponsor_name from ${TB_BUSINESS} as a left outer join ${TB_USER} as b on a.ref_id = b.encrypted_id  where 1=1`;
      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.business_email like " + keyword + " or b.name like " + keyword + ")";
      }

      let rows = await userService.query(sql) as []
      let total = rows.length;

      if (isset(get_param['sortby'])) {
        let sort_direction = get_data_value(get_param, 'direction', 'asc')
        sql += " order by " + get_param['sortby'] + " " + sort_direction
      }

      console.log('==================sql================', sql);
      let page = intval(get_data_value(get_param, 'page', 1))
      let limit = intval(get_data_value(get_param, 'limit', 10)) // per page
      let offset = (page - 1) * limit;
      sql += " limit " + offset + "," + limit;
      let list = <RowDataPacket[]>await businessService.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await businessService.getOne({ id: item['id'] });
        list[key] = { ...row, ...item };
      }

      data['page'] = page;
      data['limit'] = limit;
      data['total'] = total;

      let total_pages = 0
      if (total > 0) {
        total_pages = Math.ceil(total / limit)
      }
      data['total_pages'] = total;
      data['data'] = list;

      return res.json(data)
    } catch (e) {
      return res.json([])
    }
  }
}

export const adminProspectController = new AdminProspectController()
