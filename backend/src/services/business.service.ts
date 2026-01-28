import { console_log, empty, encrypt_md5, format_phone, generate_encrypted_id, get_data_value, get_utc_timestamp, is_empty, randomString, removeAllSpaces, trim_phone, usort } from "../helpers/misc";
import { TB_BUSINESS, TB_USER } from "../var/tables";
import { BaseService } from "./base.service";
import { businessOwnerService } from "./business.owner.service";
import { irisLib } from "../library/irisLib";
import { DATE_OPTION, DEFAULT_PROCESSOR_ID, MERCHANT_STATUS, PROSPECT_DAILY_LIMIT } from "../var/config";
import moment from 'moment';
import momentZ from 'moment-timezone';
import { getDateOptionWhereQuery } from "../helpers/utils";

export default class BusinessService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_BUSINESS;
  }

  /**
   * check if business account is duplicated
   */
  public checkDuplicatedAccount = async (account_info: object) => {
    let result: object = {
      is_duplicated: false,
      message: ""
    };
    if (is_empty(account_info['id'])) {
      account_info['id'] = 0;
    }
    let base_sql: string = "select * from " + TB_BUSINESS + " where id <> " + account_info['id'];

    if (!is_empty(account_info['username'])) {
      let sql: string = base_sql + " and username = ? limit 0,1";
      let values = [account_info['username']];
      let rows = await this.query(sql, values);
      if (!is_empty(rows[0])) {
        result['is_duplicated'] = true;
        result['message'] = "Username is already taken";
        return [result['is_duplicated'], result['message'], rows[0]];
      }
    }

    if (!is_empty(account_info['business_email'])) {
      let sql: string = base_sql + " and business_email = ? limit 0,1";
      let values = [account_info['business_email']];
      let rows = await this.query(sql, values);
      if (!is_empty(rows[0])) {
        result['is_duplicated'] = true;
        result['message'] = "Email address is already taken";
        return [result['is_duplicated'], result['message'], rows[0]];
      }
    }

    if (!is_empty(account_info['business_phone'])) {
      let sql: string = base_sql + " and business_phone = ? limit 0,1";
      let values = [account_info['business_phone']];
      let rows = await this.query(sql, values);
      if (!is_empty(rows[0])) {
        result['is_duplicated'] = true;
        result['message'] = "Phone number is already taken";
        return [result['is_duplicated'], result['message'], rows[0]];
      }
    }

    return [result['is_duplicated'], result['message'], null];
  }

  /**
   * create a business
   */
  public createBusiness = async (business_info) => {
    try {
      const id = await this.insert(business_info)
      let user_encrypted_id = generate_encrypted_id(id, 'business')
      let condition = { id: id }
      let update_data = {
        encrypted_id: user_encrypted_id
      }
      await this.update(update_data, condition);
      return id
    } catch (e) {
      console.log(`createBusiness error:::`, e)
      return null
    }
  }

  /**
   * add a business
   */
  public addBusiness = async (business_info, owner_list = []) => {
    try {
      let irisMerchantInfo = {}
      const mid = `${get_utc_timestamp()}${randomString(4, true)}`
      irisMerchantInfo['mid'] = Number(mid)
      if (business_info['business_dba']) {
        irisMerchantInfo['name'] = business_info['business_dba']
      }
      if (business_info['business_start_date']) {
        irisMerchantInfo['opened'] = business_info['business_start_date']
      }
      irisMerchantInfo['status'] = 'Open' //Enum:"Open" "Closed" 
      irisMerchantInfo['active'] = 'Yes' //Enum:"Yes" "No" 
      irisMerchantInfo['vim'] = 'No' //Enum:"Yes" "No" 
      irisMerchantInfo['group'] = 'Fix My Fees'
      irisMerchantInfo['processor'] = 'Elavon'
      irisMerchantInfo['datasource'] = 'Elavon'
      console_log(`irisMerchantInfo:::`, irisMerchantInfo)

      const [createMerchantSuccess, createMerchantRes] = await irisLib.createMerchant(irisMerchantInfo)
      console_log(`createMerchantSuccess, createMerchantRes::::`, createMerchantSuccess, createMerchantRes)
      if (createMerchantSuccess) {
        business_info['mid'] = irisMerchantInfo['mid']
        const id = await this.insert(business_info)

        let user_encrypted_id = generate_encrypted_id(id, 'business')
        let condition = { id: id }
        let update_data = {
          encrypted_id: user_encrypted_id
        }
        await this.update(update_data, condition);

        if (owner_list && owner_list.length > 0) {
          for (let k in owner_list) {
            const ownerInfo = owner_list[k]
            ownerInfo['owner_phone'] = trim_phone(ownerInfo['owner_phone'])

            const irisUserInfo = {
              username: removeAllSpaces(`${ownerInfo['owner_first_name']}${ownerInfo['owner_last_name']}`),
              email: `${ownerInfo['owner_email']}`,
              first_name: `${ownerInfo['owner_first_name']}`,
              last_name: `${ownerInfo['owner_last_name']}`,
              is_send_new_password: "Yes",
              mobile_number: `${format_phone(ownerInfo['owner_phone'])}`,
              country_code: 1,
            }
            const [createUserSuccess, createUserRes] = await irisLib.createUser(irisUserInfo)
            console_log(`createUserSuccess, createUserRes:::`, createUserSuccess, createUserRes)
            if (createUserSuccess) {
              const irisUserId = createUserRes?.user_id
              if (irisUserId) {
                const [activateUserSuccess, activateUserRes] = await irisLib.updateUser(irisUserId, { is_active: 'Yes' })
                console_log(`activateUserSuccess, activateUserRes:::`, activateUserSuccess, activateUserRes)

                const assignMerchantInfo = {
                  merchants: {
                    set: [
                      {
                        "mid": irisMerchantInfo['mid'],
                        "year": 2024,
                        "month": 12,
                        "residual_split": 72,
                        "split_type": "Gross",
                        "group_split": 82,
                        "apply_for_future": "Yes",
                        "note": "string",
                        "split_should_expire": "Yes",
                        "split_expire_year": 2024,
                        "split_expire_month": 11,
                        "split_after_expiration": 52,
                        "split_after_expiration_type": "Gross",
                        "split_after_expiration_group_split": 82
                      }
                    ],
                    unset: []
                  }
                }
                const [assignMerchantToUserSuccess, assignMerchantToUserRes] = await irisLib.assignMerchantToUser(irisUserId, assignMerchantInfo)
                console_log(`assignMerchantToUserSuccess, assignMerchantToUserRes:::`, assignMerchantToUserSuccess, assignMerchantToUserRes)
                if (!assignMerchantToUserSuccess) {
                  return [false, assignMerchantToUserRes]
                }
                ownerInfo['iris_user_id'] = irisUserId
              }
            } else {
              return [false, createUserRes]
            }
            const owner_id = await businessOwnerService.insert({ ...ownerInfo, business_id: id })
          }
        }
        return [true, id]
      }
      else {
        return [false, createMerchantRes]
      }
    } catch (e) {
      console.log(`addBusiness error:::`, e)
    }
    return [false, null]
  }

  /**
   * get business detail
   */
  public getDetail = async (condition, withExtraData = false) => {
    try {
      let user_info = await this.getOne(condition)
      return user_info
    } catch (e) {
      console.log(`getDetail error:::`, e)
    }
  }

  /**
   * update business detail
   */
  public updateDetail = async (update_data, condition) => {
    try {
      await this.update(update_data, condition)
      return true
    } catch (e) {
      console.log(`updateDetail error:::`, e)
      return false
    }
  }

  /**
   * get business business list
   */
  public getUserBusinessList = async (userInfo, withMerchantDetail = false) => {
    try {
      const encrypted_id = userInfo.encrypted_id
      const condition = {
        ref_id: encrypted_id
      }
      const businessList = await businessService.getAll(condition)
      for (let k in businessList) {
        const businessDetail = businessList[k]
        const mid = businessDetail['mid']
        if (mid && withMerchantDetail) {
          const [apiResult, merchantDetail] = await irisLib.getMerchantDetail(mid)
          if (apiResult) {
            businessList[k]['merchantDetail'] = merchantDetail
          }
        }
      }
      return businessList
    } catch (e) {
      console.log(`getUserBusinessList error:::`, e)
      return []
    }
  }

  /**
   * get merchant performance data
   */
  public getMerchantPerformanceData = async (userInfo, dateOption) => {
    try {
      const data = {}
      const topPerformerList = []
      const topPerformerCardTypes = {
        VI: {
          "type": "VI",
          "amount": 0,
          "count": 0
        },
        MC: {
          "type": "MC",
          "amount": 0,
          "count": 0
        },
        AX: {
          "type": "AX",
          "amount": 0,
          "count": 0
        },
        DC: {
          "type": "DC",
          "amount": 0,
          "count": 0
        },
        OT: {
          "type": "OT",
          "amount": 0,
          "count": 0
        }
      }
      const encrypted_id = userInfo.encrypted_id
      const condition = {
        ref_id: encrypted_id
      }
      const businessList = await businessService.getAll(condition)
      for (let k in businessList) {
        const businessDetail = businessList[k]
        const mid = businessDetail['mid']
        if (mid) {
          const [apiResult, merchantDetail] = await irisLib.getMerchantDetail(mid, true, dateOption)
          if (apiResult) {
            const merchantInfo = merchantDetail['merchantInfo']
            if (merchantInfo) {
              const merchantGeneralInfo = merchantInfo['general']
              if (merchantGeneralInfo) {
                const row = {}
                row['mid'] = mid
                row['name'] = merchantGeneralInfo['name']
                const performaceData = merchantDetail['performaceData']
                const total_paid_by_us = performaceData?.depositList?.totals?.total_paid_by_us
                row['total_paid_by_us'] = total_paid_by_us ?? 0
                const transactions_count = performaceData?.depositList?.totals?.transactions_count
                row['transactions_count'] = transactions_count ?? 0
                topPerformerList.push(row)

                const per_card_type = performaceData?.depositList?.totals?.per_card_type ?? []
                for (let i in per_card_type) {
                  const card_type_row = per_card_type[i]
                  const type = card_type_row['type']
                  topPerformerCardTypes[type]['amount'] += Number(card_type_row['amount'])
                  topPerformerCardTypes[type]['count'] += Number(card_type_row['count'])
                }
              }
            }
          }
        }
      }
      const topPerformerListSorted = usort(topPerformerList, 'total_paid_by_us')
      data['topPerformerList'] = topPerformerListSorted

      const topPerformerCardTypeList = []
      for (let type in topPerformerCardTypes) {
        topPerformerCardTypeList.push(topPerformerCardTypes[type])
      }
      const topPerformerCardTypeListSorted = usort(topPerformerCardTypeList, 'amount')
      data['topPerformerCardTypeList'] = topPerformerCardTypeListSorted

      return data
    } catch (e) {
      console.log(`getMerchantPerformanceData error:::`, e)
      return {}
    }
  }

  /**
   * get last month residual data of all business (merchants)
   */
  public getLastResidualDataOfMerchantList = async (merchantId = null) => {
    const merchantListResidualData = []
    try {
      const condition = {}
      if (merchantId) {
        condition['id'] = merchantId
      }
      const businessList = await businessService.getAll(condition)
      for (let k in businessList) {
        const businessDetail = businessList[k]
        const id = businessDetail['id']
        const mid = businessDetail['mid']
        if (mid) {
          const update_data = await this.getLastResidualDataOfMerchant(mid)
          merchantListResidualData.push({
            id: id,
            mid: mid,
            ...update_data
          })
        } else {
          merchantListResidualData.push({
            id: id
          })
        }
      }
      return merchantListResidualData
    } catch (e) {
      console.log(`getLastResidualDataOfMerchantList error:::`, e)
      return merchantListResidualData
    }
  }

  /**
   * get last month residual data of business (merchant)
   */
  public getLastResidualDataOfMerchant = async (mid) => {
    try {
      if (mid) {
        const options = {
          mid: mid
        }
        const lastMonthResidual = await irisLib.getLastMonthResidual(options)
        const net = get_data_value(lastMonthResidual, 'net', 0)
        const sales_amount = get_data_value(lastMonthResidual, 'sales_amount', 0)
        const update_data = {
          adjusted_net: net,
          processing_volume: sales_amount
        }
        await businessService.update(update_data, { mid: mid })
        return update_data
      }
    } catch (e) {
      console.log(`getLastResidualDataOfMerchant error:::`, e)
    }
  }

  /**
  * getMerchantResidualReport
  */
  public getMerchantResidualReportData = async (options) => {
    const data = []
    try {
      const defaultRow = {
        "mid": "",
        "merchant": "",
        "transactions": 0,
        "sales_amount": 0,
        "expense": 0,
        "income": 0,
        "net": 0,
        "percentage": 0,
        "bps": 0,
        "agent_net": 0
      }
      const residualReports = await irisLib.getMerchantResidualReports(options)
      for (let k in residualReports) {
        const item = residualReports[k]
        const monthStr = item['monthStr']
        const reportData = item['reportData']
        let row = {}
        if (reportData && reportData.length > 0) {
          const reportDataItem = reportData[0]
          delete reportDataItem['agents']
          row = {
            month: monthStr,
            ...defaultRow,
            ...reportDataItem
          }
        } else {
          row = {
            month: monthStr,
            ...defaultRow
          }
        }
        data.push(row)
      }
      return data
    } catch (e) {
      console.log("getMerchantResidualReport error:::", e)
      return data
    }
  }

  /**
* getMerchantAdjustedNet
*/
  public getMerchantAdjustedNet = async (mid) => {
    let sum = 0
    try {
      const options = {
        processor_id: DEFAULT_PROCESSOR_ID,
        mid: mid
      }
      const residualReports = await irisLib.getResidualReports(options)
      for (let k in residualReports) {
        const item = residualReports[k]
        const reportData = item['reportData']
        if (reportData && reportData.length > 0) {
          const reportDataItem = reportData[0]
          const net = get_data_value(reportDataItem, 'net', 0)
          sum += Number(net)
        }
      }
      return sum
    } catch (e) {
      console.log("getMerchantAdjustedNet error:::", e)
      return sum
    }
  }

  /**
  * getMerchantTransactionVolume
  */
  public getMerchantTransactionVolume = async (mid) => {
    let sum = 0
    try {
      const options = {
        mid: mid
      }
      const residualReports = await irisLib.getResidualReports(options)
      for (let k in residualReports) {
        const item = residualReports[k]
        const reportData = item['reportData']
        if (reportData && reportData.length > 0) {
          const reportDataItem = reportData[0]
          const sales_amount = get_data_value(reportDataItem, 'sales_amount', 0)
          sum += Number(sales_amount)
        }
      }
      return sum
    } catch (e) {
      console.log("getMerchantTransactionVolume error:::", e)
      return sum
    }
  }

  /**
  * getLevel1ActiveMerchantCount
  */
  public getLevel1ActiveMerchantCount = async (ref_id, dateOption = null) => {
    let cnt = 0
    try {
      if (empty(dateOption)) {
        dateOption = DATE_OPTION.today
      }
      let sql = `select count(id) as cnt from ${TB_BUSINESS} where 1=1 and ref_id = '${ref_id}' and status = '${MERCHANT_STATUS.ACTIVE}'`
      const dateOptionSql = getDateOptionWhereQuery(dateOption)
      sql += dateOptionSql
      const rows = await this.query(sql);
      cnt = (!empty(rows) ? rows[0]['cnt'] : 0);
      return cnt
    } catch (e) {
      console.log("getLevel1ActiveMerchantCount error:::", e)
      return cnt
    }
  }

  /**
  * getLevel2ActiveMerchantCount
  */
  public getLevel2ActiveMerchantCount = async (ref_id, dateOption = null) => { // ref_id: user's encrypted_id
    let cnt = 0
    try {
      // let sql = `select count(id) as cnt from ${TB_BUSINESS} where status = '${MERCHANT_STATUS.ACTIVE}' and ref_id in (select encrypted_id from ${TB_USER} where ref_id = '${ref_id}')`
      // // console.log(`getLevel2ActiveMerchantCount sql:::`, sql)
      // let sqlRes = await this.query(sql)
      // if (sqlRes && sqlRes.length > 0) {
      //   count = sqlRes[0].cnt
      // }
      // return count

      if (empty(dateOption)) {
        dateOption = DATE_OPTION.today
      }
      let sql = `select count(id) as cnt from ${TB_BUSINESS} where 1=1 and level2_ref_id = '${ref_id}' and status = '${MERCHANT_STATUS.ACTIVE}'`
      const dateOptionSql = getDateOptionWhereQuery(dateOption)
      sql += dateOptionSql
      const rows = await this.query(sql);
      cnt = (!empty(rows) ? rows[0]['cnt'] : 0);
      return cnt
    } catch (e) {
      console.log("getLevel2ActiveMerchantCount error:::", e)
      return cnt
    }
  }

  /**
  * getLevel3ActiveMerchantCount
  */
  public getLevel3ActiveMerchantCount = async (ref_id, dateOption = null) => {
    let cnt = 0
    try {
      // let sql = `select count(id) as cnt from ${TB_BUSINESS} where status = '${MERCHANT_STATUS.ACTIVE}' and ref_id in (select encrypted_id from ${TB_USER} where ref_id in (select encrypted_id from ${TB_USER} where ref_id = '${ref_id}'))`
      // console.log(`getLevel3ActiveMerchantCount sql:::`, sql)
      // let sqlRes = await this.query(sql)
      // if (sqlRes && sqlRes.length > 0) {
      //   count = sqlRes[0].cnt
      // }
      // return count

      if (empty(dateOption)) {
        dateOption = DATE_OPTION.today
      }
      let sql = `select count(id) as cnt from ${TB_BUSINESS} where 1=1 and level3_ref_id = '${ref_id}' and status = '${MERCHANT_STATUS.ACTIVE}'`
      const dateOptionSql = getDateOptionWhereQuery(dateOption)
      sql += dateOptionSql
      const rows = await this.query(sql);
      cnt = (!empty(rows) ? rows[0]['cnt'] : 0);
      return cnt
    } catch (e) {
      console.log("getLevel3ActiveMerchantCount error:::", e)
      return cnt
    }
  }

  /**
  * getLevel1MerchantVolumn
  */
  public getLevel1MerchantVolumn = async (ref_id, dateOption = null) => {
    if (empty(dateOption)) {
      dateOption = DATE_OPTION.today
    }

    let data = {
      total_processing_volume: 0,
      total_adjusted_net: 0
    }
    try {
      const where = {
        ref_id: ref_id
      }
      const fields = "id,mid,adjusted_net,processing_volume"
      let sql = `select ${fields} from ${TB_BUSINESS} where ref_id = '${ref_id}'`
      const dateOptionSql = getDateOptionWhereQuery(dateOption)
      sql += dateOptionSql
      const businessList = await this.query(sql)
      if (businessList && businessList.length > 0) {
        for (let k in businessList) {
          const business = businessList[k]
          const processing_volume = business['processing_volume']
          if (processing_volume) {
            data['total_processing_volume'] += Number(processing_volume)
          }
          // const adjusted_net = business['adjusted_net']
          // if (adjusted_net) {
          //   data['total_adjusted_net'] += Number(adjusted_net)
          // }
        }
      }
      return data['total_processing_volume']
    } catch (e) {
      console.log("getLevel1MerchantVolumn error:::", e)
      return 0
    }
  }

  /**
  * getLevel2MerchantVolumn
  */
  public getLevel2MerchantVolumn = async (ref_id, dateOption = null) => {
    if (empty(dateOption)) {
      dateOption = DATE_OPTION.today
    }

    let total_sum = 0
    try {
      let sql = `select sum(processing_volume) as total_sum from ${TB_BUSINESS} where status = '${MERCHANT_STATUS.ACTIVE}' and level2_ref_id = '${ref_id}'`
      const dateOptionSql = getDateOptionWhereQuery(dateOption)
      sql += dateOptionSql
      let sqlRes = await this.query(sql)
      console.log(`getLevel2MerchantVolumn sql:::`, sql, sqlRes)
      if (sqlRes && sqlRes.length > 0 && sqlRes[0].total_sum) {
        total_sum = sqlRes[0].total_sum
      }
      return total_sum
    } catch (e) {
      console.log("getLevel2MerchantVolumn error:::", e)
      return total_sum
    }
  }

  public getMerchantResidualProfitDetail = async (options) => {
    let data = {
      ytd_profit: 0,
      ytd_profit_bps: 0,
      lifetime_profit: 0,
      lifetime_profit_bps: 0
    }
    try {
      const merchantProfitData = await irisLib.getMerchantProfitData(options)
      data = {
        ...data,
        ...merchantProfitData
      }
      return data
    } catch (e) {
      console.log("getMerchantResidualProfitDetail error:::", e)
      return data
    }
  }

  public checkProspectDailyLimitReached = async (user) => {
    try {
      let count = 0
      let sql = `select count(id) as cnt from ${TB_BUSINESS} where ref_id = '${user['encrypted_id']}'`
      sql += ` and createdAt >= NOW() - INTERVAL 24 hour`
      const rows = await this.query(sql)
      if (rows && rows.length > 0) {
        count = rows[0]['cnt']
      }
      if (empty(count)) count = 0
      if (count > PROSPECT_DAILY_LIMIT) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log("checkProspectDailyLimit error:::", e)
      return false
    }
  }

  public getPartnerAllLevelMerchantList = async (ref_id) => { // ref_id: user's encrypted_id
    const data = {}
    try {
      let sql = `select * from ${TB_BUSINESS} where 1=1 and (ref_id = '${ref_id}' or level2_ref_id = '${ref_id}' or level3_ref_id = '${ref_id}')`
      const rows = await this.query(sql);
      if (rows) {
        for (let k in rows) {
          const row = rows[k]
          const mid = row['mid']
          if (mid) {
            if (row['ref_id'] === ref_id) {
              row['level'] = 'level1'
            }
            else if (row['level2_ref_id'] === ref_id) {
              row['level'] = 'level2'
            }
            else if (row['level3_ref_id'] === ref_id) {
              row['level'] = 'level3'
            }
            data[mid] = row
          }
        }
      }
      return data
    } catch (e) {
      console.log("getPartnerAllLevelMerchantList error:::", e)
      return data
    }
  }
}

export const businessService = new BusinessService();
