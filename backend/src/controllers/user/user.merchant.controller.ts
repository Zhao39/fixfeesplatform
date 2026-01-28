import { Request, Response } from 'express'
import UserBaseController from './user.base.controller';
import * as mysql from 'mysql2';
import { RowDataPacket } from 'mysql2';
import { empty, get_api_sample_response, get_data_value, intval, isset } from '../../helpers/misc';
import { DEFAULT_PROCESSOR_ID } from '../../var/config';
import { irisLib } from '../../library/irisLib';
import { userService } from '../../services/user.service';
import { businessService } from '../../services/business.service';
import { TB_BUSINESS, TB_USER } from '../../var/tables';



export default class UserMerchantController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
  * get Merchant Residual Report
  */
  public getMerchantResidualReport = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/

      let tmp_data = await get_api_sample_response('getMerchantResidualReport.json')
      if (tmp_data) {
        return res.json(tmp_data)
      }

      const mid = get_data_value(get_param, 'mid')
      if (empty(mid)) {
        return this.json_output_error("Invalid request", "", res)
      }
      const processor_id = get_data_value(get_param, 'processor_id', DEFAULT_PROCESSOR_ID)
      const option = {
        processor_id: processor_id,
        mid: mid,
        date_range: get_data_value(get_param, 'date_range', 'last_3_month')
      }
      const residualReportData = await businessService.getMerchantResidualReportData(option)
      data['residual_report_data'] = residualReportData
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log(`UserCalendarController getEvents error::`, e)
      return this.json_output_error("", "", res)
    }
  }

  public getMerchantDataAllList = async (req: Request, res: Response) => { //api for datatable
    console.log("merchanttype");
    // if (empty(await this.init(req, res))) {
    //   return false
    // }

    console.log('asdfasdf');
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id']
      let merchantType = get_param['merchantType'];
      let sql = ""
      // sql = `select a.id from ${TB_BUSINESS} as a where a.ref_id = ${encrypted_id}`;
      // sql = `select * from ${TB_BUSINESS} as a where a.status = ${merchantType} and a.ref_id = '${encrypted_id}'`;
      // sql = `select * from ${TB_BUSINESS} as a where a.ref_id = '${encrypted_id}'`;
      sql = `select * from ${TB_BUSINESS} as a where a.ref_id != '${encrypted_id}'`;

      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.business_legal_name like " + keyword + " or a.business_contact_first_name like " + keyword + " or a.business_contact_last_name like " + keyword + " or a.business_email like " + keyword + " or a.business_phone like " + keyword + ")";
      }
      if (merchantType) {
        sql += ` and a.status = ${merchantType}`;  // Append merchantType condition
        // sql += ` AND a.status = '${merchantType}'`;  // Append merchantType condition
      }

      console.log(sql);

      let rows = await businessService.query(sql) as [];
      return res.json({ data: rows });
    } catch (e) {
      return res.json([])
    }
  }


  public getMerchantDataList = async (req: Request, res: Response) => { //api for datatable
    console.log("merchanttype");
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id']
      let merchantType = get_param['merchantType'];
      let sql = ""
      // sql = `select a.id from ${TB_BUSINESS} as a where a.ref_id = ${encrypted_id}`;
      // sql = `select * from ${TB_BUSINESS} as a where a.status = ${merchantType} and a.ref_id = '${encrypted_id}'`;
      // sql = `select * from ${TB_BUSINESS} as a where a.ref_id = '${encrypted_id}'`;
      sql = `select * from ${TB_BUSINESS} as a where a.ref_id != '${encrypted_id}'`;

      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.business_legal_name like " + keyword + " or a.business_contact_first_name like " + keyword + " or a.business_contact_last_name like " + keyword + " or a.business_email like " + keyword + " or a.business_phone like " + keyword + ")";
      }
      if (merchantType) {
        sql += ` and a.status = ${merchantType}`;  // Append merchantType condition
        // sql += ` AND a.status = '${merchantType}'`;  // Append merchantType condition
      }

      console.log(sql);

      let rows = await businessService.query(sql) as []
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
      console.log("yyyyyyyyyyyyyyyyyyyyyyy", list)
      return res.json(data)
    } catch (e) {
      return res.json([])
    }
  }

}

export const userMerchantController = new UserMerchantController()
