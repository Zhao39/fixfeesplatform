import { Request, Response } from 'express'
import { console_log, empty, get_data_value } from '../../helpers/misc';
import FileUploader from '../../library/fileuploader';
import BusinessBaseController from './business.base.controller';
import { businessService } from '../../services/business.service';

export default class BusinessDashboardController extends BusinessBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get business dashboard page data
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
      const user_id = user['id']

      data['user'] = user;
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * upload business document
   */
  public uploadBusinessDoc = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      const client_ip = this.get_ip(req);
      console_log(`post_param::::`, JSON.stringify(post_param))
      const business_info = JSON.parse(get_data_value(post_param, 'business_info'))
      const id = business_info['id']
      const data = {}
      const update_data = {}

      if (!empty(req['files'])) {
        const files = req['files']
        let myUploader = new FileUploader(files)
        // console_log("=================req['files']=================", files)
        if (files['business_statement']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('business_statement', `business`, 's3')
          console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            update_data['upload_require_file'] = attachment_path
          } else {
            const msg = fileName
            return this.json_output_error(msg, data, res)
          }
        }
      }
      console_log(`update_data:::`, update_data)
      if (Object.keys(update_data).length > 0) {
        await businessService.update(update_data, { id: id })
      }
      const info = await businessService.getDetail({ id: id })
      data['info'] = info
      return this.json_output_data(data, "Uploaded successfully!", res);
    } catch (e) {
      console.log("businessRegister error:::", e)
      this.json_output_error("", "", res)
    }
  }

}

export const businessDashboardController = new BusinessDashboardController()
