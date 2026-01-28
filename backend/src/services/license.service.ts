import { RowDataPacket } from "mysql2";
import { MEMBERSHIP_PERIOD, MEMBERSHIP_PRICE } from "../var/config";
import { empty, floatval, get_data_value, get_utc_timestamp, intval, isset, toLocalDate } from "../helpers/misc";
import { TB_LICENSE } from "../var/tables";
import { BaseService } from "./base.service";
import { userService } from './user.service';
import { transactionService } from './transaction.service';
import { referralFundsHistoryService } from './referral.funds.history.service';
import { couponService } from './coupon.service';

export default class LicenseService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_LICENSE;
  }

  /**
   * get active license list for user
   */  
  public getActiveLicenseList = async (user_id: number | string) => {
    let where = { user_id: user_id, status: 1 }
    let list = await this.getAll(where, 'add_timestamp asc')
    if (empty(list)) list = <RowDataPacket>[]
    return list;
  }

  /**
   * get a price of current memebership
   */  
  public getMembershipPrice = (membership) => {
    let amount = MEMBERSHIP_PRICE[1]
    membership = Number(membership)
    if (empty(membership)) membership = 1
    if (isset(MEMBERSHIP_PRICE[membership])) {
      amount = MEMBERSHIP_PRICE[membership]
    }
    return amount
  }

  /**
   * get a price of  current license
   */  
  public getLicensePrice = (license_info: any) => {
    let membership = Number(license_info['membership'])
    let amount = this.getMembershipPrice(membership)
    return amount
  }

  /**
   * get a period of current license
   */  
  public getLicenseDuration = (license_info: any) => {
    let period_fee_duration = MEMBERSHIP_PERIOD[1]
    let membership = Number(license_info['membership'])
    if (isset(MEMBERSHIP_PERIOD[membership])) {
      period_fee_duration = MEMBERSHIP_PERIOD[membership]
    }

    if (membership === 1) {
      const coupon = license_info['coupon']
      if (coupon) {
        let coupon_type = intval(license_info['coupon_type'])
        let coupon_value = intval(license_info['coupon_value'])
        if (coupon_type === 0) { // day trial coupon
          period_fee_duration = coupon_value
        }
        else if (coupon_type === 1) { // percent discount coupon
          //continue
        }
      }
    }

    period_fee_duration = intval(period_fee_duration)
    return period_fee_duration
  }

  /**
   * get license remain days
   */  
  public getLicenseRemainingDays = (license_info: any) => {
    if (license_info) {
      const cur_timestamp = get_utc_timestamp()
      const add_timestamp = license_info?.add_timestamp
      let period_fee_duration = this.getLicenseDuration(license_info);
      let expire_timestamp = Number(add_timestamp) + period_fee_duration * 86400
      let remaining_timestamp = expire_timestamp - cur_timestamp
      if (remaining_timestamp < 0) {
        remaining_timestamp = 0
      }
      let remainDays = Math.ceil(remaining_timestamp / 86400)
      return remainDays
    }
    return 0
  }

  /**
   * rebill license from user's balance
   */  
  public rebill_license_with_balance = async (user_info, license_info, license_price, force = false, add_timestamp = 0) => {
    try {
      if (empty(user_info)) {
        return false;
      }

      let user_id = user_info['id'];
      let balance = floatval(user_info['balance']);
      if (balance < license_price) {
        if (force) {
          // continue
        } else {
          return false;
        }
      }

      if (empty(add_timestamp) || add_timestamp === 0) {
        add_timestamp = get_utc_timestamp();
      }

      balance = balance - license_price;
      let params = {}
      params['trans_id'] = "rebill_license_" + user_id + "_" + license_info['id'] + "_" + add_timestamp;
      params['paid_amount'] = license_price;
      params['amount'] = license_price;
      params['client_ip'] = "127.0.0.1";
      params['description'] = "rebill_license";
      params['user_id'] = user_id;
      params['payment_product'] = "rebill_license";
      params['environment'] = "live";
      params['pay_sn'] = license_info['pay_sn'];
      await transactionService.add_transaction(params, 'wallet', 'success');
      //await userService.update_license_status(params, add_timestamp);
      await userService.update({ balance: balance }, { id: user_id });

      await referralFundsHistoryService.addReferralFund(user_info, params['amount'], add_timestamp)
      return true;

    } catch (e) {
      console.log("rebill_license_with_balance error:::", e)
      return false
    }
  }

  /**
   * add a new license blank
   */  
  public add_blank_license = async (params: object, post_param: object = {}) => {
    try {
      let user_id = params['user_id'];
      const license_condition = {
        user_id: user_id
      }
      const oldLicense = await this.getOne(license_condition)

      const cur_timestamp = get_utc_timestamp()

      let license_data = {
        license_number: "",
        user_id: user_id,
        pay_sn: params['pay_sn'],
        status: '1',
        is_trial: params['is_trial'],
        license_type: 0,
        add_timestamp: cur_timestamp,
        first_created_timestamp: cur_timestamp
      }
      license_data['membership'] = params['membership']
      license_data['membership_type'] = 1

      let coupon = post_param['coupon'];
      if (coupon) {
        let coupon_info = await couponService.getOne({ name: coupon })
        if (!empty(coupon_info)) {
          license_data['coupon'] = coupon_info['name']
          license_data['coupon_type'] = coupon_info['type']
          license_data['coupon_value'] = coupon_info['value']
        }
      }

      if (oldLicense && oldLicense.id) {
        if (Number(oldLicense['status']) === 1) {
          if (Number(license_data['membership']) !== Number(oldLicense['membership'])) {
            license_data['first_created_timestamp'] = oldLicense['first_created_timestamp']
            const oldLicensePeriod = this.getLicenseDuration(oldLicense)
            license_data['add_timestamp'] = oldLicense['add_timestamp'] + (86400 * oldLicensePeriod)
          }
        }
        await licenseService.update(license_data, license_condition);
      } else {
        await licenseService.insert(license_data);
      }

      const user_update_data: object = {
        is_active: 1,
        coupon: get_data_value(license_data, 'coupon'),
      }
      const condition = { id: user_id }
      await userService.update(user_update_data, condition);
      return true
    } catch (e) {
      console.log(`add_blank_license error:::`, e)
      return false
    }
  };

  /**
   * update memebership
   */  
  public update_license_membership = async (oldLicense, membership) => {
    try {
      //console.log(`oldLicense, membership:::`, oldLicense, membership)
      const cur_timestamp = get_utc_timestamp()
      let license_data = {
        membership: membership
      }

      if (oldLicense && oldLicense.id) {
        if (Number(oldLicense['status']) === 1) {
          if (Number(membership) !== Number(oldLicense['membership'])) {
            license_data['first_created_timestamp'] = oldLicense['first_created_timestamp']
            const oldLicensePeriod = this.getLicenseDuration(oldLicense)
            license_data['add_timestamp'] = oldLicense['add_timestamp'] + (86400 * oldLicensePeriod)
          }
        }

        let license_condition = { id: oldLicense['id'] }
        await licenseService.update(license_data, license_condition);
      }
      return true
    } catch (e) {
      console.log(`update_license_membership error:::`, e)
      return false
    }
  }
}

export const licenseService = new LicenseService();
