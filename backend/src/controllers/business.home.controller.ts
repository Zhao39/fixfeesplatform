import { console_log } from './../helpers/misc';
import { Request, Response } from 'express'
import { checkPasswordStrenth, empty, encrypt_md5, get_data_value, get_message_template, get_utc_timestamp, randomString, send_email, trim_phone } from '../helpers/misc';
import { isObject } from 'lodash';
import * as jwt from "jsonwebtoken";
import { settingService } from '../services/setting.service';
import BaseController from './base.controller';
import { BACKEND_LOCATION, BASE_APP_URL, BASE_URL, UPLOAD_DIR } from '../var/env.config';
import { DEFAULT_PASSWORD, ENVIRONMENT, JWT_SECRET } from '../var/config';
import { verificationCodeService } from '../services/verification.code.service';
import { tokenService } from '../services/token.service';
import { adminService } from '../services/admin.service';
import { twoFactAuth } from '../library/twoFactAuth';
import FileUploader from '../library/fileuploader';
import { businessService } from '../services/business.service';
import { businessAdminService } from '../services/business.admin.service';
import { userService } from '../services/user.service';

export default class BusinessHomeController extends BaseController {
  public environment = ENVIRONMENT.BUSINESS

  constructor() {
    super();
  }

  public init = (req: Request, res: Response): void => {
    this.setReqRes({ req: req, res: res });
  }

  /**
   * register business
   */
  public register = async (req: Request, res: Response) => { // register with business
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      const client_ip = this.get_ip(req);
      console_log(`post_param::::`, JSON.stringify(post_param))
      const business_info = JSON.parse(get_data_value(post_param, 'business_info'))
      const data = {}
      const info = {
        name: get_data_value(business_info, 'name'),
        password: get_data_value(business_info, 'password'),
        business_dba: get_data_value(business_info, 'business_dba'),
        business_legal_name: get_data_value(business_info, 'business_legal_name'),
        business_contact_first_name: get_data_value(business_info, 'business_contact_first_name'),
        business_contact_last_name: get_data_value(business_info, 'business_contact_last_name'),
        business_address: get_data_value(business_info, 'business_address'),
        business_city: get_data_value(business_info, 'business_city'),
        business_state: get_data_value(business_info, 'business_state'),
        business_zip: get_data_value(business_info, 'business_zip'),
        business_phone: trim_phone(get_data_value(business_info, 'business_phone')),
        business_email: get_data_value(business_info, 'business_email'),
        business_website: get_data_value(business_info, 'business_website'),
        business_start_date: get_data_value(business_info, 'business_start_date'),
        business_federal_tax_id: get_data_value(business_info, 'business_federal_tax_id'),
        business_entity_type: get_data_value(business_info, 'business_entity_type'),
        bank_name: get_data_value(business_info, 'bank_name'),
        bank_routing: get_data_value(business_info, 'bank_routing'),
        bank_account: get_data_value(business_info, 'bank_account'),
        product_sold: get_data_value(business_info, 'product_sold'),
        annual_business_revenue: get_data_value(business_info, 'annual_business_revenue'),
        monthly_credit_card_volumn: get_data_value(business_info, 'monthly_credit_card_volumn'),
        average_transaction: get_data_value(business_info, 'average_transaction'),
        max_transaction: get_data_value(business_info, 'max_transaction'),
      }

      if (business_info['ref_name']) {
        business_info['ref_name'] = business_info['ref_name'].trim();
        let condition = {
          name: business_info['ref_name']
        };
        let ref_info = await userService.getOne(condition)
        console_log(`ref_info:::`, ref_info)
        if (!empty(ref_info) && !empty(ref_info['id']) && business_info['ref_name'] !== 'Admin') {
          info['ref_id'] = ref_info['encrypted_id'];
          info['ref_name'] = ref_info['name'];
          const { level1RefInfo, level2RefInfo, level3RefInfo } = await userService.getLevelReferralList(ref_info['encrypted_id'])
          if (level2RefInfo && level2RefInfo['encrypted_id']) {
            info['level2_ref_id'] = level2RefInfo['encrypted_id'];
          }
          if (level3RefInfo && level3RefInfo['encrypted_id']) {
            info['level3_ref_id'] = level3RefInfo['encrypted_id'];
          }
        }
      }

      if (empty(info['name'])) {
        return this.json_output_error("Username is required", "", res)
      }
      if (empty(info['password'])) {
        return this.json_output_error("Password is required", "", res)
      }
      const [checkPasswordResult, checkPasswordMessage] = checkPasswordStrenth(info['password'])
      if (!checkPasswordResult) {
        return this.json_output_error(checkPasswordMessage, "", res)
      }
      info['password'] = encrypt_md5(info['password'])

      if (!empty(req['files'])) {
        const files = req['files']
        let myUploader = new FileUploader(files)
        //console_log("=================req['files']=================", files)
        if (files['business_statement']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('business_statement', `business`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            info['business_statement'] = attachment_path
            //info['business_statement_name'] = fileNameOriginal
          }
        }
        if (files['business_statement_1']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('business_statement_1', `business`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            info['business_statement_1'] = attachment_path
            //info['business_statement_name'] = fileNameOriginal
          }
        }
        if (files['business_statement_2']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('business_statement_2', `business`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            info['business_statement_2'] = attachment_path
            //info['business_statement_name'] = fileNameOriginal
          }
        }
        if (files['financial_statement']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('financial_statement', `business`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            info['financial_statement'] = attachment_path
            //info['business_statement_name'] = fileNameOriginal
          }
        }
        if (files['financial_statement_1']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('financial_statement_1', `business`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            info['financial_statement_1'] = attachment_path
            //info['business_statement_name'] = fileNameOriginal
          }
        }
        if (files['financial_statement_2']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('financial_statement_2', `business`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            info['financial_statement_2'] = attachment_path
            //info['business_statement_name'] = fileNameOriginal
          }
        }
      }
      const owner_list = get_data_value(business_info, 'owner_list')
      console_log(`info, owner_list::::`, info, owner_list)
      const [apiSuccess, apiRes] = await businessService.addBusiness(info, owner_list)
      data['apiSuccess'] = apiSuccess
      data['apiRes'] = apiRes

      if (!apiSuccess) {
        let msg = "Registration failed, please try later!"
        if (apiRes?.message && typeof apiRes?.message === 'string') {
          msg = apiRes?.message
        }
        this.json_output_error(msg, "", res)
        return false
      }

      return this.json_output_data(data, "Registration was successful!", res);
    } catch (e) {
      console.log("businessRegister error:::", e)
      this.json_output_error("", "", res)
    }
  }

  /**
   * create a jwt token
   */
  private create_jwt = async (user_id: string | number, user_type: string = "business") => {
    try {
      let user_info: object;
      if (user_type == 'business_admin') {
        let condition = {
          admin_id: user_id
        }
        user_info = await businessAdminService.getOne(condition)
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
        user_info = await businessService.getDetail(condition)
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

  /**
   * check if auth function is allowed
   */
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
      console.log("checkAuthAllowed error:::", e)
      this.json_output_error("", "", res)
      return false
    }
  }

  /**
   * login endpoint
   */
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
        const [checkAdmin, adminInfo] = await businessAdminService.checkAdminLogin(account_info);
        console_log(`checkAdmin, adminInfo`, checkAdmin, adminInfo)
        if (checkAdmin) {
          let user_info = await this.create_jwt(adminInfo['admin_id'], 'business_admin')
          return this.json_output_data(user_info, "You're in!", res);
        } else {
          let check_auth_allowed = await this.checkAuthAllowed(req, res)
          if (!check_auth_allowed) {
            return false;
          }
          let condition = { name: post_param['email'] };
          let check_info = await businessService.getOne(condition);
          console.log(`condition, check_info:::`, condition, check_info)
          if (empty(check_info)) {
            let where = { business_email: post_param['email'] };
            check_info = await businessService.getOne(where);
            console.log(`where, check_info:::`, where, check_info)
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

          let user_info = await this.create_jwt(check_info['id'], 'business')
          user_info['mfa_secret'] = check_info['mfa_secret']
          return this.json_output_data(user_info, "You're in!", res);
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
          let user_info = await this.create_jwt(adminInfo['admin_id'], 'business_admin')
          return this.json_output_data(user_info, "You're in!", res);
        } else {
          let check_auth_allowed = await this.checkAuthAllowed(req, res)
          if (!check_auth_allowed) {
            return false;
          }
          let condition = { email: post_param['email'] };
          let check_info = await businessService.getOne(condition);
          if (empty(check_info)) {
            let where = { name: post_param['email'] };
            check_info = await businessService.getOne(where);
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
            let user_info = await this.create_jwt(check_info['id'], 'business')
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
  }

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
        let condition = { business_email: account_info['email'] }
        let user_info = await businessService.getOne(condition);
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

  /**
   * send a forgot password email
   */
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
      let confirm_password_link = BASE_APP_URL + 'business-reset-password' + '/' + verification_code;
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
          business_email: verification_info['user']
        }
        let user_info = await businessService.getOne(condition1)
        if (user_info && user_info['id']) {
          const password = post_param['password']
          const update_data = {
            password: encrypt_md5(password)
          }
          await businessService.update(update_data, { id: user_info['id'] });
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

export const businessHomeController = new BusinessHomeController()
