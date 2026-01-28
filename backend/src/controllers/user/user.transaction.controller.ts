import { Request, Response } from 'express'
import { console_log, empty, get_data_value, intval } from '../../helpers/misc';
import UserBaseController from './user.base.controller';
import { transactionService } from '../../services/transaction.service';
import { TRAINING_TYPE } from '../../var/config';
import { pdfCreator } from '../../library/pdfcreator';
import { userService } from '../../services/user.service';
import { getUnixtimestampFromIsoString, getUnixtimestampFromLocalString, getUnixtimestampFromUtcString } from '../../helpers/utils';

export default class UserTransactionController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get training video list for data table
   */
  public getDataList = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      // const training_type = get_data_value(get_param, 'training_type', TRAINING_TYPE.MERCHANT)
      let trans_list = await transactionService.getUserAllPaymentList(get_param, user)

      if (trans_list === false || empty(trans_list)) {
        get_param['page'] = 1;
        get_param['limit'] = 1
        trans_list = await transactionService.getUserFakePaymentHistory(get_param, user)
      }
      data['page'] = get_param['page'];
      data['limit'] = get_param['limit'];
      data['total'] = trans_list === false ? 0 : trans_list.length;
      data['data'] = trans_list;

      return res.json(data)

    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  public downloadInvoice = async (req: Request, res: Response) => {
    const fs = require('fs');
    const path = require('path');

    let post_param: object = req['fields'];
    let get_param: object = req['query'];


    /**************************************************************************************************/
    let id = get_data_value(post_param, 'id')
    let payment_date = get_data_value(post_param, 'payment_date')

    let item = await transactionService.getOne({ id: id })


    let trans_id = item['trans_id'];
    let trans_id_obj = trans_id.split('_')
    let trans_number = trans_id_obj[trans_id_obj.length - 1];

    let trans_id_str = ""
    if (item['description'].indexOf("purchase_license") > -1) {
      trans_id_str = "Fix My Fees Brand Partner License";
    } else if (trans_id.indexOf("Purchase memebership") > -1) {
      trans_id_str = "Fix My Fees Brand Partner License";
    } else {
      trans_id_str = "Fix My Fees Brand Partner License";
    }
    item['invoice_number'] = trans_number;
    item['trans_type'] = trans_id_str;
    item['payment_date'] = payment_date;

    let user_info = await userService.getOne({ id: item['user_id'] })
    item['user_info'] = user_info;

    let [pdf_path, pdf_file_name] = await pdfCreator.create_invoice_pdf(item);

    setTimeout(function () {

      // res is a Stream object
      res.setHeader(
        "Content-Type",
        "application/pdf"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + pdf_file_name
      );
      var file = pdf_path // path.join(__dirname, pdf_path);
      //console_log('------file---------', file);

      const file_data = fs.readFileSync(file)
      //console_log('file_data', file_data)
      res.send(file_data);
    }, 500)
  }
}

export const userTransactionController = new UserTransactionController()
