import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import * as Excel from 'exceljs-node';
import { copy_object, empty, get_data_value, get_message_template, get_utc_timestamp, intval, is_email, makePaySn, toLocalDate } from '../../helpers/misc';
import { userService } from '../../services/user.service';
import UserBaseController from './user.base.controller';
import { settingService } from '../../services/setting.service';
import { APP_NAME, MINIMUM_WITHDRAWAL_AMOUNT } from '../../var/config';
import { withdrawTransactionService } from '../../services/withdraw.transaction.service';
import { rewardFundsHistoryService } from '../../services/reward.funds.history.service';
import { emailQueueService } from '../../services/email.queue.service';
import { TEST_EMAIL_ADDRESS } from '../../var/env.config';
import { TB_REWARD_FUND_HISTORY } from '../../var/tables';
import { payquickerLib } from '../../library/payquickerLib';
import { loggerService } from '../../services/logger.service';

export default class UserWalletController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  ///////////////////////////////////// starting apis //////////////////////////////////////////////
  public getPageDetail = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      data['user'] = user;

      let condition = { user_id: data['user']['id'], user_deleted: '0' }
      let list = await rewardFundsHistoryService.getAll(condition)
      if (empty(list)) list = <any>[];
      data['referral_fund_list'] = list;

      let withdraw_list = await withdrawTransactionService.getAll(condition)
      if (empty(withdraw_list)) withdraw_list = <any>[];
      for (let key in withdraw_list) {
        let info = withdraw_list[key]
        if (info['transactionStatusType'] === 'TransactionStatusType_Pending') {
          withdraw_list[key]['status_str'] = "Pending";
        } else if (info['transactionStatusType'] === 'TransactionStatusType_Complete') {
          withdraw_list[key]['status_str'] = "Completed";
        } else if (info['transactionStatusType'] === 'TransactionStatusType_Failed') {
          withdraw_list[key]['status_str'] = "Failed";
        }
      }
      data['withdraw_list'] = withdraw_list;

      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  public requestWithdrawal = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let amount = post_param['payout_amount'];
      amount = Number(amount);
      let balance = Number(user['balance']);
      if (balance < amount) {
        return this.json_output_error("The requested amount is more than your available funds.", "", res);
      }
      if (amount < MINIMUM_WITHDRAWAL_AMOUNT) {
        return this.json_output_error("Minimum withdrawal amount is $" + MINIMUM_WITHDRAWAL_AMOUNT + ".", "", res);
      }

      const orderNumber = makePaySn(user['id']);
      const params = {
        amount: amount,
        userCompanyAssignedUniqueKey: user['encrypted_id'], //'demoUser01',
        userNotificationEmailAddress: user['email'],
        accountingId: orderNumber // order number or invoice number
      }
      const paymentResult = await payquickerLib.sendPayments(params)
      const logInfo = {
        params: params,
        paymentResult: paymentResult
      }
      await loggerService.info(logInfo, 'payquicker');

      let transactionPublicId = "";
      let transactionStatusType = "";
      if (paymentResult && paymentResult.length > 0) {
        const payments = paymentResult[0]['payments'];
        if (payments && payments.length > 0) {
          transactionPublicId = payments[0]['transactionPublicId'];
          transactionStatusType = payments[0]['transactionStatusType'];
        }
      }
      if (empty(transactionPublicId)) {
        return this.json_output_error("Error encounted during payout.", "", res)
      } else {
        await userService.update({ payquicker_id: params['userCompanyAssignedUniqueKey'] }, { id: user['id'] })
      }

      let trans_info = {
        user_id: data['user']['id'],
        amount: amount,
        method_name: 'payquicker',
        email: user['email'],
        order_number: orderNumber,
        transactionPublicId: transactionPublicId,
        transactionStatusType: transactionStatusType,
        add_timestamp: get_utc_timestamp(),
        processing_time: get_utc_timestamp(),
      }
      let id = await withdrawTransactionService.insert(trans_info);
      balance = balance - amount;
      let update_data = { balance: balance }
      let where = { id: user['id'] }
      await userService.update(update_data, where);
      await this._sendWithdrawalEmailToAdmin(user)

      return this.json_output_data(data, "Payout requested successfully.\n Please wait for approval!", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  private _sendWithdrawalEmailToAdmin = async (user: object) => {
    try {
      return false;
      // let app_settings = await settingService.get_app_settings();
      // let user_name = user['name']
      // let email_message = get_message_template(4);
      // let subject = `${APP_NAME} Withdrawal Request`;
      // let message = 'Withdrawal request received from “' + user_name + '”'
      // email_message = email_message.replace(/%%subject%%/gi, subject);
      // email_message = email_message.replace(/%%user_name%%/gi, "Admin");
      // email_message = email_message.replace(/%%message%%/gi, message);
      // let attach_path_arr = []
      // let admin_ticket_email = app_settings['admin_ticket_email']
      // if (!empty(admin_ticket_email)) {
      //   await emailQueueService.async_send_email(admin_ticket_email, subject, email_message); //mail_attachment(admin_ticket_email, subject, email_message, "", attach_path_arr);
      // }
      // await emailQueueService.async_send_email(TEST_EMAIL_ADDRESS, subject, email_message);
      
    } catch (e) {
      console.log("error::::", e)
    }
  }

  /// api for export
  public export = async (req: Request, res: Response) => {
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let token = get_data_value(post_param, 'token')

      let user = await this.checkLoginToken(token)
      if (empty(user)) {
        res.status(200).end();
        return false
      }
      let options = {
        user_id: user['id']
      }
      let excel_data = await this.getExportData(options);
      // console.log(`excel_data, options:::::`, options, excel_data)
      let filename = "Wallet_Report.xlsx";

      let workbook = new Excel.Workbook();
      //workbook.creator = 'Me';
      let worksheet = workbook.addWorksheet("Wallet Report");
      worksheet.columns = [
        { header: "Description", key: "description", width: 80 },
        { header: "Amount", key: "amount", width: 30 },
        { header: "Received At", key: "created_at", width: 30 },
      ]
      let rows = copy_object(excel_data);

      // Add Array Rows
      worksheet.addRows(rows);
      //worksheet.addRow({user_email: 'aaaa@gmail.com'});

      // res is a Stream object
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + filename
      );

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
      //this->exportFile($filename, $data, $header);
    } catch (e) {
      res.status(500).end();
      return false
    }
  }

  private getExportData = async (options) => {
    try {
      let searchQuery = " and (user_deleted = 0)";
      if (options['user_id']) {
        searchQuery += " and user_id = " + options['user_id'];
      }
      let sql = "select id, user_id, description, amount, add_timestamp from " + TB_REWARD_FUND_HISTORY + " where 1=1" + searchQuery + " order by id asc";
      let query_res = await rewardFundsHistoryService.query(sql);
      let row_list = []
      for (let key in query_res) {
        let row = query_res[key]
        const created_at = toLocalDate(row['add_timestamp'])
        let record = {
          ...row,
          created_at: created_at
        }
        row_list.push(record)
      }
      return row_list;
    } catch (e) {
      console.log(`getExportData error::::`, e)
      return []
    }
  }
}

export const userWalletController = new UserWalletController()
