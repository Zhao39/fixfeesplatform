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
import { transactionService } from '../../services/transaction.service';

export default class AdminTransactionController extends AdminBaseController {
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
  public getDataList = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let dataList = [];

      let user_id = parseInt(get_param['user_id']);
      if (Number.isNaN(user_id)) {
        dataList = [];
      } else {

        let user = await userService.getOne({ id: user_id })
        if (user === false) {
          dataList = [];
        } else {
          const trans_list = await transactionService.getUserAllPaymentList(get_param, user)

          if (trans_list === false) {
            dataList = [];
          } else {
            dataList = trans_list;
          }
        }

        data['page'] = get_param['page'];
        data['limit'] = get_param['limit'];
        data['total'] = dataList.length;
        dataList = dataList.map((e) => {
          return {
            ...e, user_name: user?.name
          }
        })
        data['data'] = dataList;
      }

      return res.json(data)

    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }
  public deleteTransaction = async (req: Request, res: Response) => {

    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const id = Number(post_param["id"])
      const condition = {
        id: id
      }
      const row = await transactionService.getOne(condition)
      if (empty(row?.id)) {
        return this.json_output_error("Transaction doest not exists!", {}, res)
      }

      const rslt = await transactionService.delete(condition)
      data['rslt'] = rslt

      let msg = "Transaction has been deleted successfully!"
      return this.json_output_data(data, msg, res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }
}

export const adminTransactionController = new AdminTransactionController()
