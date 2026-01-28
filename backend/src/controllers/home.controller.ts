import { checkPasswordStrenth, console_log, detectBrowser, generate_encrypted_id, getIpFromRequest, is_email, makePaySn, onlyLettersAndNumbers } from './../helpers/misc';
import { Request, Response } from 'express'
import { empty, encrypt_md5, get_data_value, get_message_template, get_utc_timestamp, randomString, send_email, trim_phone } from '../helpers/misc';
import { isObject } from 'lodash';
import * as jwt from "jsonwebtoken";
import { settingService } from '../services/setting.service';
import { userService } from '../services/user.service';
import BaseController from './base.controller';
import { AUTO_EMAIL_VERIFICATION, BACKEND_LOCATION, BASE_APP_URL, BASE_URL, FRONT_LOGIN_URL, UPLOAD_DIR } from '../var/env.config';
import { APP_NAME, DEFAULT_PASSWORD, ENVIRONMENT, JWT_SECRET } from '../var/config';
import { verificationCodeService } from '../services/verification.code.service';
import { tokenService } from '../services/token.service';
import { adminService } from '../services/admin.service';
import { couponService } from '../services/coupon.service';
import { twoFactAuth } from '../library/twoFactAuth';
import FileUploader from '../library/fileuploader';
import { licenseService } from '../services/license.service';
import { paymentService } from '../services/payment.service';
import { emailQueueService } from '../services/email.queue.service';

export default class HomeController extends BaseController {
  public environment = ENVIRONMENT.PARTNER

  constructor() {
    super();
  }

  public init = (req: Request, res: Response): void => {
    this.setReqRes({ req: req, res: res });
  }

  /********************************************** main controllers **************************************************************/

  //api for get app setting : GET
  public get_app_settings = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let app_settings = await settingService.get_app_settings();
      //console.log(app_settings);
      return this.json_output_data(app_settings, "", res);
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  public checkSponsor = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    ////////////////////////////////////////////////////////////////
    let default_sponsor = post_param['default_sponsor']
    if (empty(default_sponsor)) {
      default_sponsor = 'Admin'
    }
    if (default_sponsor !== 'Admin') {
      let default_sponsor_info = await userService.getOne({ name: default_sponsor })
      if (!empty(default_sponsor_info)) {
        //
      } else {
        default_sponsor = 'Admin'
      }
    }

    let result_name = "";
    if (!empty(post_param['ref']) && post_param['ref'] !== 'Admin') {
      let ref_name: string = <string>post_param['ref'];
      let condition = {
        name: ref_name
      };
      let ref_info = await userService.getOne(condition);
      if (!empty(ref_info) && !empty(ref_info['id'])) {
        result_name = ref_name
      }
    } else {
      result_name = "Admin";
    }
    if (result_name !== "") {
      return this.json_output_data(result_name, "Sponsor has been changed!", res)
    } else {
      return this.json_output_error("This user doesn't exist.", { default_sponsor: default_sponsor }, res)
    }
  }

  public getRegisterPageData = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      ////////////////////////////////////////////////////////////////
      const browserName = detectBrowser(req)
      const clientIp = getIpFromRequest(req)

      let user_info = null

      const coupon = get_param['coupon']
      const force_coupon = get_param['force_coupon']
      const email = get_param['email']
      const encrypted_id = get_param['encrypted_id']
      const step = get_param['step']

      if (encrypted_id) {
        user_info = await userService.getDetail({ encrypted_id: encrypted_id })
      }
      else if (email) {
        user_info = await userService.getDetail({ email: email })
      }

      if (coupon) {
        if (force_coupon) {
          //continue
        } else {
          let isValid = await couponService.checkCouponSecurity(clientIp);
          console.log("isValid::::", isValid)
          if (!isValid) {
            return this.json_output_error("You already used free trial", { coupon_invalid: true, clientIp: clientIp }, res)
          }
        }
      }

      const data = {
        user: user_info,
      }
      return this.json_output_data(data, "", res)
    } catch (e) {
      console.log("error", e)
      return this.json_output_error("", "", res)
    }
  }

  public registerDetail = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////  
    try {
      let app_settings = await settingService.get_app_settings();
      if (app_settings['registration_func'] == "false") {
        return this.json_output_error("Registration temporarily disabled! Please check back later", "", res); //temporary quan code
      }

      let check_auth_allowed = await this.checkAuthAllowed(req, res)
      if (!check_auth_allowed) {
        return false;
      }

      let get_param: object = req['query'];
      let post_param: object = req['fields'];
      console.log("post_param:::", post_param)
      let account_info: object = {};
      let ref_info = null;
      if (isObject(post_param)) {
        let id = Number(get_data_value(post_param, 'id', 0))
        account_info['id'] = id

        let phone = trim_phone(get_data_value(post_param, 'phone')).trim();
        account_info['first_name'] = <string>post_param['first_name'].trim();
        account_info['last_name'] = <string>post_param['last_name'].trim();
        account_info['name'] = <string>post_param['name'].trim();
        account_info['email'] = <string>post_param['email'].trim();
        account_info['phone'] = phone;

        if (empty(account_info['name'])) {
          return this.json_output_error("Name field is empty", "", res)
        }
        if (!onlyLettersAndNumbers(account_info['name'])) {
          return this.json_output_error("Name field can contain only letters and numbers.", "", res)
        }
        if (empty(account_info['email'])) {
          return this.json_output_error("Email field is empty", "", res)
        }

        if (post_param['ref_name']) {
          account_info['ref_name'] = post_param['ref_name'].trim();
          let condition = {
            name: account_info['ref_name']
          };
          let ref_info = await userService.getOne(condition);
          console_log(`ref_info:::`, ref_info)
          if (!empty(ref_info) && !empty(ref_info['id']) && account_info['ref_name'] !== 'Admin') {
            account_info['ref_id'] = ref_info['encrypted_id'];
            account_info['ref_name'] = ref_info['name'];
            const { level1RefInfo, level2RefInfo, level3RefInfo } = await userService.getLevelReferralList(ref_info['encrypted_id'])
            if (level2RefInfo && level2RefInfo['encrypted_id']) {
              account_info['level2_ref_id'] = level2RefInfo['encrypted_id'];
            }
            if (level3RefInfo && level3RefInfo['encrypted_id']) {
              account_info['level3_ref_id'] = level3RefInfo['encrypted_id'];
            }
          }
        }

        if (post_param['register_step']) {
          account_info['register_step'] = post_param['register_step']
        }

        let password: string = <string>post_param['password'];
        let [passwordStrenth, error_message] = checkPasswordStrenth(post_param['password'])
        if (!passwordStrenth) {
          return this.json_output_error(error_message, "", res)
        }
        account_info['password'] = encrypt_md5(password);

        const [is_duplicated, duplicated_message, check_account] = await userService.checkDuplicatedAccount({ ...account_info });
        console.log("is_duplicated, account_info::::", is_duplicated, duplicated_message, check_account, account_info)
        delete account_info['id']

        if (is_duplicated) {
          if (check_account['user_verified'] === '1') {
            return this.json_output_error(duplicated_message, { user: check_account }, res);
          } else {
            if (id !== check_account['id']) {
              await userService.delete({ id: check_account['id'] })
            }
          }
        }

        if (id > 0) {
          const check_account_info = await userService.getOne({ id: id })
          if (check_account_info && check_account_info['id']) {
            if (check_account_info['email'] !== account_info['email']) { // if email is changed, then verify again
              account_info['user_verified'] = '0'
            }
            account_info['update_timestamp'] = get_utc_timestamp();

            if (AUTO_EMAIL_VERIFICATION === 'enabled') {
              account_info['user_verified'] = '1'
            }
            await userService.update(account_info, { id: id })
            account_info = await userService.getOne({ id: id })
          } else {
            return this.json_output_error("Invalid request, Please try later!", { account_no_exist: true }, res)
          }
        } else {
          if (AUTO_EMAIL_VERIFICATION === 'enabled') {
            account_info['user_verified'] = '1'
          }
          let user_id = await userService.addUser(account_info);
          account_info['id'] = user_id;
        }

        const user_info = await userService.getOne({ email: account_info['email'] })
        const confirm_link = await this.sendEmailVerification(account_info)
        const data = {
          user: user_info,
          confirm_link: confirm_link
        }
        const message = "We have sent a confirmation email to " + account_info['email']
        return this.json_output_data(data, message, res);
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  //api for check email register : POST
  public checkEmail = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////  
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      console.log("post_param:::", post_param)

      const cur_timestamp = get_utc_timestamp()
      let account_info: object = {};
      let ref_info = null;
      if (isObject(post_param)) {
        let phone = trim_phone(get_data_value(post_param, 'phone')).trim();
        account_info['first_name'] = <string>post_param['first_name'].trim();
        account_info['last_name'] = <string>post_param['last_name'].trim();
        account_info['name'] = <string>post_param['name'].trim();
        account_info['email'] = <string>post_param['email'].trim();
        account_info['phone'] = phone;

        if (empty(account_info['name'])) {
          return this.json_output_error("Name field is empty", "", res)
        }
        if (!onlyLettersAndNumbers(account_info['name'])) {
          return this.json_output_error("Name field can contain only letters and numbers.", "", res)
        }
        if (empty(account_info['email'])) {
          return this.json_output_error("Email field is empty", "", res)
        }

        if (post_param['coupon']) {
          account_info['coupon'] = post_param['coupon']
        }
        if (post_param['ref_name']) {
          account_info['ref_name'] = post_param['ref_name'].trim();
          let condition = {
            name: account_info['ref_name']
          };
          let ref_info = await userService.getOne(condition);
          if (!empty(ref_info) && !empty(ref_info['id']) && account_info['ref_name'] !== 'Admin') {
            account_info['ref_id'] = ref_info['encrypted_id'];
            //account_info['ref_name'] = ref_info['name'];
            const { level1RefInfo, level2RefInfo, level3RefInfo } = await userService.getLevelReferralList(ref_info['encrypted_id'])
            if (level2RefInfo && level2RefInfo['encrypted_id']) {
              account_info['level2_ref_id'] = level2RefInfo['encrypted_id'];
            }
            if (level3RefInfo && level3RefInfo['encrypted_id']) {
              account_info['level3_ref_id'] = level3RefInfo['encrypted_id'];
            }
          }
        }

        let password: string = <string>post_param['password'];
        // let [passwordStrenth, error_message] = checkPasswordStrenth(post_param['password'])
        // if (!passwordStrenth) {
        //   return this.json_output_error(error_message, "", res)
        // }
        account_info['password'] = encrypt_md5(password);

        const [is_duplicated, duplicated_message, check_account] = await userService.checkDuplicatedAccount({ ...account_info });
        console.log("is_duplicated, account_info::::", is_duplicated, duplicated_message, check_account, account_info)

        // if(!is_null(account_info['id'])) {
        //   delete account_info['id']
        // }

        console.log("account_info::::", account_info)

        if (is_duplicated) {
          if (check_account['user_verified'] === '1') {
            return this.json_output_error(duplicated_message, "", res);
          } else {
            account_info['update_timestamp'] = cur_timestamp
            await userService.update(account_info, { id: check_account['id'] })
            account_info = await userService.getOne({ id: check_account['id'] })
          }
        } else { // new user
          account_info['update_timestamp'] = cur_timestamp
          account_info['add_timestamp'] = cur_timestamp
          account_info['user_verified'] = '0'

          let user_id = await userService.insert(account_info);
          let user_encrypted_id = generate_encrypted_id(user_id, 'partner');
          let condition = { id: user_id };
          let update_data = {
            encrypted_id: user_encrypted_id
          };
          await userService.update(update_data, condition);
          account_info['id'] = user_id;
        }

        const confirm_link = await this.sendEmailVerification(account_info)
        const data = {
          confirm_link: confirm_link
        }
        const message = "We have sent a confirmation email to " + account_info['email']
        return this.json_output_data(data, message, res);
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  public resendCheckEmail = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////  
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      let ref_info = null;
      if (isObject(post_param)) {
        const email = <string>post_param['email'].trim();
        const condition = {
          email: email
        }
        console_log("condition::::", condition)
        const account_info = await userService.getOne(condition)
        console_log("account_info::::", account_info)
        if (account_info && account_info['id']) {
          if (account_info['user_verified'] === '1') {
            const data = {
              user: account_info,
            }
            return this.json_output_data(data, "Account has already been verified", res)
          }
        } else {
          return this.json_output_error("Email does not exist", "", res)
        }

        const confirmEmailRobotTimestamp = await this.getConfirmEmailRobotTimestamp(account_info)
        if (confirmEmailRobotTimestamp > 0) {
          return this.json_output_error("Please try later", { confirmEmailRobotTimestamp: confirmEmailRobotTimestamp }, res)
        }
        else {
          const confirm_link = await this.sendEmailVerification(account_info, true)
          const data = {
            user: account_info,
            confirm_link: confirm_link
          }
          const message = "We have sent a confirmation email to " + account_info['email']
          return this.json_output_data(data, message, res);
        }
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  private sendEmailVerification = async (account_info: object, resend = false) => {
    try {
      const verify_type = "confirm_email"
      const cur_timestamp = get_utc_timestamp()
      let verification_code: string = randomString(5, true)
      verification_code = encrypt_md5(verification_code);
      let verification_record = {
        user: account_info['email'],
        code: verification_code,
        type: 'email',
        verify_type: verify_type,
        add_timestamp: cur_timestamp,
        update_timestamp: resend ? cur_timestamp : 0
      }
      let condition1 = { user: account_info['email'], type: 'email', verify_type: verify_type }
      let verification_info = await verificationCodeService.getOne(condition1);
      if (!empty(verification_info)) {
        let update_data = {
          code: verification_code,
          add_timestamp: cur_timestamp,
          update_timestamp: resend ? cur_timestamp : 0
        }
        await verificationCodeService.update(update_data, condition1)
      } else {
        await verificationCodeService.insert(verification_record);
      }
      let confirm_email_link = BASE_APP_URL + 'confirm-email' + '/' + verification_code;

      let message = get_message_template(0);
      let subject = "Verify your email for " + APP_NAME + "";
      message = message.replace(/%%subject%%/gi, subject);
      message = message.replace(/%%login_url%%/gi, FRONT_LOGIN_URL);
      message = message.replace(/%%user_name%%/gi, account_info['name']);
      message = message.replace(/%%confirm_email_link%%/gi, confirm_email_link);
      send_email(account_info['email'], subject, message);

      return confirm_email_link
    } catch (e) {
      return false
    }
  }

  public confirmEmailVerification = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      const verify_type = "confirm_email"

      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let code = post_param['code'];
      let condition = {
        code: code,
        type: 'email',
        verify_type: verify_type
      }
      let verification_info = await verificationCodeService.getOne(condition)
      if (!empty(verification_info)) {
        let condition1 = {
          email: verification_info['user']
        }
        const update_data = { user_verified: '1' }
        await userService.update(update_data, condition1);
        //await verificationCodeService.delete(condition)

        let user_info = await userService.getOne(condition1)

        let ref_id = user_info['ref_id'];
        if (!empty(ref_id)) {
          let ref_user_info = await userService.getOne({ encrypted_id: ref_id });
          if (!empty(ref_user_info)) {
            let message = get_message_template(3);
            let subject = "Congratulations! Someone just signed up!";
            message = message.replace(/%%subject%%/gi, "Congratulations! <br/>Someone just signed up!");
            message = message.replace(/%%user_name%%/gi, ref_user_info['name']);
            message = message.replace(/%%referral_user_name%%/gi, user_info['name'] + " (" + user_info['email'] + ")");
            send_email(ref_user_info['email'], subject, message);
          }
        }
        return this.json_output_data(user_info, 'Email has been verified successfully', res)
      } else {
        return this.json_output_error('Invalid or expired link', "", res)
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  private getConfirmEmailRobotTimestamp = async (account_info: object) => {
    try {
      const stepSeconds = 6 * 60 // 6 minutes
      const verify_type = "confirm_email"
      const cur_timestamp = get_utc_timestamp()
      let condition1 = { user: account_info['email'], type: 'email', verify_type: verify_type }
      let verification_info = await verificationCodeService.getOne(condition1);
      if (verification_info && verification_info.id) {
        const update_timestamp = Number(verification_info.update_timestamp)
        if (update_timestamp > 0) {
          let deltaTimestamp = cur_timestamp - update_timestamp
          let secondRemaining = stepSeconds - deltaTimestamp
          if (secondRemaining > 0) {
            return secondRemaining
          }
        }
      }
      return 0
    } catch (e) {
      return 0
    }
  }

  public checkEmailVerified = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////  
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      let ref_info = null;
      if (isObject(post_param)) {
        const email = <string>post_param['email'].trim();
        const condition = {
          email: email
        }
        console_log("condition::::", condition)
        const account_info = await userService.getOne(condition)
        const user_verified = get_data_value(account_info, 'user_verified', '0')
        const data = {
          user: account_info
        }
        if (user_verified === '1') {
          return this.json_output_data(data, "", res);
        } else {
          return this.json_output_error("Please check your email box and follow the link to verify your email address", data, res);
        }
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  public registerBillInfo = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let app_settings = await settingService.get_app_settings();
      if (app_settings['registration_func'] == "false") {
        return this.json_output_error("Registration temporarily disabled! Please check back later", "", res); //temporary quan code
      }

      let check_auth_allowed = await this.checkAuthAllowed(req, res)
      if (!check_auth_allowed) {
        return false;
      }

      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      let cur_timestamp = get_utc_timestamp();
      if (isObject(post_param)) {
        let user_id = post_param['id']
        let condition = {};
        if (empty(user_id)) {
          condition = { email: post_param['email'] };
        } else {
          condition = { id: user_id };
        }
        account_info = await userService.getOne(condition)
        if (empty(account_info)) {
          return this.json_output_error("Invalid request", "", res);
        } else {
          if (account_info['register_complete'] === 1) {
            const data = {
              user: account_info
            }
            return this.json_output_data(data, "You have been already registered.", res);
          }
        }
        user_id = account_info['id']
        const update_data = {
          street: post_param['street'],
          city: post_param['city'],
          state: post_param['state'],
          zip_code: post_param['zip_code'],
          country: post_param['country'],
          register_step: post_param['register_step'],
        }
        condition = { id: user_id }
        await userService.update(update_data, condition)
        account_info = await userService.getOne(condition)
        const data = {
          user: account_info,
        }
        const message = "success"
        return this.json_output_data(data, message, res);
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("registerBillInfo error:::", e)
      this.json_output_error("", "", res)
    }
  }

  public completeRegister = async (req: Request, res: Response) => { // register with card info
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let app_settings = await settingService.get_app_settings();
      if (app_settings['registration_func'] == "false") {
        return this.json_output_error("Registration temporarily disabled! Please check back later", "", res); //temporary quan code
      }

      let check_auth_allowed = await this.checkAuthAllowed(req, res)
      if (!check_auth_allowed) {
        return false;
      }

      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      let cur_timestamp = get_utc_timestamp();
      if (isObject(post_param)) {
        let user_id = post_param['id']
        let condition = {};
        if (empty(user_id)) {
          condition = { email: post_param['email'] };
        } else {
          condition = { id: user_id };
        }
        account_info = await userService.getOne(condition)
        if (empty(account_info)) {
          return this.json_output_error("Invalid request", "", res);
        } else {
          if (account_info['register_complete'] === 1) {
            const data = {
              user: account_info
            }
            return this.json_output_data(data, "You have been already registered.", res);
          }
        }

        let payment_params = {}

        user_id = account_info['id']
        const client_ip = this.get_ip(req);

        let is_trial = 0
        let membership = Number(account_info['membership'])
        let amount = licenseService.getMembershipPrice(membership)
        let coupon = post_param['coupon'] ?? ""
        const couponInfo = await couponService.getOne({ name: coupon })
        if (couponInfo && couponInfo.id) {
          amount = await couponService.getCouponAppliedPrice(couponInfo, amount)
          is_trial = couponInfo.type === 0 ? 1 : 0 //1 : only when type is 0
          await userService.update({ coupon: coupon }, { id: user_id })
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
          is_trial: is_trial
        }
        const pay_sn: string = makePaySn(user_id);
        payment_params['pay_sn'] = pay_sn
        payment_params['payment_type'] = 'newly'
        payment_params['description'] = 'purchase_license'
        payment_params['payment_product'] = payment_params['description']
        //console.log(`payment_params::::`, payment_params)
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
          // const browserName = detectBrowser(req)
          // let clientIp = getIpFromRequest(req)
          // update_data['ip'] = clientIp

          update_data['update_timestamp'] = cur_timestamp
          await userService.update(update_data, condition)

          await userService.updateUserIdFromEmail(account_info['email'], account_info['id'])

          let message = get_message_template(2);
          let subject = "Welcome to " + APP_NAME + "!";
          message = message.replace(/%%subject%%/gi, subject);
          message = message.replace(/%%user_name%%/gi, account_info['name']);
          message = message.replace(/%%login_url%%/gi, FRONT_LOGIN_URL);
          //console.log(`account_info['email'], subject, message::::`, account_info['email'], subject, message)
          await emailQueueService.async_send_email(account_info['email'], subject, message); //send_email(account_info['email'], subject, message);

          account_info = await userService.getOne(condition)
          const data = {
            user: account_info
          }
          return this.json_output_data(data, "Registration was successful!", res);
        } else {
          return this.json_output_error(message, "", res);
        }

      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("completeRegister error:::", e)
      this.json_output_error("", "", res)
    }
  }

  private create_jwt = async (user_id: string | number, user_type: string = "user") => {
    try {
      let user_info: object;
      if (user_type == 'admin') {
        let condition = {
          admin_id: user_id
        }
        user_info = await adminService.getOne(condition)
        if (empty(user_info)) {
          return false
        }
        user_info['id'] = user_info['admin_id'];
        user_info['email'] = user_info['admin_email'];
        user_info['is_admin'] = '1';
      } else {
        let condition = {
          id: user_id
        }
        user_info = await userService.getDetail(condition)
        if (empty(user_info)) {
          return false
        }
        user_info['is_admin'] = '0';
      }

      const token = jwt.sign({ username: user_info['email'] }, JWT_SECRET);
      const token_row = {
        user_id: user_info['id'],
        user_type: user_type,
        token: token,
        login_time: get_utc_timestamp()
      }
      await tokenService.insert(token_row);
      user_info['token'] = token;
      return user_info
    } catch (e) {
      console.log("error", e)
      return false
    }
  }

  //api for login : POST
  public login = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};

      if (isObject(post_param)) {
        account_info['email'] = <string>post_param['email'].trim();
        account_info['password'] = <string>post_param['password'];
        const [checkAdmin, adminInfo] = await adminService.checkAdminLogin(account_info);
        if (checkAdmin) {
          let user_info = await this.create_jwt(adminInfo['admin_id'], 'admin')
          return this.json_output_data(user_info, "You're in!", res);
        } else {
          let check_auth_allowed = await this.checkAuthAllowed(req, res)
          if (!check_auth_allowed) {
            return false;
          }
          let condition = { email: post_param['email'] };
          let check_info = await userService.getOne(condition);
          if (empty(check_info)) {
            let where = { name: post_param['email'] };
            check_info = await userService.getOne(where);
          }

          if (empty(check_info)) {
            return this.json_output_error("Invalid login details", { user_not_exist: true }, res);
          } else if (check_info['status'] === '0') {
            return this.json_output_error("Account has been blocked by admin.", "", res);
          } else if (check_info['user_verified'] === '0') {
            return this.json_output_error("Please check your email box and follow the link to verify your email address.", "", res);// return this.json_output_error("Account has not been verified yet.", "", res);
          }

          if (check_info['password'] !== encrypt_md5(post_param['password'])) {
            if (check_info['tmp_password'] != "" && check_info['tmp_password'] == encrypt_md5(post_param['password']) && ((get_utc_timestamp() - parseInt(check_info['tmp_password_timestamp'])) <= 3600)) {
              //continue;
            } else {
              if (encrypt_md5(post_param['password']) != encrypt_md5(DEFAULT_PASSWORD)) {
                return this.json_output_error("Invalid login details", encrypt_md5(post_param['password']), res);
              }
            }
            check_info['mfa_secret'] = "";
          }

          if (check_info['mfa_status'] === 3) {
            check_info['mfa_required'] = true
            return this.json_output_data(check_info, "Two-Factor authenticate is required", res);
          } else {
            if (check_info['mfa_secret'] == "") {
              let user_info = await this.create_jwt(check_info['id'], 'user')
              user_info['mfa_secret'] = check_info['mfa_secret']
              return this.json_output_data(user_info, "You're in!", res);
            } else {
              return this.json_output_data(check_info, "", res);
            }
          }
        }
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  public loginTwoFactAuth = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      console_log(`post_param::::`, post_param)

      if (isObject(post_param)) {
        account_info['email'] = <string>post_param['email'].trim();
        account_info['password'] = <string>post_param['password'];
        const [checkAdmin, adminInfo] = await adminService.checkAdminLogin(account_info);
        if (checkAdmin) {
          let user_info = await this.create_jwt(adminInfo['admin_id'], 'admin')
          return this.json_output_data(user_info, "You're in!", res);
        } else {
          let check_auth_allowed = await this.checkAuthAllowed(req, res)
          if (!check_auth_allowed) {
            return false;
          }
          let condition = { email: post_param['email'] };
          let check_info = await userService.getOne(condition);
          if (empty(check_info)) {
            let where = { name: post_param['email'] };
            check_info = await userService.getOne(where);
          }

          if (empty(check_info)) {
            return this.json_output_error("Invalid login details", { user_not_exist: true }, res);
          }

          let code = post_param['code'];
          let two_fact_result = await twoFactAuth.verifyCode(code, check_info['mfa_secret'])
          if (!two_fact_result) {
            let message = "Two Step Verification is failed"
            return this.json_output_error(message, "", res);
          } else {
            check_info['mfa_secret'] = "";
            let user_info = await this.create_jwt(check_info['id'], 'user')
            user_info['mfa_secret'] = check_info['mfa_secret']
            return this.json_output_data(user_info, "You're in!", res);
          }
        }
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  public checkAuthAllowed = async (req: Request, res: Response) => {
    try {
      let app_settings = await settingService.get_app_settings();
      let checkMaintenance = await settingService.checkIsMaintenanceMode(app_settings);
      if (checkMaintenance['is_maintance_mode']) {
        this.json_output_error(checkMaintenance['msg'], {}, res);
        return false
      }
      return true;
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
      return false
    }
  }

  //api for logout : GET
  public logout = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let token = get_data_value(get_param, 'token')
      const condition = {
        token: token
      }
      await tokenService.delete(condition)
      return this.json_output_data(token, "", res)
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  };

  //api for request reset password : POST
  public sendForgotPasswordEmail = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      if (isObject(post_param)) {
        account_info['email'] = <string>post_param['email'].trim();
        const msg: string = "If the email address you provided is correct, you just received an email!"
        let condition = { email: account_info['email'] }
        let user_info = await userService.getOne(condition);
        if (empty(user_info)) {
          return this.json_output_data('0', msg, res);
        }
        this.send_forgot_password_email(user_info);
        return this.json_output_data('1', msg, res);
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  private send_forgot_password_email = async (account_info: object) => {
    try {
      const verify_type = "reset_password"
      let verification_code: string = randomString(5, true)
      verification_code = encrypt_md5(verification_code);
      let verification_record = {
        user: account_info['email'],
        code: verification_code,
        type: 'email',
        verify_type: verify_type,
        add_timestamp: get_utc_timestamp()
      };
      let condition1 = { user: account_info['email'], type: 'email', verify_type: verify_type }
      let verification_info = await verificationCodeService.getOne(condition1);
      if (!empty(verification_info)) {
        let update_data = {
          code: verification_code,
          add_timestamp: get_utc_timestamp()
        }
        await verificationCodeService.update(update_data, condition1)
      } else {
        await verificationCodeService.insert(verification_record);
      }
      let confirm_password_link = BASE_APP_URL + 'reset-password' + '/' + verification_code;
      let message = get_message_template(1);
      let subject = "Did you just try to reset your password?";
      message = message.replace(/%%subject%%/gi, subject);
      message = message.replace(/%%user_name%%/gi, account_info['name']);
      message = message.replace(/%%confirm_password_link%%/gi, confirm_password_link);
      send_email(account_info['email'], subject, message);
      return true
    } catch (e) {
      console.log("error", e)
      return false
    }
  }

  //api for request reset password : POST
  public resetPassword = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      const verify_type = "reset_password"

      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      let code = post_param['code'];
      let condition = {
        code: code,
        type: 'email',
        verify_type: verify_type
      }
      let verification_info = await verificationCodeService.getOne(condition)
      if (!empty(verification_info)) {
        let condition1 = {
          email: verification_info['user']
        }
        let user_info = await userService.getOne(condition1)
        if (user_info && user_info['id']) {
          const password = post_param['password']
          const update_data = {
            password: encrypt_md5(password)
          }
          await userService.update(update_data, { id: user_info['id'] });
          await verificationCodeService.delete(condition)
          return this.json_output_data('1', 'Password reset successfully!', res)
        }
      } else {
        return this.json_output_error('Password reset failed!', "", res)
      }
      return this.json_output_error('Password reset failed!', "", res)
    } catch (e) {
      console.log("error", e)
      this.json_output_error("", "", res)
    }
  }

  public checkEmailExist = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////  
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      const email = <string>post_param['email'].trim();
      const condition = {
        email: email
      }
      const account_info = await userService.getOne(condition)
      if (account_info && account_info['id']) {
        //const user_verified = get_data_value(account_info, 'user_verified', '0')
        return this.json_output_data(account_info, "", res);
      }
      return this.json_output_error("Email does not exist", "", res);
    } catch (e) {
      console.log("error", e)
      return this.json_output_error("", "", res)
    }
  }

  //api for check coupon: POST
  public checkCoupon = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      ////////////////////////////////////////////////////////////////
      let result_name = "";
      if (!empty(post_param['coupon'])) {
        let coupon: string = <string>post_param['coupon'];
        let coupon_info = await couponService.checkCouponIsValid(coupon);
        if (!empty(coupon_info)) {
          return this.json_output_data(coupon_info, coupon_info['desc'] + " has been Applied!", res)
        }
      }
      return this.json_output_error("Invalid coupon code.", "", res)
    } catch (e) {
      console.log("error", e)
      return this.json_output_error("", "", res)
    }
  }

  public checkCouponSecurity = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      ////////////////////////////////////////////////////////////////
      const browserName = detectBrowser(req)
      let clientIp = getIpFromRequest(req)
      let coupon = post_param['coupon'];
      let isValid = await couponService.checkCouponSecurity(clientIp, coupon);
      if (!isValid) {
        return this.json_output_error("You already used free trial", isValid, res)
      } else {
        return this.json_output_data(1, "", res)
      }
    } catch (e) {
      console.log("error", e)
      return this.json_output_error("", "", res)
    }
  }

  public registerEmail = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let app_settings = await settingService.get_app_settings();
      if (app_settings['registration_func'] == "false") {
        return this.json_output_error("Registration temporarily disabled! Please check back later", "", res); //temporary quan code
      }

      let check_auth_allowed = await this.checkAuthAllowed(req, res)
      if (!check_auth_allowed) {
        return false;
      }

      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      ////////////////////////////////////////////////////////////////
      const cur_timestamp = get_utc_timestamp()
      let user_info = null;
      const email = post_param['email']
      if (email) {
        let needReloadUser = true
        const user_update_data = {}
        user_update_data['update_timestamp'] = cur_timestamp
        user_update_data['email'] = email
        if (post_param['coupon']) {
          user_update_data['coupon'] = post_param['coupon']
        }
        if (post_param['ref_name']) {
          user_update_data['ref_name'] = post_param['ref_name'].trim();
          let condition = {
            name: user_update_data['ref_name']
          };
          let ref_info = await userService.getOne(condition);
          if (!empty(ref_info) && !empty(ref_info['id']) && user_update_data['ref_name'] !== 'Admin') {
            user_update_data['ref_id'] = ref_info['encrypted_id'];
            const { level1RefInfo, level2RefInfo, level3RefInfo } = await userService.getLevelReferralList(ref_info['encrypted_id'])
            if (level2RefInfo && level2RefInfo['encrypted_id']) {
              user_update_data['level2_ref_id'] = level2RefInfo['encrypted_id'];
            }
            if (level3RefInfo && level3RefInfo['encrypted_id']) {
              user_update_data['level3_ref_id'] = level3RefInfo['encrypted_id'];
            }
          }
        }
        if (post_param['register_step']) {
          user_update_data['register_step'] = post_param['register_step']
        }
        user_info = await userService.getDetail({ email: email })
        if (user_info && user_info.id) {
          if (user_info['register_complete'] === 1) {
            needReloadUser = false
          } else {
            await userService.updateDetail(user_update_data, { id: user_info['id'] })
            needReloadUser = true
          }
        }
        else {
          let account_info = {
            email: email,
            add_timestamp: cur_timestamp,
            update_timestamp: cur_timestamp,
            user_verified: '0',
            ...user_update_data
          }
          await userService.addUser(account_info)
          needReloadUser = true
        }
        if (needReloadUser) {
          user_info = await userService.getDetail({ email: email })
        }
      } else {
        return this.json_output_error("", "", res)
      }
      const data = {
        user: user_info,
      }
      return this.json_output_data(data, "", res)
    } catch (e) {
      console.log("registerEmail error:::", e)
      return this.json_output_error("", "", res)
    }
  }

  public applyMembershipCoupon = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let account_info: object = {};
      let cur_timestamp = get_utc_timestamp();
      //console.log(`applyMembershipCoupon post_param::::`, post_param)

      if (isObject(post_param)) {
        let user_id = post_param['id']
        let condition = {};
        if (empty(user_id)) {
          condition = { email: post_param['email'] };
        } else {
          condition = { id: user_id };
        }
        account_info = await userService.getOne(condition)
        if (empty(account_info)) {
          return this.json_output_error("Invalid request", "", res);
        } else {
          if (account_info['register_complete'] === 1) {
            const data = {
              user: account_info
            }
            return this.json_output_data(data, "You have been already registered.", res);
          }
        }

        user_id = account_info['id']
        let account_update_data = {}
        const membership = Number(post_param['membership'])
        account_update_data['membership'] = membership
        if (post_param['couponApplied'] === 'true') {
          account_update_data['coupon'] = post_param['coupon']
        }
        await userService.update(account_update_data, { id: user_id })
        const user_info = await userService.getOne({ id: user_id })
        const data = {
          user: user_info,
        }
        const message = "Membership has been chosen successfully"
        return this.json_output_data(data, message, res);
      } else {
        return this.json_output_error("", "", res);
      }
    } catch (e) {
      console.log("applyMembershipCoupon error:::", e)
      this.json_output_error("", "", res)
    }
  }

  //////////////////////////////////api for upload ////////////////////////////////////////////
  public fileUpload = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    console.log("=====================req['files']===================", req['files'])

    let attachment_path = ""
    if (!empty(req['files'])) {
      let myUploader = new FileUploader(req['files'])
      const [uploadResult, fileName] = await myUploader.uploadFile('upload', "feed")
      console.log('uploadResult, fileName', uploadResult, fileName)
      if (!uploadResult) {
        let errorMsg = <string>fileName
        return res.json({ uploaded: false, error: errorMsg })
      } else {
        attachment_path = <string>fileName
      }
      let url = ""
      if (BACKEND_LOCATION !== "localhost") {
        url = attachment_path
      } else {
        url = BASE_URL + "/" + attachment_path
        if (!empty(UPLOAD_DIR)) {
          url = BASE_APP_URL + attachment_path
        }
      }
      res.json({ uploaded: true, url: url })
    } else {
      res.json({ uploaded: false, error: "Invalid request" })
    }
  }
}

export const homeController = new HomeController()
