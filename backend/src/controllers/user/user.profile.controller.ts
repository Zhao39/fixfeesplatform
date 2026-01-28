import { Request, Response } from 'express'
import { checkPasswordStrenth, decrypt__data, empty, encrypt__data, encrypt_md5, get_data_value, get_utc_timestamp, is_email, makePaySn, trim_phone } from '../../helpers/misc';
import { userService } from '../../services/user.service';
import UserBaseController from './user.base.controller';
import { loggerService } from '../../services/logger.service';
import { settingService } from '../../services/setting.service';
import { membershipService } from '../../services/membership.service';
import { licenseService } from '../../services/license.service';
import { couponService } from '../../services/coupon.service';
import { paymentService } from '../../services/payment.service';

export default class UserProfileController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get profile page detail
   */
  public getPageDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let ref_id = user['ref_id']
    if (!empty(ref_id)) {
      let ref_info = await userService.getDetail({ encrypted_id: ref_id })
      if (ref_info && !empty(ref_info)) {
        user['ref_info'] = ref_info
      }
    }

    let app_settings = await settingService.get_app_settings();
    data['app_settings'] = app_settings

    data['user'] = user;
    return this.json_output_data(data, "", res);
  }

  /**
   * update profile detail
   */
  public updateDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let account_info = {
      id: user['id']
    }
    let phone = trim_phone(get_data_value(post_param, 'phone')).trim();
    account_info['first_name'] = <string>post_param['first_name'].trim();
    account_info['last_name'] = <string>post_param['last_name'].trim();
    account_info['name'] = <string>post_param['name'].trim();
    account_info['email'] = <string>post_param['email'].trim();
    account_info['phone'] = phone;

    if (empty(account_info['email'])) {
      return this.json_output_error("Email is empty", "", res)
    }
    if (!is_email(account_info['email'])) {
      return this.json_output_error("Invalid email format", "", res)
    }

    const [is_duplicated, message, check_account] = await userService.checkDuplicatedAccount(account_info);
    if (is_duplicated) {
      return this.json_output_error(message, "", res)
    }

    await loggerService.info('User updated profile: old_info: ' + (data['user']['email']));
    let condition = { id: user['id'] }
    await userService.updateDetail(account_info, condition);

    let condition1 = { id: user['id'] }
    let user_info = await userService.getDetail(condition1)
    data['user'] = user_info
    return this.json_output_data(data, "", res);
  }

  /**
   * update memebership
   */
  public updateMembership = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let membership = Number(post_param['membership'])
    const license_info = user['license_info']

    if (membership === license_info?.membership) {
      return this.json_output_data(data, "", res);
    }

    await userService.updateMembership(user['id'], membership);

    let condition = { id: user['id'] }
    let user_info = await userService.getDetail(condition)
    data['user'] = user_info
    return this.json_output_data(data, "", res);
  }

  /**
   * check if membership billing is required
   */
  public checkBillMembershipRequired = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const membership = Number(get_param['membership'])
    let condition = { id: user['id'] }
    let user_info = await userService.getDetail(condition, true)
    data['bill_required'] = true

    // if(BACKEND_LOCATION === 'localhost') {
    //   data['bill_required'] = false
    //   return this.json_output_data(data, "", res);
    // }

    if (user_info?.license_info?.id) {
      if (user_info?.customer_id && user_info?.customer_detail) {
        data['bill_required'] = false
      }
      if (membership !== user_info?.license_info?.membership && membership > user_info?.license_info?.membership) { // membership === 2: annual membership
        data['bill_required'] = true
      }
    }
    return this.json_output_data(data, "", res);
  }

  /**
   * bill membership
   */
  public billMembership = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    console.log(`post_param:::::`, post_param)

    let membership = Number(post_param['membership'])
    if (empty(membership)) membership = 1 //primary membership

    const cur_timestamp = get_utc_timestamp()
    let account_info = user

    let payment_params = {}

    let user_id = account_info['id']
    const client_ip = this.get_ip(req);

    let is_trial = 0
    let amount = licenseService.getMembershipPrice(membership)
    let coupon = membership !== 1 ? post_param['coupon'] : ""
    const couponInfo = await couponService.getOne({ name: coupon })
    if (couponInfo && couponInfo.id) {
      amount = await couponService.getCouponAppliedPrice(couponInfo, amount)
      is_trial = couponInfo.type === 0 ? 1 : 0 //1 : only when type is 0
    }
    payment_params = {
      ...payment_params,
      user_id: user_id,
      client_ip: client_ip,
      amount: amount,
      cardName: post_param['cardName'],
      cardNumber: post_param['cardNumber'],
      expiry: post_param['expiry'],
      exp_year: post_param['exp_year'],
      exp_month: post_param['exp_month'],
      cvv: post_param['cvv'],
      coupon: coupon,
      is_trial: is_trial,
      membership: membership
    }
    const pay_sn: string = makePaySn(user_id);
    payment_params['pay_sn'] = pay_sn
    payment_params['payment_type'] = 'newly'
    payment_params['description'] = 'purchase_license'
    payment_params['payment_product'] = payment_params['description']
    console.log(`payment_params::::`, payment_params)
    let pay_result: any;
    let message: any;
    if (amount > 0) {
      [pay_result, message] = await paymentService.pay_with_customer(user_id, payment_params)
      console.log(`pay_result, message::::::`, pay_result, message)
    } else {
      pay_result = true
    }

    if (pay_result) {
      const update_data = {
        register_complete: 1,
        is_active: 1,
        user_verified: '1'
      }

      update_data['update_timestamp'] = cur_timestamp
      const condition = { id: user_id }
      await userService.update(update_data, condition);
      account_info = await userService.getDetail(condition)
      const data = {
        user: account_info
      }
      return this.json_output_data(data, "Membership has been activated successfully!", res);
    } else {
      return this.json_output_error(message, "", res);
    }
  }

  /**
   * cancel membership
   */
  public cancelMembership = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const cur_timestamp = get_utc_timestamp()
    let condition = { id: user['id'] }

    await userService.cancelMembership(user['id']);
    let user_info = await userService.getDetail(condition)
    data['user'] = user_info
    return this.json_output_data(data, "", res);
  }

  /**
   * recover membership
   */
  public recoverMembership = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const cur_timestamp = get_utc_timestamp()
    let condition = { id: user['id'] }

    await userService.recoverMembership(user['id']);
    let user_info = await userService.getDetail(condition)
    data['user'] = user_info
    return this.json_output_data(data, "", res);
  }

  /**
   * update password
   */
  public updatePassword = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    if (empty(post_param['old'])) {
      return this.json_output_error("Old password is empty", "", res)
    }
    if (empty(post_param['password'])) {
      return this.json_output_error("New password is empty", "", res)
    }

    if (user['password'] !== encrypt_md5(post_param['old'])) {
      return this.json_output_error("Incorrect Old password", "", res)
    }

    let [passwordStrenth, error_message] = checkPasswordStrenth(post_param['password'])
    if (!passwordStrenth) {
      return this.json_output_error(error_message, "", res)
    }
    let condition = { id: user['id'] }
    let update_data = {
      password: encrypt_md5(post_param['password'])
    }
    await userService.update(update_data, condition);

    let user_info = await userService.getOne(condition)
    data['user'] = user_info
    return this.json_output_data(data, "", res);
  }

  /**
   * get profile detail
   */
  public getDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const condition = { id: user['id'] }
    let user_info = await userService.getDetail(condition)
    data['user'] = user_info;
    let bannerMessage = ""
    const isFreeMember = userService.isFreeMember(user_info)
    if (isFreeMember) {
      //continue;
    } else {
      const license_info = user_info?.license_info
      if (user['is_active'] !== 1 || empty(license_info)) {
        bannerMessage = `Your account is inactive! To reactivate your account, please go on "Membership" and follow the instructions.`
      } else {
        if (license_info?.is_cancelled === 1) {
          const license_duration = licenseService.getLicenseDuration(license_info)
          license_info['license_duration'] = license_duration
          const license_remain_days = licenseService.getLicenseRemainingDays(license_info)
          license_info['license_remain_days'] = license_remain_days
          if (license_remain_days > 0) {
            bannerMessage = `You have cancelled your membership! Your account stays active for the next ${license_remain_days} day(s). You will not be charged anymore.`
          } else {
            bannerMessage = `You have cancelled your membership! You will not be charged anymore.`
          }
        }
      }
    }

    data['bannerMessage'] = bannerMessage;
    return this.json_output_data(data, "", res);
  }

  /**
   * get membership detail
   */
  public getUserMembershipDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const condition = { id: user['id'] }
    let user_info = await userService.getDetail(condition)
    const license_info = user_info?.license_info
    if (license_info) {
      const license_duration = licenseService.getLicenseDuration(license_info)
      license_info['license_duration'] = license_duration
      const license_remain_days = licenseService.getLicenseRemainingDays(license_info)
      license_info['license_remain_days'] = license_remain_days
      user_info['license_info'] = license_info
    }
    data['user'] = user_info;
    return this.json_output_data(data, "", res);
  }

  /**
   * update card detail
   */
  public updateCardDetail = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let params = {};
      params['cardName'] = post_param['cardName'];
      if (params['cardName'].length > 255) {
        return this.json_output_error("Name On Card is too long", data, res);
      }
      params['cardNumber'] = post_param['cardNumber'];
      params['exp_year'] = post_param['exp_year'];
      params['exp_month'] = post_param['exp_month'];
      params['cvv'] = post_param['cvv'];

      let user_id = user['id'];
      let condition: object = { id: user_id };
      let cardNumber: string = <string>params['cardNumber'];
      let card_last_4 = cardNumber.slice(-4);
      let customer_detail = user['customer_detail']
      let customer_detail_obj = {}
      if (!empty(customer_detail)) {
        customer_detail_obj = decrypt__data(customer_detail)
      } else {
        customer_detail_obj = {
          payment_type: 'newly',
          cardName: '',
          cardNumber: '',
          exp_year: '',
          exp_month: '',
          cvv: '',
          pay_sn: '',
          amount: '0',
          client_ip: "",
          description: 'purchase_license',
          user_id: user['id'],
          payment_product: 'purchase_license',
          trans_id: '',
          paid_amount: 0,
          environment: 'live',
        }
      }
      if (empty(customer_detail_obj)) {
        customer_detail_obj = {}
      }
      let new_param = { ...customer_detail_obj, ...params }
      let customer_detail_encrypted_str = encrypt__data(new_param)
      if (empty(customer_detail_encrypted_str)) {
        return this.json_output_error("Invalid request", data, res);
      }
      let update_data = {
        customer_detail: customer_detail_encrypted_str,
        customer_id: user_id,
        card_last_4: card_last_4
      }
      console.log("user_id, old card token:::::", user_id, user['customer_detail'])
      console.log("user_id, new card token:::::", user_id, update_data['customer_detail'])
      await loggerService.info("user_id(" + user_id + ") has updated his card (************" + user['card_last_4'] + " => ************" + card_last_4 + ")");
      await userService.update(update_data, condition)
      let user_info = await userService.getOne({ id: user['id'] })
      data['user'] = user_info
      return this.json_output_data(data, "", res);
    } catch (e) {
      return this.json_output_error("", "", res)
    }
  }

  /**
   * remove card detail
   */
  public removeCardDetail = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let user_id = user['id'];
      let condition: object = { id: user_id };
      let update_data = {
        customer_detail: "",
        customer_id: "",
        card_last_4: ""
      }
      console.log("user_id, before remove card token:::::", user_id, user['customer_detail'])
      await loggerService.info("user_id(" + user_id + ") has removed his card (************" + user['card_last_4'] + ")");
      await userService.update(update_data, condition)
      let user_info = await userService.getOne({ id: user['id'] })
      data['user'] = user_info
      return this.json_output_data(data, "", res);
    } catch (e) {
      return this.json_output_error("", "", res)
    }
  }
}

export const userProfileController = new UserProfileController()
