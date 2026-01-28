import { MEMBERSHIP_PRICE } from "../var/config";
import { console_log, empty, get_data_value, get_message_template, get_utc_timestamp } from "../helpers/misc";
import { TB_TRANSACTION } from "../var/tables";
import { BaseService } from "./base.service";
import { userService } from "./user.service";
import { FRONT_LOGIN_URL } from "../var/env.config";
import { emailQueueService } from "./email.queue.service";
import { RowDataPacket } from 'mysql2';
import { referralFundsHistoryService } from "./referral.funds.history.service";

export default class TransactionService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_TRANSACTION;
  }

  /**
   * add a transaction record
   */
  public add_transaction = async (params: object, gateway: string = "", status: string = '') => {
    let row: object = {
      user_id: params['user_id'],
      trans_id: get_data_value(params, 'trans_id'),
      pay_sn: params['pay_sn'],
      description: params['description'],
      gateway: gateway,
      environment: get_data_value(params, 'environment', 'live'),
      type: "charge",
      status: 'success',
      created_at: get_utc_timestamp(),
      updated_at: get_utc_timestamp()
    }
    if (status !== "") { //pending
      row['status'] = status;
    } else {
      row['status'] = 'success';
    }

    if (params['coupon']) {
      row['coupon'] = params['coupon'];
    }

    let paid_amount: number = params['paid_amount'] as number;
    let fee: number = 0;
    if (gateway === 'stripe') {
      let stripe_fee: number = 0.029 * paid_amount + 0.3;
      fee = parseFloat(stripe_fee.toFixed(2));
    } else {
      fee = 0;
    }
    let network_amount: number = paid_amount - fee;
    row['paid_amount'] = paid_amount;
    row['network_amount'] = network_amount;
    if (paid_amount == MEMBERSHIP_PRICE[2]) { //annual plan price
      row['transaction_attr'] = 'annual_plan';
    }
    let transaction_id: number = await this.insert(row);
    return transaction_id
  }

  /**
   * update status of a trancaction record
   */
  public update_transaction = async (params, status = 'success') => { //success or failed
    let pay_sn = params['pay_sn']
    let condition = { pay_sn: pay_sn }
    let info = await this.getOne(condition)
    if (empty(info)) {
      return false;
    }
    if (info['status'] !== 'pending') {
      return false;
    }

    let trans_update_data = {
      status: status,
      updated_at: get_utc_timestamp()
    }
    if (!empty(params['trans_id'])) {
      trans_update_data['trans_id'] = params['trans_id']
    }

    await this.update(trans_update_data, condition)
    let user_id = info['user_id'];
    let user_info = await userService.getOne({ id: user_id })

    if (status === 'success') {
      await this.afterPaymentResultSuccess({ ...info, ...params }, user_info)
    }
    else if (status === 'failed') {
      await this.afterPaymentResultFailed({ ...info, ...params }, user_info)
    }

    return true;
  }

  /**
   * process something after payment is successful
   * send email, add referral fund, update license status
   */
  public afterPaymentResultSuccess = async (params, user_info) => {
    if (params['description'] == 'rebill_license') {
      await userService.update_license_status(params);

      console_log("user_info, params", user_info, params)
      await referralFundsHistoryService.addReferralFund(user_info, params['paid_amount'])

      //params['trans_id'] = pay_result;
      /////////////////////////////send invoice email to user//////////////////////////////////////////////////////
      let subject = "Order Confirmation!";
      let product_name = "Membership (Rebill)";
      let invoice_number = params['trans_id'];
      let message = get_message_template(13);
      message = message.replace(/%%subject%%/gi, subject);
      message = message.replace(/%%user_name%%/gi, user_info['name']);
      message = message.replace(/%%product%%/gi, product_name);
      message = message.replace(/%%invoice_number%%/gi, invoice_number);
      message = message.replace(/%%customer_username%%/gi, user_info['name']);
      message = message.replace(/%%login_url%%/gi, FRONT_LOGIN_URL);
      message = message.replace(/%%subtotal_price%%/gi, params['paid_amount']);
      message = message.replace(/%%total_price%%/gi, params['paid_amount']);
      message = message.replace(/%%recurring_subtotal_price%%/gi, params['paid_amount']);
      message = message.replace(/%%recurring_total_price%%/gi, params['paid_amount']);
      let rslt = await emailQueueService.async_send_email(user_info['email'], subject, message);
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }
    return true;
  }

  /**
   * process something after payment is failed
   */
  public afterPaymentResultFailed = async (params, user_info) => {
    let user_id = user_info['id'];
    let where = { user_id: user_id };

    if (params['description'] == 'rebill_license') {
      await userService.setUserInactive(user_id); // make user inactive immediately

      let subject = "Your card has been declined!";
      let message = get_message_template(14);
      message = message.replace(/%%subject%%/gi, subject);
      message = message.replace(/%%user_name%%/gi, user_info['name']);
      await emailQueueService.async_send_email(user_info['email'], subject, message);
      return true;
    }
  }

  /**
   * get user's last payment record
   */
  public getUserLastPayment = async (user_id, success_only = true) => {
    let sql = "select id, paid_amount, created_at from " + TB_TRANSACTION + " where 1=1"
    sql += " and user_id = " + user_id
    if (success_only) {
      sql += " and status = 'success'"
    }
    sql += " order by id desc";
    sql += " limit 0,1"
    let list = <RowDataPacket[]>await this.query(sql)
    if (empty(list)) {
      return false
    } else {
      return list[0]
    }
  }

  public getUserAllPaymentList = async (param, user, success_only = true) => {
    const page = param['page'];
    const page_limit = param['limit'];
    const user_id = user['id'];

    let sql = "select id, trans_id, type, paid_amount, created_at from " + TB_TRANSACTION + " where 1=1"
    sql += " and user_id = " + user_id

    if (success_only) {
      sql += " and status = 'success'"
    }
    sql += " order by id desc";
    sql += " limit " + ((page - 1) * page_limit) + " ," + page_limit

    console.log(`sql::::`, param, sql)

    let list = <RowDataPacket[]>await this.query(sql)
    if (empty(list)) {
      return false
    } else {
      return list;
    }
  }

  public getUserFakePaymentHistory = async (param, user, success_only = true) => {
    const page = param['page'];
    const page_limit = param['limit'];
    const user_id = user['id'];

    let sql = "select id, trans_id, type, paid_amount, created_at from " + TB_TRANSACTION + " where 1=1"
    //sql += " and user_id = " + user_id

    if (success_only) {
      sql += " and status = 'success'"
    }
    sql += " order by id desc";
    sql += " limit " + ((page - 1) * page_limit) + " ," + page_limit

    console.log(`sql::::`, param, sql)

    let list = <RowDataPacket[]>await this.query(sql)
    if (empty(list)) {
      return false
    } else {
      return list;
    }
  }
}

export const transactionService = new TransactionService();
