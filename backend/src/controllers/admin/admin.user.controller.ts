import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, encrypt_md5, get_data_value, get_utc_timestamp, intval, isset, is_null } from '../../helpers/misc';
import { userService } from '../../services/user.service';
import { RowDataPacket } from 'mysql2';
import { TB_USER } from '../../var/tables';
import AdminBaseController from './admin.base.controller';
import { loggerService } from '../../services/logger.service';
import { userKycDocService } from '../../services/user.kyc.doc.service';
import { KYC_STATUS } from '../../var/config';

export default class AdminUserController extends AdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get user list for data table
   */
  public getDataList = async (req: Request, res: Response) => { //api for datatable
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/

      let sql = "select u.id, u.add_timestamp from " + TB_USER + " as u where u.user_verified = '1'";

      //$sql.=" and u.is_paid = 1";
      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (u.name like " + keyword + " or u.email like " + keyword + " or u.ref_name like " + keyword + ")";
      }
      //sql += " group by u.id";

      let rows = await userService.query(sql) as []
      let total = rows.length;

      if (isset(get_param['sortby'])) {
        let sort_direction = get_data_value(get_param, 'direction', 'asc')
        sql += " order by " + get_param['sortby'] + " " + sort_direction
      }

      //console.log('==================sql================', sql);
      let page = intval(get_data_value(get_param, 'page', 1))
      let limit = intval(get_data_value(get_param, 'limit', 10)) // per page
      let offset = (page - 1) * limit;
      sql += " limit " + offset + "," + limit;
      let list = <RowDataPacket[]>await userService.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await userService.getOne({ id: item['id'] });
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
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * update user info
   */
  public update = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const id = req.params.id
      const condition = {
        id: id
      }
      const oldAccountInfo = await userService.getOne(condition)
      if (empty(oldAccountInfo) || empty(oldAccountInfo.id)) {
        return this.json_output_error("User does not exist", "", res)
      }

      const account_info = {
        first_name: post_param['first_name'],
        last_name: post_param['last_name'],
        // email: post_param['email'],
        // phone: post_param['phone']
      }
      if (!is_null(post_param['balance'])) {
        account_info['balance'] = post_param['balance']
      }
      if (!is_null(post_param['tier_commission'])) {
        account_info['tier_commission'] = post_param['tier_commission']
      }
      if (empty(post_param['ref_name'])) {
        post_param['ref_name'] = 'Admin'
      }

      if (post_param['ref_name'] !== 'Admin') {
        let sponsor_info = await userService.getOne({ name: post_param['ref_name'] })
        if (empty(sponsor_info)) {
          return this.json_output_error("Sponsor does not exist", account_info, res)
        } else {
          account_info['ref_name'] = post_param['name']
          account_info['ref_id'] = sponsor_info['encrypted_id']
        }
      } else {
        account_info['ref_name'] = post_param['ref_name']
        account_info['ref_id'] = ""
      }

      //console.log("account_info::::", account_info)
      const [is_duplicated, duplicated_message, check_account] = await userService.checkDuplicatedAccount({ ...account_info, id: id });
      if (is_duplicated) {
        return this.json_output_error(duplicated_message, account_info, res)
      }

      await loggerService.debug({ oldAccountInfo: oldAccountInfo, updatedAccountInfo: account_info }, "adminChangeUser_" + id);

      const rslt = await userService.update(account_info, condition)
      data['rslt'] = rslt
      return this.json_output_data(data, "User info has been updated successfully", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * set user password
   */
  public setUserTmpPassword = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const id = post_param['id']
      const condition = {
        id: id
      }
      if (empty(post_param['tmp_password'])) {
        return this.json_output_error("Invalid request", "", res)
      }
      const cur_timestamp = get_utc_timestamp()
      const account_info = {
        tmp_password: encrypt_md5(post_param['tmp_password']),
        tmp_password_timestamp: cur_timestamp
      }
      //console.log("account_info::::", account_info)
      const rslt = await userService.update(account_info, condition)
      data['rslt'] = rslt
      return this.json_output_data(data, "Success!, \n Temporary password will expire in 1 hour.", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * update user status
   */
  public updateStatus = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const id = post_param['id']
      const condition = {
        id: id
      }
      if (is_null(post_param['status'])) {
        return this.json_output_error("Invalid request", "", res)
      }
      const account_info = {
        status: post_param['status']
      }
      const rslt = await userService.update(account_info, condition)
      data['rslt'] = rslt

      let msg = "User has been blocked successfully"
      if (account_info['status'] === '1') {
        msg = "User has been activated successfully"
      } else {
        msg = "User has been blocked successfully"
      }
      return this.json_output_data(data, msg, res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * get kyc document for a user
   */
  public getUserKycDoc = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const user_id = get_param['user_id']
      const userKycDoc = await userKycDocService.getUserKycDoc(user_id)
      data['userKycDoc'] = userKycDoc
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * update kyc document for a user
   */
  public updateUserKycStatus = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const user_id = post_param['user_id']
      const kyc_status = post_param['kyc_status']
      const userUpdated = await userKycDocService.updateKycStatus(user_id, kyc_status)
      data['user'] = userUpdated

      let msg = ""
      if (kyc_status === KYC_STATUS.VERIVIED) {
        msg = "KYC has been verified successfully"
      } else {
        msg = "KYC has been rejected successfully"
      }
      return this.json_output_data(data, msg, res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }
}

export const adminUserController = new AdminUserController()
