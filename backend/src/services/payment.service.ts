import { FRONT_LOGIN_URL } from "../var/env.config";
import { TB_LOGS } from "../var/tables";
import { decrypt__data, empty, get_message_template, is_null } from "../helpers/misc";
import { BaseService } from "./base.service";
import { userService } from "./user.service";
import { loggerService } from "./logger.service";
import { nmi } from "../library/nmi";
import { transactionService } from "./transaction.service";
import { couponService } from "./coupon.service";
import { referralFundsHistoryService } from "./referral.funds.history.service";
import { licenseService } from "./license.service";
import { emailQueueService } from "./email.queue.service";

export default class PaymentService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_LOGS;
  }

  /**
   * process customer's payment
   */
  public pay_with_customer = async (user_id: number, post_param = null, rebill_params = null) => {
    try {
      let user_info: object = await userService.getOne({ id: user_id });
      let params: object = {};
      if (empty(post_param)) {
        let customer_detail = user_info['customer_detail']
        let customer_detail_obj = decrypt__data(customer_detail)
        post_param = customer_detail_obj
      }
      if (empty(post_param)) {
        post_param = {}
      }
      if (!empty(rebill_params)) {
        post_param = {
          ...post_param,
          ...rebill_params
        }
      }

      if (is_null(post_param['membership'])) {
        post_param['membership'] = 1
      }
      params['membership'] = post_param['membership'];
      params['pay_sn'] = post_param['pay_sn'];

      params['cardName'] = post_param['cardName'];
      params['cardNumber'] = post_param['cardNumber'];
      params['exp_year'] = post_param['exp_year'];
      params['exp_month'] = post_param['exp_month'];
      params['cvv'] = post_param['cvv'];

      params['amount'] = post_param['amount'];
      params['client_ip'] = post_param['client_ip'] ?? "127.0.0.1";
      params['is_trial'] = post_param['is_trial'] ?? 0;
      params['description'] = post_param['description'] ?? ""
      params['payment_product'] = post_param['payment_product'] ?? "";

      params['user_id'] = user_id;

      const [payment_status, payment_data] = await this.charge_credit_card(params);

      if (!empty(rebill_params)) { // rebill payment (will use webhook) 
        return [payment_status, payment_data]
      }
      else { // new payment
        if (payment_status) {
          await loggerService.info("Payment successfully!!!");
          await loggerService.info(JSON.stringify(payment_data));
          params['trans_id'] = payment_data['transactionid'];
          params['paid_amount'] = params['amount'];
          params['environment'] = (payment_data['livemode'] ? "live" : "test");

          let coupon = post_param['coupon'];
          let coupon_info = null
          if (coupon) {
            coupon_info = await couponService.getOne({ name: coupon })
            if (coupon_info && coupon_info.id) {
              //continue
            } else {
              post_param['coupon'] = ""
            }
          }
          await transactionService.add_transaction({ ...params, coupon: post_param['coupon'] }, 'nmi');

          await userService.update_customer_id(params)
          await licenseService.add_blank_license(params, post_param)
          user_info = await userService.getOne({ id: params['user_id'] });
          if (!empty(user_info)) {
            await referralFundsHistoryService.addReferralFund(user_info, params['amount'])

            /////////////////////////////send invoice email to user//////////////////////////////////////////////////////
            let subject = "Order Confirmation!";
            let product_name = "Purchase Membership";
            let coupon_applied = post_param['coupon_applied'];
            if (Number(coupon_applied) === 1) {
              if (!empty(coupon_info)) {
                product_name = `${product_name} (${coupon_info['desc']})`;
              }
            }
            else {
              let user_licenses = await licenseService.getAll({ user_id: user_info['id'], is_trial: 0 });
              if (!empty(user_licenses)) {
                product_name = "Full Membership";
              }
            }

            let invoice_number = params['trans_id'];
            let message = get_message_template(12);
            message = message.replace(/%%subject%%/gi, subject);
            message = message.replace(/%%user_name%%/gi, user_info['name']);
            message = message.replace(/%%product%%/gi, product_name);
            message = message.replace(/%%invoice_number%%/gi, invoice_number);
            message = message.replace(/%%customer_username%%/gi, user_info['name']);
            message = message.replace(/%%login_url%%/gi, FRONT_LOGIN_URL);
            message = message.replace(/%%subtotal_price%%/gi, params['amount']);
            message = message.replace(/%%total_price%%/gi, params['amount']);
            message = message.replace(/%%recurring_subtotal_price%%/gi, params['amount']);
            message = message.replace(/%%recurring_total_price%%/gi, params['amount']);
            let rslt = await emailQueueService.async_send_email(user_info['email'], subject, message);
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////
          }
        }

        if (payment_status) {
          return [true, "You have paid successfully."]
        } else {
          return [false, payment_data]
        }
      }
    } catch (e) {
      console.log(`pay_with_customer error:::`, e)
      return [false, false]
    }
  }

  /**
   * process credit card payment
   */
  public charge_credit_card = async (params: object, user_info = null) => {
    try {
      const default_billing_data = {
        firstname: "",
        lastname: "",
        company: "",
        address1: '28 Bishopgate Street',
        address2: "",
        city: '28 Bishopgate Street',
        state: 'Sedgeford',
        zip: 'PE36 4AW',
        country: 'US'
      }
      let billing_data = {
        ...default_billing_data,
        firstname: params['cardName'],
      }
      if (user_info) {
        if (user_info?.street) {
          billing_data['address1'] = user_info?.street
        }
        if (user_info?.city) {
          billing_data['city'] = user_info?.city
        }
        if (user_info?.state) {
          billing_data['state'] = user_info?.state
        }
        if (user_info?.zip_code) {
          billing_data['zip'] = user_info?.zip_code
        }
        if (user_info?.country) {
          billing_data['country'] = user_info?.country
        }
      }
      //console.log(`billing_data::::`, billing_data)

      nmi.setBilling(billing_data);
      let shipping_data: object = {
        shipping_firstname: params['cardName']
      }
      nmi.setShipping(shipping_data);
      let order_data: object = {
        ipaddress: params['client_ip'],
        orderid: params['pay_sn'],
        orderdescription: params['description'],
        tax: 0,
        shipping: 0,
        ponumber: params['pay_sn']
      }
      nmi.setOrder(order_data);

      let card_info: object = {
        ccnumber: params['cardNumber'],
        ccexp: params['exp_month'] + '' + params['exp_year'],
        cvv: params['cvv'],
        amount: params['amount']
      }
      const [payment_status, payment_data] = await nmi.doSale(card_info)
      return [payment_status, payment_data]
    } catch (e) {
      console.log(`charge_credit_card error::::`, e)
      return [false, false]
    }
  }

}

export const paymentService = new PaymentService();

