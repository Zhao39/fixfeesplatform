import { is_null } from "../helpers/misc";
import { TB_USER_KYC_DOCS } from "../var/tables";
import { BaseService } from "./base.service";
import { fileUploader } from "../library/fileuploader";
import { userService } from "./user.service";
import { KYC_STATUS } from "../var/config";

export default class UserKycDocService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_USER_KYC_DOCS;
  }

  /**
   * check if user's kyc data has been changed
   */  
  public checkKycChanged = async (updated_data, row) => {
    try {
      for(let k in updated_data) {
        if(updated_data[k] !== row[k]){
          return true
        }
      }
      return false
    } catch (e) {
      console.log(`UserKycDocService checkKycChanged error:::`, e)
      return false
    }
  }

  /**
   * submit user's kyc doc
   */  
  public submitDoc = async (info, user_id) => {
    try {
      const condition = {
        user_id: user_id
      }
      const row = await this.getOne(condition)
      if (row && row.id) {
        if (row['passport'] && !is_null(info['passport'])) {
          await fileUploader.deleteFile(row['passport'])
        }
        if (row['id_card_front'] && !is_null(info['id_card_front'])) {
          await fileUploader.deleteFile(row['id_card_front'])
        }
        if (row['id_card_back'] && !is_null(info['id_card_back'])) {
          await fileUploader.deleteFile(row['id_card_back'])
        }
        if (row['w9'] && !is_null(info['w9'])) {
          await fileUploader.deleteFile(row['w9'])
        }
        if (row['w8_ben'] && !is_null(info['w8_ben'])) {
          await fileUploader.deleteFile(row['w8_ben'])
        }
        const update_data = {
          ...info
        }
        await this.update(update_data, condition)
        const kycChanged = await this.checkKycChanged(update_data, row)
        if(kycChanged) {
          await this.updateKycStatus(user_id, KYC_STATUS.NOT_VERIVIED)
          return true
        }else{
          return false
        }
      } else {
        const insert_data = {
          ...info,
          user_id: user_id
        }
        await this.insert(insert_data)
        await this.updateKycStatus(user_id, KYC_STATUS.NOT_VERIVIED)
        return true
      }
    } catch (e) {
      console.log(`UserKycDocService submitDoc error:::`, e)
    }
  }

  /**
   * get user kyc doc
   */  
  public getUserKycDoc = async (user_id) => {
    try {
      const condition = {
        user_id: user_id
      }
      const row = await this.getOne(condition)
      if (row && row.id) {
        if (row['passport']) {
          row['passport'] = fileUploader.getFileUrl(row['passport'])
        }
        if (row['id_card_front']) {
          row['id_card_front'] = fileUploader.getFileUrl(row['id_card_front'])
        }
        if (row['id_card_back']) {
          row['id_card_back'] = fileUploader.getFileUrl(row['id_card_back'])
        }
        if (row['w9']) {
          row['w9'] = fileUploader.getFileUrl(row['w9'])
        }
        if (row['w8_ben']) {
          row['w8_ben'] = fileUploader.getFileUrl(row['w8_ben'])
        }
        return row
      } else {
        return {}
      }
    } catch (e) {
      console.log(`UserKycDocService getUserKycDoc error:::`, e)
    }
  }

  /**
   * update user kyc status
   */  
  public updateKycStatus = async (user_id, kyc_status) => {
    try {
      const condition = {
        id: user_id
      }
      const update_data = {
        kyc_status: kyc_status
      }
      await userService.update(update_data, condition)
      const userUpdated = userService.getOne(condition)
      return userUpdated
    } catch (e) {
      console.log(`UserKycDocService updateKycStatus error:::`, e)
    }
  }
}

export const userKycDocService = new UserKycDocService();
