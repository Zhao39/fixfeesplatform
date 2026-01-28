import { Request, Response } from 'express'
import { console_log, empty, get_data_value } from '../../helpers/misc';
import UserBaseController from './user.base.controller';
import FileUploader from '../../library/fileuploader';
import { userKycDocService } from '../../services/user.kyc.doc.service';
import { userService } from '../../services/user.service';

export default class UserKycDocController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get user key page detail
   */
  public getPageDetail = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /********************************************************************************************/
      const userKycDoc = await userKycDocService.getUserKycDoc(user['id'])
      data['userKycDoc'] = userKycDoc
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log(`e:::::`, e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * submit kyc document
   */
  public submit = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /********************************************************************************************/
      //console.log(`post_param:::`, post_param)
      let id_type = get_data_value(post_param, 'id_type')
      const update_data = {
        id_type: id_type
      }

      let deleted_fields = get_data_value(post_param, 'deleted_fields');
      if (deleted_fields) {
        let deleted_fields_arr = JSON.parse(deleted_fields)
        for (let k in deleted_fields_arr) {
          const field_name = deleted_fields_arr[k]
          const fileField = `${field_name}`
          const fileName = `${field_name}_name`
          update_data[fileField] = ""
          update_data[fileName] = ""
        }
      }

      if (!empty(req['files'])) {
        const files = req['files']
        let myUploader = new FileUploader(files)
        console_log("=================req['files']=================", files)

        if (files['passport']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('passport', `kyc/${user['id']}`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            update_data['passport'] = attachment_path
            update_data['passport_name'] = fileNameOriginal
          }
        }
        if (files['id_card_front']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('id_card_front', `kyc/${user['id']}`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            update_data['id_card_front'] = attachment_path
            update_data['id_card_front_name'] = fileNameOriginal
          }
        }
        if (files['id_card_back']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('id_card_back', `kyc/${user['id']}`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            update_data['id_card_back'] = attachment_path
            update_data['id_card_back_name'] = fileNameOriginal
          }
        }
        if (files['w9']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('w9', `kyc/${user['id']}`, 's3')
          console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            update_data['w9'] = attachment_path
            update_data['w9_name'] = fileNameOriginal
          }
        }
        if (files['w8_ben']) {
          let attachment_path = "";
          let [uploadResult, fileName, fileNameOriginal] = await myUploader.uploadFile('w8_ben', `kyc/${user['id']}`, 's3')
          //console_log('uploadResult, fileName', uploadResult, fileName, fileNameOriginal)
          if (uploadResult) {
            attachment_path = <string>fileName
            update_data['w8_ben'] = attachment_path
            update_data['w8_ben_name'] = fileNameOriginal
          }
        }
      }

      console_log(`update_data`, update_data)
      const kycChanged = await userKycDocService.submitDoc(update_data, user['id'])
      data['kycChanged'] = kycChanged
      let msg = ""
      if (kycChanged) {
        msg = "Your KYC is beeing verified."
      }
      await userService.update({ locked: 0 }, { id: user['id'] })

      const userKycDoc = await userKycDocService.getUserKycDoc(user['id'])
      data['userKycDoc'] = userKycDoc
      const userUpdated = await userService.getOne({ id: user['id'] })
      data['user'] = userUpdated
      return this.json_output_data(data, msg, res);
    } catch (e) {
      console.log(`e:::::`, e)
      return this.json_output_error("", "", res)
    }
  }

}

export const userKycDocController = new UserKycDocController()
