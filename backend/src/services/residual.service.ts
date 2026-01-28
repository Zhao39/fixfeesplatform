import { TB_LOGS } from "../var/tables";
import { BaseService } from "./base.service";
import { irisLib } from "../library/irisLib";
import { businessService } from "./business.service";
import { userService } from "./user.service";
import { DATE_OPTION, RANK_TYPE } from "../var/config";
import { get_data_value } from "../helpers/misc";

export default class ResidualService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_LOGS;
  }

  public getUserResidualData = async (user, params) => {
    try {
      const partnerAllLevelMerchantList = await businessService.getPartnerAllLevelMerchantList(user['encrypted_id'])
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const { year, month, search, processor_id, hide_null_merchants } = params
      const data = {}
      const user_id = user['id']

      const residualMonthSumReportsParams = {
        year: year,
        month: month,
        search: search,
        processor_id: processor_id,
        hide_null_merchants: hide_null_merchants,
        mid: ""
      }
      let processorResidualMonthSumReports = []
      const [apiSuccess, apiRes] = await irisLib.getResidualSummaryData(residualMonthSumReportsParams)
      if (apiSuccess) {
        processorResidualMonthSumReports = apiRes?.data ?? []
      }

      const processorResidualData = {}
      if (processorResidualMonthSumReports.length > 0) {
        let processorSumReportsItem = processorResidualMonthSumReports[0]
        processorResidualData['sum'] = processorSumReportsItem

        const residualMonthReportsParams = {
          year: year,
          month: month,
          search: search,
          processor_id: processorSumReportsItem['processor_id'],
          hide_null_merchants: hide_null_merchants,
          mid: ""
        }
        let residualMonthReports = []
        const [apiSuccess, apiRes] = await irisLib.getResidualSummaryWithMerchantRows(residualMonthReportsParams)
        if (apiSuccess) {
          let userOverrideRank = null
          let monthlyReportData = apiRes?.data ?? []
          for (let k in monthlyReportData) {
            const merchantRow = monthlyReportData[k]
            const mid = merchantRow['mid']
            if (partnerAllLevelMerchantList[mid]) {
              const level = get_data_value(partnerAllLevelMerchantList[mid], 'level')
              let profitPercentage = 0
              if (level === 'level1') {
                profitPercentage = 22.5
              }
              else if (level === 'level2') {
                if (userOverrideRank === null) {
                  userOverrideRank = await userService.getUserOverrideRank(user['id'], DATE_OPTION.lifetime)
                }
                if (userOverrideRank === RANK_TYPE.SILVER) {
                  profitPercentage = 2.5
                }
                else if (userOverrideRank === RANK_TYPE.GOLD) {
                  profitPercentage = 5 
                }
                else if (userOverrideRank === RANK_TYPE.PLATINUM) {
                  profitPercentage = 10 
                }
              }
              else if (level === 'level3') {
                profitPercentage = 2.5
              }
              let bpNet = (profitPercentage * Number(merchantRow['net'])) / 100
              bpNet = Math.round(bpNet * 100) / 100
              residualMonthReports.push(
                {
                  ...merchantRow,
                  level: level,
                  profitPercentage: profitPercentage,
                  bpNet: bpNet,
                  percentage: profitPercentage,
                  agent_net: bpNet
                }
              )
            }
          }
          data['apiMonthlyReportData'] = monthlyReportData
        }
        processorResidualData['residualMonthReports'] = residualMonthReports
      }
      data['processorResidualData'] = processorResidualData
      return data
    } catch (e) {
      console.log("error::::", e)
      return {}
    }
  }

}

export const residualService = new ResidualService();

