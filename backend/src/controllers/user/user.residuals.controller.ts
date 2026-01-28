import { Request, Response } from 'express'
import * as Excel from 'exceljs-node';
import { BASE_BUSINESS_URL, BASE_FRONT_URL, BASE_PARTNER_URL } from '../../var/env.config';
import { console_log, copy_object, empty, get_api_sample_response, get_data_value } from '../../helpers/misc';
import { userService } from '../../services/user.service';
import { businessService } from '../../services/business.service';
import UserBaseController from './user.base.controller';
import { irisLib } from '../../library/irisLib';
import { residualService } from '../../services/residual.service';

export default class UserResidualsController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get page detail
   */
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
      let tmp_data = await get_api_sample_response('getResidualsPageDetail.json')
      if (tmp_data) {
        return res.json(tmp_data)
      }

      const params = {
        year: get_param['year'],
        month: get_param['month'],
        hide_null_merchants: get_param['hide_null_merchants'] ?? 0
      }
      data = await this.getPageDetailData(user, params)
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
    * get page detail data
    */
  public getPageDetailData = async (user, params, allData = false) => {
    try {
      const { year, month, hide_null_merchants } = params
      const data = {}
      const user_id = user['id']

      let processorResidualMonthSumReports = []

      const residualMonthSumReportsParams = {
        year: year,
        month: month,
        hide_null_merchants: hide_null_merchants,
        mid: ""
      }
      const [apiSuccess, apiRes] = await irisLib.getResidualSummaryData(residualMonthSumReportsParams)
      if (apiSuccess) {
        processorResidualMonthSumReports = apiRes?.data ?? []
      }
      const processorResidual = []
      for (let k in processorResidualMonthSumReports) {
        const processorSumReportsItem = processorResidualMonthSumReports[k]
        const processorMerchantItem = {}
        processorMerchantItem['sum'] = processorSumReportsItem
        if (allData) {
          const residualMonthReportsParams = {
            processor_id: processorSumReportsItem['processor_id'],
            year: year,
            month: month,
            hide_null_merchants: hide_null_merchants,
            mid: ""
          }
          let residualMonthReports = []
          const [apiSuccess, apiRes] = await irisLib.getResidualSummaryWithMerchantRows(residualMonthReportsParams)
          if (apiSuccess) {
            residualMonthReports = apiRes?.data ?? []
          }
          processorMerchantItem['residualMonthReports'] = residualMonthReports
        }
        processorResidual.push(processorMerchantItem)
      }
      data['processorResidual'] = processorResidual

      data['user'] = user;
      return data
    } catch (e) {
      console.log("error::::", e)
      return {}
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

      let filename = "Residual_Report(All).xlsx";
      let workbook = new Excel.Workbook();

      const params = {
        ...post_param
      }
      let pageData = await this.getPageDetailData(user, params, true);
      const processorResidual = pageData['processorResidual']
      for (let k in processorResidual) {
        const processorResidualData = processorResidual[k]
        const sumRow = processorResidualData['sum']
        const residualMonthReports = processorResidualData['residualMonthReports']
        let excel_data = [...residualMonthReports]
        let worksheet = workbook.addWorksheet(`${sumRow['name']}`);
        worksheet.columns = [
          { header: `Merchant/Individual`, key: "merchant", width: 30 },
          { header: `Txn #`, key: "transactions", width: 20 },
          { header: `Sales Amount`, key: "sales_amount", width: 20 },
          { header: `Income`, key: "income", width: 20 },
          { header: `Expense`, key: "expense", width: 20 },
          { header: `Net`, key: "net", width: 20 },
          { header: `BPS`, key: "bps", width: 20 },
          { header: `Percentage`, key: "percentage", width: 20 },
          { header: `Agent Net`, key: "agent_net", width: 20 }
        ]
        let rows = copy_object(excel_data);

        // Add Array Rows
        worksheet.addRows(rows);
      }

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

  /**
   * get processor residual
   */
  public getProcessorResidual = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let tmp_data = await get_api_sample_response('getProcessorResidual.json')
      if (tmp_data) {
        return res.json(tmp_data)
      }

      const processor_id = get_param['processor_id']

      const params = {
        year: get_param['year'],
        month: get_param['month'],
        search: get_data_value(get_param, 'search'),
        processor_id: processor_id,
        hide_null_merchants: get_param['hide_null_merchants'] ?? 0
      }
      data = await this.getProcessorResidualData(user, params)
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
  * get processor residual data
  */
  public getProcessorResidualData = async (user, params) => {
    try {
      const data = await residualService.getUserResidualData(user, params)
      data['user'] = user;
      return data
    } catch (e) {
      console.log("error::::", e)
      return {}
    }
  }

  /// api for export process residual data
  public exportProcessorResidualData = async (req: Request, res: Response) => {
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let token = get_data_value(post_param, 'token')

      let user = await this.checkLoginToken(token)
      if (empty(user)) {
        res.status(200).end();
        return false
      }

      const params = {
        ...post_param
      }
      let pageData = await this.getProcessorResidualData(user, params);

      const processorResidualData = pageData['processorResidualData']
      const sumRow = processorResidualData['sum']
      const residualMonthReports = processorResidualData['residualMonthReports']
      let excel_data = [...residualMonthReports]
      console.log(`excel_data:::::`, excel_data)

      let filename = "Residual_Report.xlsx";

      let workbook = new Excel.Workbook();
      //workbook.creator = 'Me';
      let worksheet = workbook.addWorksheet(`${sumRow['name']}`);
      worksheet.columns = [
        { header: `Merchant/Individual`, key: "merchant", width: 30 },
        { header: `Txn #`, key: "transactions", width: 20 },
        { header: `Sales Amount`, key: "sales_amount", width: 20 },
        { header: `Income`, key: "income", width: 20 },
        { header: `Expense`, key: "expense", width: 20 },
        { header: `Net`, key: "net", width: 20 },
        { header: `BPS`, key: "bps", width: 20 },
        { header: `Percentage`, key: "percentage", width: 20 },
        { header: `Agent Net`, key: "agent_net", width: 20 }
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

  /**
   * getMerchantResidualProfitDetail
   */
  public getMerchantResidualProfitDetail = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let tmp_data = await get_api_sample_response('getMerchantResidualProfitDetail.json')
      if (tmp_data) {
        return res.json(tmp_data)
      }

      const processor_id = get_param['processor_id']
      const mid = get_param['mid']
      const params = {
        mid: mid,
        processor_id: processor_id,
      }
      data['residual_profit_data'] = await businessService.getMerchantResidualProfitDetail(params)
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

}

export const userResidualsController = new UserResidualsController()
