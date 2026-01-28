import { Request, Response } from 'express'
import { console_log, empty, getIpFromRequest, get_data_value, get_message_template, get_utc_timestamp_ms, send_email, sleep } from '../../helpers/misc';
import UserBaseController from './user.base.controller';
import { settingService } from '../../services/setting.service';
import { BACKEND_LOCATION } from '../../var/env.config';
import { irisLib } from '../../library/irisLib';
import { businessService } from '../../services/business.service';
import { userService } from '../../services/user.service';
import { emailQueueService } from '../../services/email.queue.service';
import { paymentService } from '../../services/payment.service';
import { payquickerLib } from '../../library/payquickerLib';

export default class UserTestController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });

    if (BACKEND_LOCATION !== 'localhost') {
      let clientIp = getIpFromRequest(req)
      console_log("clientIp:::", clientIp)
      if (clientIp) {
        let app_settings = await settingService.get_app_settings();
        let dev_ip = app_settings['dev_ip']
        if (clientIp === dev_ip) {
          return true
        } else {
          this.json_output_error("Invalid request", { ip: clientIp }, res)
          return false
        }
      } else {
        this.json_output_error("Invalid request", "", res)
        return false
      }
    }

    return true // await this.checkLogin(req, res)
  }

  ///////////////////////////////////// starting apis //////////////////////////////////////////////
  public test_func = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let action = get_param['action']
    data['action'] = action
    if (action === 'test') {
      // for testing
    }
    else if (action === 'test_email_template') {
      //return await this.test_email_template(req, res);
    }
    else if (action === 'testIrisApi') {
      const [apiSuccess, apiRes] = await irisLib.getMerchantList()
      data['apiSuccess'] = apiSuccess
      data['apiRes'] = apiRes
    }
    else if (action === 'testIrisMerchantCreateApi') {
      console_log(`post_param:::`, JSON.stringify({ post_param: post_param }))
      const [apiSuccess, apiRes] = await irisLib.createUser(post_param)
      data['apiSuccess'] = apiSuccess
      data['apiRes'] = apiRes
    }
    else if (action === 'testGetMerchantDetail') {
      const merchantNumber = post_param['merchantNumber']
      const [apiSuccess, apiRes] = await irisLib.getMerchantDetail(merchantNumber, true)
      data['apiSuccess'] = apiSuccess
      data['apiRes'] = apiRes
    }
    else if (action === 'testGetProcessorList') {
      const [apiSuccess, apiRes] = await irisLib.getProcessorList()
      data['apiSuccess'] = apiSuccess
      data['apiRes'] = apiRes
    }
    else if (action === 'testGetResidualList') {
      const options = {
        processor_id: post_param['processor_id'],
        year: post_param['year'],
        month: post_param['month'],
        search: post_param['search'] ?? ""
      }
      const [apiSuccess, apiRes] = await irisLib.getResidualSummaryData(options)
      data['apiSuccess'] = apiSuccess
      data['apiRes'] = apiRes
    }
    else if (action === 'testGetResidualLineItems') {
      const options = {
        dba: post_param['dba'],
        year: post_param['year'],
        month: post_param['month'],
      }
      if (post_param['user_id']) {
        options['user_id'] = post_param['user_id']
      }
      const [apiSuccess, apiRes] = await irisLib.getResidualLineItems(options)
      data['apiSuccess'] = apiSuccess
      data['apiRes'] = apiRes
    }
    else if (action === 'testGetResidualReports') {
      const options = {
        processor_id: post_param['processor_id'], // 3
      }
      if (post_param['mid']) {
        options['mid'] = post_param['mid']
      }
      const apiRes = await irisLib.getResidualReports(options)
      data['apiRes'] = apiRes
    }
    else if (action === 'testGetLastResidualDataOfMerchantList') {
      const merchantId = post_param['merchantId']
      const apiRes = await businessService.getLastResidualDataOfMerchantList(merchantId)
      data['apiRes'] = apiRes
    }
    else if (action === 'testGetUserNextTierLevelPercentage') {
      const total_processing_volume = Number(get_param['total_processing_volume'])
      const apiRes = await userService.getUserNextTierLevelPercentage(total_processing_volume)
      data['get_param'] = get_param
      data['apiRes'] = apiRes
    }
    else if (action === 'testEmailTemplate') {
      const emails = get_param['email']
      const emailList = emails.split(',')
      const immediately = get_param['immediately'] == '1'
      for (let k in emailList) {
        const email = emailList[k].trim()
        if (get_param['template_id']) {
          const template_id = Number(get_param['template_id'])
          await emailQueueService.sendTestEmailTemplate(email, template_id, immediately)
        } else {
          const maxId = Number(get_param['max_id'])
          for (let j = 1; j <= maxId; j++) {
            const template_id = j
            await emailQueueService.sendTestEmailTemplate(email, template_id, immediately)
            await sleep(11 * 1000)
          }
        }
      }
      data['get_param'] = get_param
    }
    else if (action === 'testNmiPayment') {
      let params: object = {};
      params['membership'] = post_param['membership'] || 1;
      params['pay_sn'] = post_param['pay_sn'] || get_utc_timestamp_ms();

      params['cardName'] = post_param['cardName'];
      params['cardNumber'] = post_param['cardNumber'];
      params['exp_year'] = post_param['exp_year'];
      params['exp_month'] = post_param['exp_month'];
      params['cvv'] = post_param['cvv'];

      params['amount'] = post_param['amount'];
      params['client_ip'] = post_param['client_ip'] ?? "127.0.0.1";
      params['is_trial'] = post_param['is_trial'] ?? 0;
      params['description'] = post_param['description'] ?? "testCardPayment"
      params['payment_product'] = post_param['payment_product'] ?? "testProduct";

      params['user_id'] = 1;

      const [payment_status, payment_data] = await paymentService.charge_credit_card(params);
      data['payment_status'] = payment_status
      data['payment_data'] = payment_data
    }
    else if (action === 'testPayquickerGetClientAccessToken') {
      const accessToken = await payquickerLib.getClientAccessToken()
      data['accessToken'] = accessToken
    }
    else if (action === 'testPayquickerSendPayment') {
      const params = {
        amount: 1.02,
        fundingAccountPublicId: 'cf8cd2a975cf49969b0dac9a81f4dbad',
        userCompanyAssignedUniqueKey: '23453432423234234234234234234234233', //'demoUser01',
        userNotificationEmailAddress: 'jintong113@outlook.com',
        accountingId: 'demoUser234-00123460' // order number or invoice number
      }
      data['params'] = params;
      const paymentResult = await payquickerLib.sendPayments(params)
      data['paymentResult'] = paymentResult
    }
    else if (action === 'testPayquickerGetBalance') {
      const params = {
        userCompanyAssignedUniqueKey: '23453432423234234234234234234234233'
      }
      data['params'] = params;
      const balanceResult = await payquickerLib.getBalanceForUser(params)
      data['balanceResult'] = balanceResult
    }
    return this.json_output_data(data, "", res);
  }

}

export const userTestController = new UserTestController()
