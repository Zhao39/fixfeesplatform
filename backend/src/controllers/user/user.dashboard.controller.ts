import { Request, Response } from 'express'
import { BASE_BUSINESS_URL, BASE_FRONT_URL, BASE_PARTNER_URL } from '../../var/env.config';
import { empty, get_api_sample_response, get_data_value } from '../../helpers/misc';
import { userService } from '../../services/user.service';
import { businessService } from '../../services/business.service';
import UserBaseController from './user.base.controller';
import { TB_BUSINESS, TB_USER } from '../../var/tables';
import { BRAND_PARTNER_STATUS, MERCHANT_STATUS } from '../../var/config';

export default class UserDashboardController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get dashboard page detail
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
      let ref_id = user['ref_id']
      if (!empty(ref_id)) {
        let ref_info = await userService.getDetail({ encrypted_id: ref_id })
        if (ref_info && !empty(ref_info)) {
          data['ref_info'] = ref_info
        }
      }

      data['base_business_url'] = BASE_BUSINESS_URL
      data['base_partner_url'] = BASE_PARTNER_URL

      let business_ref_url = `${BASE_BUSINESS_URL}register?ref=${encodeURIComponent(user['name'])}`
      data['business_ref_url'] = business_ref_url
      let partner_ref_url = `${BASE_PARTNER_URL}register?ref=${encodeURIComponent(user['name'])}`
      data['partner_ref_url'] = partner_ref_url
      data['ref_name'] = `${encodeURIComponent(user['name'])}`
      const overrideRank = await userService.getUserOverrideRank(user_id)
      data['overrideRank'] = overrideRank
      const userTotalReferralVolumnData = await userService.getUserTotalReferralVolumnData(user_id)
      const totalReferralAdjustedNet = userTotalReferralVolumnData['total_adjusted_net']
      data['totalReferralAdjustedNet'] = totalReferralAdjustedNet
      const totalReferralProcessingVolume = userTotalReferralVolumnData['total_processing_volume']
      data['totalReferralProcessingVolume'] = totalReferralProcessingVolume
      const tierLevel = await userService.getUserTierLevel(totalReferralProcessingVolume)
      data['tierLevel'] = tierLevel

      data['user'] = user;

      let partners = await userService.getUserPartnerCount(user)
      data['partners'] = partners
      let merchants = await userService.getUserMerchantCount(user)
      data['merchants'] = merchants
      console.log(`partners,merchants:::`, partners, merchants)
      data['wallet'] = user['balance']
      data['tier_progress'] = 0
      data['status_progress'] = 0

      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
  * get Top Performance Data
  */
  public getTopPerformanceData = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/

      let tmp_data = await get_api_sample_response('getTopPerformanceData.json')
      if (tmp_data) {
        return res.json(tmp_data)
      }

      const user_id = user['id']
      const dateOption = get_data_value(get_param, 'dateOption', 'today')
      const userBusinessList = await businessService.getMerchantPerformanceData(user, dateOption)
      data['userBusinessList'] = userBusinessList

      data['user'] = user;
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }
}

export const userDashboardController = new UserDashboardController()
