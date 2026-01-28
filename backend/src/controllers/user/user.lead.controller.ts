import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_api_sample_response, get_data_value, get_utc_timestamp, intval, isset } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';

import UserBaseController from './user.base.controller';
import { businessService } from '../../services/business.service';
import { userService } from '../../services/user.service';
import { TB_BUSINESS, TB_USER } from '../../var/tables';
import { BRAND_PARTNER_STATUS, MERCHANT_STATUS, PROSPECT_DAILY_LIMIT } from '../../var/config';

export default class UserLeadController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get merchant lead list for data table
   */

  public getMerchantDataAllList = async (req: Request, res: Response) => { //api for datatable
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
      sql = `select * from ${TB_BUSINESS} as a where a.ref_id = '${encrypted_id}'`;

      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.business_legal_name like " + keyword + " or a.business_contact_first_name like " + keyword + " or a.business_contact_last_name like " + keyword + " or a.business_email like " + keyword + " or a.business_phone like " + keyword + ")";
      }
      if (merchantType) {
        sql += ` and a.status = ${merchantType}`;  // Append merchantType condition
      }
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

      // let tmp_data = await get_api_sample_response('getMerchantDataList.json')
      // if (tmp_data) {
      //   return res.json(tmp_data)
      // }

      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id']
      let merchantType = get_param['merchantType'];
      let sql = ""
      // sql = `select a.id from ${TB_BUSINESS} as a where a.ref_id = ${encrypted_id}`;
      // sql = `select * from ${TB_BUSINESS} as a where a.status = ${merchantType} and a.ref_id = '${encrypted_id}'`;
      // sql = `select * from ${TB_BUSINESS} as a where a.ref_id = '${encrypted_id}'`;
      sql = `select * from ${TB_BUSINESS} as a where a.ref_id = '${encrypted_id}'`;

      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.business_legal_name like " + keyword + " or a.business_contact_first_name like " + keyword + " or a.business_contact_last_name like " + keyword + " or a.business_email like " + keyword + " or a.business_phone like " + keyword + ")";
      }
      if (isset(get_param['sponsorKeyword']) && !empty(get_param['sponsorKeyword'])) {
        let keyword = "%" + get_param['sponsorKeyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and a.ref_name like " + keyword;
      }
      if (merchantType) {
        sql += ` and a.status = ${merchantType}`;  // Append merchantType condition
      }
      if (isset(get_param['curLevel']) && !empty(get_param['curLevel'])) {
        if (get_param['curLevel'] === 'level_1') {
          sql += " and (a.ref_id = '" + encrypted_id + "')";
        }
        else if (get_param['curLevel'] === 'level_2') {
          sql += " and (a.level2_ref_id = '" + encrypted_id + "')";
        }
        else if (get_param['curLevel'] === 'level_3') {
          sql += " and (a.level3_ref_id = '" + encrypted_id + "')";
        }
      }

      console.log('==================sql================', sql);
      let rows = await businessService.query(sql) as []
      let total = rows.length;

      if (isset(get_param['sortby'])) {
        let sort_direction = get_data_value(get_param, 'direction', 'asc')
        sql += " order by " + get_param['sortby'] + " " + sort_direction
      }

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

  public getPartnerDataAllList = async (req: Request, res: Response) => { //api for datatable
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
      sql = `select * from ${TB_USER} as a where a.ref_id = '${encrypted_id}'`;

      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.name like " + keyword + " or a.first_name like " + keyword + " or a.last_name like " + keyword + " or a.email like " + keyword + " or a.phone like " + keyword + ")";
      }

      if (merchantType) {
        sql += ` and a.status = '${merchantType}'`;  // Append merchantType condition
      }
      let rows = await userService.query(sql) as [];
      return res.json({ data: rows });
    } catch (e) {
      return res.json([])
    }
  }

  /**
   * get brand partner lead list for data table
   */
  public getPartnerDataList = async (req: Request, res: Response) => { //api for datatable
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      let merchantType = get_param['merchantType'];

      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id']
      let sql = ""
      sql = `select a.id from ${TB_USER} as a where a.ref_id = '${encrypted_id}'`;

      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.name like " + keyword + " or a.first_name like " + keyword + " or a.last_name like " + keyword + " or a.email like " + keyword + " or a.phone like " + keyword + ")";
      }
      if (merchantType) {
        sql += ` and a.status = '${merchantType}'`;  // Append merchantType condition
      }
      if (isset(get_param['curPartnerFilter']) && !empty(get_param['curPartnerFilter'])) {
        const curPartnerFilter = get_param['curPartnerFilter']
        if (curPartnerFilter === 'level_1') {
          sql += " and (a.ref_id = '" + encrypted_id + "')";
        }
        else if (curPartnerFilter === 'level_2') {
          sql += " and (a.level2_ref_id = '" + encrypted_id + "')";
        }
        else if (curPartnerFilter === 'tier_1' || curPartnerFilter === 'tier_2' || curPartnerFilter === 'tier_3' || curPartnerFilter === 'tier_4') {
          sql += " and (a.tier = '" + curPartnerFilter + "')";
        }
        else if (curPartnerFilter === 'silver' || curPartnerFilter === 'gold' || curPartnerFilter === 'platinum') {
          sql += " and (a.rank = '" + curPartnerFilter + "')";
        }
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
      let list = <RowDataPacket[]>await userService.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await userService.getOne({ id: item['id'] })
        list[key] = { ...row, ...item }
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

  public addMerchantProspect = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let get_param: object = req['fields'];
      let parms: object = req['query'];
      let user = this.user;
      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id'];
      let ref_id = user['ref_id'];
      let ref_name = user['ref_name'];

      let name = get_param['name'];
      let email = get_param['email'];
      let company_name = get_param['company_name'];
      let phone = get_param['phone'];

      const prospectDailyLimitReached = await businessService.checkProspectDailyLimitReached(user)
      if (prospectDailyLimitReached) {
        return this.json_output_error(`You’ve reached your daily limit of ${PROSPECT_DAILY_LIMIT} prospect additions. Please try again after your limit resets in 24 hours.`, "", res)
      }

      let sql = `select * from ${TB_BUSINESS} as a where a.ref_id = '${user['encrypted_id']}'`;
      if (email) {
        let keyword = mysql.escape(email).toLowerCase();
        sql += "and LOWER(a.business_email) = " + keyword;
      } else {
        return this.json_output_error('Email is empty', "", res)
      }

      let rows = await businessService.query(sql) as []
      let total = rows.length;

      if (total > 0) {
        return this.json_output_error('this email address already exists', "", res)
      }
      const row = {
        ref_id: user['encrypted_id'],
        ref_name: user['name'],
        name: name,
        business_legal_name: company_name,
        business_phone: phone,
        business_email: email,
        status: MERCHANT_STATUS.PROSPECTS
      }
      const result = await businessService.createBusiness(row);
      return this.json_output_data(result, 'Email added successfully', res)
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'An error occurred while adding the email', status: false });
    }
  }

  public removeMerchantProspect = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let get_param: object = req['fields'];
      let parms: object = req['query'];
      let user = this.user;

      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id'];
      let ref_id = user['ref_id'];
      let ref_name = user['ref_name'];

      let email = parms['email'];

      const deleteSql = `DELETE FROM ${TB_BUSINESS} WHERE business_email = '${email}'`;
      const result = await businessService.query(deleteSql);

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

      if (email) {
        sql += `and a.business_email = '${email}'`;  // Append merchantType condition
        // sql += ` AND a.status = '${merchantType}'`;  // Append merchantType condition
      }

      let rows = await businessService.query(sql) as []
      let total = rows.length;

      if (total === 0) {
        return this.json_output_error('This email not found', "", res)
      }
      return this.json_output_data(result, "", res)
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'An error occurred while adding the email', status: false });
    }
  }

  public addPartnerProspect = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let get_param: object = req['fields'];
      let parms: object = req['query'];
      let user = this.user;
      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id'];
      let ref_id = user['ref_id'];
      let ref_name = user['ref_name'];
      let name = get_param['name'];
      let email = get_param['email'];
      let phone = get_param['phone'];

      const prospectDailyLimitReached = await userService.checkProspectDailyLimitReached(user)
      if (prospectDailyLimitReached) {
        return this.json_output_error(`You’ve reached your daily limit of ${PROSPECT_DAILY_LIMIT} prospect additions. Please try again after your limit resets in 24 hours.`, "", res)
      }

      let sql = `select * from ${TB_USER} as a where a.ref_id = '${user['encrypted_id']}'`;
      if (email) {
        let keyword = mysql.escape(email).toLowerCase();
        sql += "and LOWER(a.email) = " + keyword;
      } else {
        return this.json_output_error('Email is empty', "", res)
      }

      let rows = await userService.query(sql) as []
      let total = rows.length;

      if (total > 0) {
        return this.json_output_error('this email address already exists', "", res)
      }

      const row = {
        ref_id: user['encrypted_id'],
        ref_name: user['name'],
        member_type: 'Free Member',
        name: name,
        email: email,
        phone: phone,
        status: BRAND_PARTNER_STATUS.PROSPECTS,
        add_timestamp: get_utc_timestamp(),
        update_timestamp: get_utc_timestamp()
      }
      const result = await userService.addUser(row);
      return this.json_output_data(result, "Prospect added successfully", res)
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'An error occurred while adding the prospect', status: false });
    }
  }

  public removePartnerProspect = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let get_param: object = req['fields'];
      let parms: object = req['query'];
      let user = this.user;

      /**************************************************************************************************/
      let encrypted_id = user['encrypted_id'];
      let ref_id = user['ref_id'];
      let ref_name = user['ref_name'];

      let email = parms['email'];

      const deleteSql = `DELETE FROM ${TB_USER} WHERE email = '${email}'`;
      const result = await userService.query(deleteSql);

      let sql = ""
      // sql = `select a.id from ${TB_BUSINESS} as a where a.ref_id = ${encrypted_id}`;
      // sql = `select * from ${TB_BUSINESS} as a where a.status = ${merchantType} and a.ref_id = '${encrypted_id}'`;
      // sql = `select * from ${TB_BUSINESS} as a where a.ref_id = '${encrypted_id}'`;
      sql = `select * from ${TB_USER} as a where a.ref_id != '${encrypted_id}'`;

      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (a.name like " + keyword + " or a.first_name like " + keyword + " or a.last_name like " + keyword + " or a.email like " + keyword + " or a.phone like " + keyword + ")";
      }

      if (email) {
        sql += `and a.email = '${email}'`;  // Append merchantType condition
        // sql += ` AND a.status = '${merchantType}'`;  // Append merchantType condition
      }

      let rows = await userService.query(sql) as []
      let total = rows.length;

      if (total === 0) {
        return this.json_output_error('This email not found', "", res)
      }

      return this.json_output_data(result, "", res)
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'An error occurred while removing the prospect', status: false });
    }
  }
}






export const userLeadController = new UserLeadController()
