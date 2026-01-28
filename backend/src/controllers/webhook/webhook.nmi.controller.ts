import { Request, Response } from 'express'
import { transactionService } from '../../services/transaction.service';
import { console_log, empty } from '../../helpers/misc';
import { loggerService } from '../../services/logger.service';
import WebhookBaseController from './webhook.base.controller';
import { NMI_SIGN_KEY } from '../../var/env.config';

export default class WebhookNmiController extends WebhookBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * this is webhook endpoint for nmi
   */  
  public hookReceived = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let headers = req.headers
    /**************************************************************************************************/
    await loggerService.info("nmi webhook params::: " + JSON.stringify({ NMI_SIGN_KEY: NMI_SIGN_KEY, get_param: get_param, post_param: post_param, headers: headers }), 'nmi')

    try {
      const event_type = post_param['event_type']
      const event_body = post_param['event_body']
      const params = {
        trans_id: event_body['transaction_id'],
        pay_sn: event_body['order_id']
      }

      let chargeIsSuccess = false;
      const actionData = event_body['action']
      if (event_type === "transaction.sale.success") {
        if (actionData['success'] == '1' || actionData['response_code'] == '100' || actionData['response_text'] == 'SUCCESS' || actionData['response_text'] == 'APPROVED') {
          chargeIsSuccess = true;
          await transactionService.update_transaction(params, 'success')
        }
      }

      if (!chargeIsSuccess) {
        if (event_type === "transaction.sale.failure" || event_type === "transaction.sale.unknown") {
          await transactionService.update_transaction(params, 'failed')
        }
      }
    } catch (e) {
      console_log("error, post_param::::", e, post_param)
    }

    return res.status(200).send("webhook is verified")
  }

}

export const webhookNmiController = new WebhookNmiController()
