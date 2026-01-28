import { Request, Response } from 'express'
import * as Excel from 'exceljs-node';
import { BASE_BUSINESS_URL, BASE_FRONT_URL, BASE_PARTNER_URL } from '../../var/env.config';
import { copy_object, empty, get_api_sample_response, get_data_value } from '../../helpers/misc';
import { userService } from '../../services/user.service';
import { businessService } from '../../services/business.service';
import UserBaseController from './user.base.controller';
import { TB_BUSINESS, TB_USER } from '../../var/tables';
import { RANK_TYPE_TEXT, TIER_TYPE, TIER_TYPE_TEXT } from '../../var/config';

export default class UserRankStatsController extends UserBaseController {
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
      const dateOption = get_data_value(get_param, 'dateOption')
      const options = {
        dateOption: dateOption
      }
      data = await this.getPageDetailData(user, options)
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
    * get page detail data
    */
  public getPageDetailData = async (user, options) => {
    try {
      const dateOption = get_data_value(options, 'dateOption')

      const data = {}
      const user_id = user['id']
      let ref_id = user['ref_id']
      if (!empty(ref_id)) {
        let ref_info = await userService.getDetail({ encrypted_id: ref_id })
        if (ref_info && !empty(ref_info)) {
          data['ref_info'] = ref_info
        }
      }
      const overrideRank = await userService.getUserOverrideRank(user_id, dateOption)
      data['overrideRank'] = overrideRank
      data['overrideRankText'] = get_data_value(RANK_TYPE_TEXT, overrideRank)
      const nextOverrideRank = await userService.getUserNextOverrideRank(overrideRank)
      data['nextOverrideRank'] = nextOverrideRank
      data['nextOverrideRankText'] = nextOverrideRank ? RANK_TYPE_TEXT[nextOverrideRank] : ""
      const userTotalReferralVolumnData = await userService.getUserTotalReferralVolumnData(user_id, dateOption)
      const totalReferralAdjustedNet = userTotalReferralVolumnData['total_adjusted_net']
      data['totalReferralAdjustedNet'] = totalReferralAdjustedNet
      const totalReferralProcessingVolume = userTotalReferralVolumnData['total_processing_volume']
      data['totalReferralProcessingVolume'] = totalReferralProcessingVolume
      const tierLevel = await userService.getUserTierLevel(totalReferralProcessingVolume)
      data['tierLevel'] = tierLevel
      data['tierLevelText'] = get_data_value(TIER_TYPE_TEXT, tierLevel)
      const nextTierLevel = await userService.getUserNextTierLevel(tierLevel)
      data['nextTierLevel'] = nextTierLevel
      data['nextTierLevelText'] = nextTierLevel ? TIER_TYPE_TEXT[nextTierLevel] : ""
      const tierNextProgress = await userService.getUserNextTierLevelPercentage(totalReferralProcessingVolume)
      data['tier_next_progress'] = tierNextProgress
      // console.log(`totalReferralProcessingVolume,tierNextProgress::::`, totalReferralProcessingVolume, tierNextProgress)
      const level1ActiveMerchantCount = await businessService.getLevel1ActiveMerchantCount(user['encrypted_id'], dateOption)
      data['level1ActiveMerchantCount'] = level1ActiveMerchantCount
      const level2ActiveMerchantCount = await businessService.getLevel2ActiveMerchantCount(user['encrypted_id'], dateOption)
      data['level2ActiveMerchantCount'] = level2ActiveMerchantCount
      const level3ActiveMerchantCount = await businessService.getLevel3ActiveMerchantCount(user['encrypted_id'], dateOption)
      data['level3ActiveMerchantCount'] = level3ActiveMerchantCount
      //////////////////////////////////////////////////////////////////////////////////////////////////////////
      const level1ReferralPartnerCount = await userService.getUserLevel1ReferralPartnerCount(user['encrypted_id'], dateOption)
      data['level1ReferralPartnerCount'] = level1ReferralPartnerCount
      const level2ReferralPartnerCount = await userService.getUserLevel2ReferralPartnerCount(user['encrypted_id'], dateOption)
      data['level2ReferralPartnerCount'] = level2ReferralPartnerCount
      const userStatusNextLevelPercentage = await userService.getUserNextLevelPercentage(level1ReferralPartnerCount)
      data['status_next_progress'] = userStatusNextLevelPercentage

      const level1MerchantVolumn = await businessService.getLevel1MerchantVolumn(user['encrypted_id'], dateOption)
      data['level1MerchantVolumn'] = level1MerchantVolumn
      const level2MerchantVolumn = await businessService.getLevel2MerchantVolumn(user['encrypted_id'], dateOption)
      data['level2MerchantVolumn'] = level2MerchantVolumn

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

      const dateOption = get_data_value(post_param, 'dateOption')
      const options = {
        dateOption: dateOption
      }
      let pageData = await this.getPageDetailData(user, options);

      let excel_data = [pageData]
      console.log(`excel_data:::::`, excel_data)
      let filename = "Rank_Stats_Report.xlsx";

      let workbook = new Excel.Workbook();
      //workbook.creator = 'Me';
      let worksheet = workbook.addWorksheet("Rank Stats Report");
      worksheet.columns = [
        { header: `Percentage to ${pageData['nextTierLevelText']}`, key: "tier_next_progress", width: 20 },
        { header: `Your Current Tier`, key: "tierLevelText", width: 20 },
        { header: `Override Status`, key: "overrideRankText", width: 20 },
        { header: `Percentage to ${pageData['nextOverrideRankText']}`, key: "status_next_progress", width: 20 },

        { header: `Total Net Earnings`, key: "totalReferralAdjustedNet", width: 20 },
        { header: `Total Active Merchants (Level 1)`, key: "level1ActiveMerchantCount", width: 20 },
        { header: `Total Active Merchants (Level 2)`, key: "level2ActiveMerchantCount", width: 20 },
        { header: `Total Active Merchants (Level 3)`, key: "level3ActiveMerchantCount", width: 20 },
        { header: `Level 1 Volume (Tier Pay Level)`, key: "level1MerchantVolumn", width: 20 },
        { header: `Level 2 Volume (Status Pay Level)`, key: "level2MerchantVolumn", width: 20 },
        { header: `Total Cumulative Volume`, key: "totalReferralProcessingVolume", width: 20 },
        { header: `Total Active Brand Partners (Level 1)`, key: "level1ReferralPartnerCount", width: 30 },
        { header: `Total Active Brand Partners (Level 2)`, key: "level2ReferralPartnerCount", width: 30 },
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

}

export const userRankStatsController = new UserRankStatsController()
