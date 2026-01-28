import { decrypt__data, empty, encrypt__data, generate_encrypted_id, get_data_value, get_utc_timestamp, intval, is_empty } from "../helpers/misc";
import { TB_BUSINESS, TB_USER } from "../var/tables";
import { BRAND_PARTNER_STATUS, DATE_OPTION, DEFAULT_PROCESSOR_ID, MEMBER_TYPE, MERCHANT_STATUS, PROSPECT_DAILY_LIMIT, RANK_TYPE, RANK_TYPE_TEXT, REWARD_TYPE, TIER_TYPE, TIER_TYPE_TEXT } from "../var/config";
import { BaseService } from "./base.service";
import { licenseService } from "./license.service";
import { tokenService } from "./token.service";
import { userNotificationService } from "./user.notification.service";
import { irisLib } from "../library/irisLib";
import { businessService } from "./business.service";
import { rewardFundsHistoryService } from "./reward.funds.history.service";
import moment from "moment";
import { getDateOptionWhereQuery } from "../helpers/utils";

export default class UserService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_USER;
  }

  /**
   * check if account is duplicated or not
   * true: account is duplicated, false: not duplicated 
   */
  public checkDuplicatedAccount = async (account_info: object) => {
    let result: object = {
      is_duplicated: false,
      message: ""
    };
    if (is_empty(account_info['id'])) {
      account_info['id'] = 0;
    }
    let base_sql: string = "select * from " + TB_USER + " where id <> " + account_info['id'];

    if (!is_empty(account_info['name'])) {
      let sql: string = base_sql + " and name = ? limit 0,1";
      let values = [account_info['name']];
      let rows = await this.query(sql, values);
      if (!is_empty(rows[0])) {
        result['is_duplicated'] = true;
        result['message'] = "Username is already taken";
        return [result['is_duplicated'], result['message'], rows[0]];
      }
    }

    if (!is_empty(account_info['email'])) {
      let sql: string = base_sql + " and email = ? limit 0,1";
      let values = [account_info['email']];
      let rows = await this.query(sql, values);
      if (!is_empty(rows[0])) {
        result['is_duplicated'] = true;
        result['message'] = "Email address is already taken";
        return [result['is_duplicated'], result['message'], rows[0]];
      }
    }

    if (!is_empty(account_info['phone'])) {
      let sql: string = base_sql + " and phone = ? limit 0,1";
      let values = [account_info['phone']];
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
  * delete a user info
  */
  public deleteUser = async (user_id = 0) => {
    let user_info = await this.getOne({ id: user_id })
    await this.delete({ id: user_info['id'] })
    return true
  }

  /**
  * delete a user info and all data related with this user
  */
  public deleteUserInfo = async (condition, delete_all_info = false) => {
    let user_info = await this.getOne(condition)
    const user_id = user_info.id
    if (delete_all_info) {
      const where = { user_id: user_id }
      await tokenService.delete({ ...where, user_type: 'user' })
    }
    await this.deleteUser(user_id)
    return user_info
  }

  /**
  * get customer detail of current user
  */
  public getCustomerDetail = (customer_detail) => {
    try {
      const customer_detail_obj = decrypt__data(customer_detail)
      return customer_detail_obj
    } catch (e) {
      console.log(`get user customer detail error::::`, e)
    }
    return null
  }

  /**
  * get user detail
  */
  public getDetail = async (condition, withCustomerData = false) => {
    let user_info = await this.getOne(condition)
    if (!empty(user_info)) {
      const condition = { user_id: user_info['id'] }
      const license_info = await licenseService.getOne(condition)
      user_info['license_info'] = license_info
      if (withCustomerData) {
        const customer_detail = user_info['customer_detail']
        const customer_detail_obj = this.getCustomerDetail(customer_detail)
        user_info['customer_detail'] = customer_detail_obj
      }
    }
    return user_info
  }

  /**
  * add new user
  */
  public addUser = async (account_info) => {
    try {
      const [is_duplicated, duplicated_message, check_account] = await this.checkDuplicatedAccount({ ...account_info });
      if (is_duplicated) {
        return duplicated_message
      } else {
        const user_id = await this.insert({ ...account_info })
        let user_encrypted_id = generate_encrypted_id(user_id, 'partner');
        let condition = { id: user_id };
        let update_data = {
          encrypted_id: user_encrypted_id
        };
        await this.update(update_data, condition);
        account_info['id'] = user_id;
        return user_id
      }
    } catch (e) {
      return null
    }
  }

  /**
  * update user detail
  */
  public updateDetail = async (update_data, condition) => {
    await this.update(update_data, condition)
    return true
  }

  /**
  * get personal referral list of user
  */
  public getPersonalReferralList = async (user_id, active_users_only = true) => {
    let user_info = await this.getOne({ id: user_id })
    if (!empty(user_info)) {
      let encrypted_id = user_info['encrypted_id'];
      let condition = { ref_id: encrypted_id }
      if (active_users_only) {
        condition['status'] = '1'
        condition['is_active'] = 1
      }
      let referral_list = await this.getAll(condition)
      return referral_list;
    }
    return [];
  }

  /**
  * get a sponsor info of current user
  */
  public getSponsor = async (user_id) => {
    let user_info = await this.getOne({ id: user_id })
    if (!empty(user_info)) {
      let ref_id = user_info['ref_id'];
      let sponsor_info = await this.getOne({ encrypted_id: ref_id })
      if (!empty(ref_id) && !empty(sponsor_info)) {
        return sponsor_info;
      }
    }
    return false;
  }

  /**
  * update customer id of a user
  */
  public update_customer_id = async (params: object) => {
    let user_id = params['user_id'];
    let condition: object = { id: user_id };
    let cardNumber: string = <string>params['cardNumber'];
    let card_last_4 = cardNumber.substr(cardNumber.length - 4)
    let update_data = {
      customer_detail: encrypt__data({ ...params, coupon: "" }),
      customer_id: user_id,
      card_last_4: card_last_4
    }
    await this.update(update_data, condition)
    return;
  }

  /**
  * check if current user is active
  */
  public check_user_is_active = async (user_id: number | string) => {
    let cur_timestamp = get_utc_timestamp()
    let user_info = await this.getOne({ id: user_id })
    let where = { id: user_id }
    let user_license_info = await licenseService.getOne({ user_id: user_id })
    if (empty(user_license_info)) {
      await this.update({ is_active: 0, inactive_timestamp: cur_timestamp }, where);
      return false;
    } else {
      let license_status = intval(user_license_info['status'])
      if (license_status === 1) {
        await this.update({ is_active: 1, inactive_timestamp: 0 }, where);
        return true;
      } else {
        await this.update({ is_active: 0, inactive_timestamp: cur_timestamp }, where);
        await licenseService.delete({ user_id: user_id })
        return false;
      }
    }
  }

  /**
  * update user's license status
  */
  public update_license_status = async (params, add_timestamp = 0) => { //payment param or transaction record
    let user_id = params['user_id'];
    let condition = { pay_sn: params['pay_sn'], user_id: user_id }
    let update_data = { status: '1', is_trial: 0, coupon: "", coupon_type: 0, coupon_value: 0 }
    if (empty(add_timestamp) || add_timestamp === 0) {
      add_timestamp = get_utc_timestamp();
    }
    update_data['add_timestamp'] = add_timestamp

    await licenseService.update(update_data, condition);
    let update_user_data = { is_active: 1, is_trial: 0 }
    await this.update(update_user_data, { id: user_id });
    return;
  }

  /**
  * set user as inactive
  */
  public setUserInactive = async (user_id) => {
    try {
      let where = { user_id: user_id };
      await licenseService.delete(where);
      await this.update({ coupon: "" }, { id: user_id });
      await this.check_user_is_active(user_id);
    } catch (e) {
      console.log("setUserInactive error:::", e)
    }
  }

  /**
  * check if user is free member
  */
  public isFreeMember = (user_info) => {
    try {
      if (user_info['member_type'] === MEMBER_TYPE.FREE_MEMBER) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log("isFreeMember error:::", e)
    }
    return false
  }

  /**
  * set user as free member
  */
  public setUserAsFreeMember = async (user_id) => {
    try {
      const update_data = {
        member_type: MEMBER_TYPE.FREE_MEMBER,
        is_active: 1
      }
      await this.update(update_data, { id: user_id });

      let where = { user_id: user_id };
      await licenseService.delete(where);
      return true
    } catch (e) {
      console.log("setUserAsFreeMember error:::", e)
    }
  }

  /**
  * cancel current membership
  */
  public cancelMembership = async (user_id) => {
    try {
      let where = { user_id: user_id };
      let update_data = {
        is_cancelled: 1
      }
      await licenseService.update(update_data, where);
      return true
    } catch (e) {
      console.log("cancelMembership error:::", e)
    }
  }

  /**
  * recover membership
  */
  public recoverMembership = async (user_id) => {
    try {
      let where = { user_id: user_id };
      let update_data = {
        is_cancelled: 0
      }
      await licenseService.update(update_data, where);
      return true
    } catch (e) {
      console.log("cancelMembership error:::", e)
    }
  }

  /**
  * update user membership
  */
  public updateMembership = async (user_id, membership) => {
    try {
      let where = { user_id: user_id }
      const licenseInfo = await licenseService.getOne(where)
      if (licenseInfo && licenseInfo.id) {
        if (licenseInfo.membership === membership) {
          return true
        }
        else {
          await licenseService.update_license_membership(licenseInfo, membership);
          const update_data = {
            membership: membership
          }
          await this.update(update_data, { id: user_id })
        }
      }
      return true
    } catch (e) {
      console.log("updateMembership error:::", e)
    }
  }

  /**
  * update user id from user email, 
  * this function will be used when invitation user has been registered
  */
  public updateUserIdFromEmail = async (email, user_id) => {
    try {
      const condition = {
        user_id: 0,
        email: email
      }
      const update_data = {
        user_id: user_id
      }
      await userNotificationService.update(update_data, condition)
      return true
    } catch (e) {
      console.log("updateUserIdFromEmail error:::", e)
    }
  }

  /**
  * getUserLevel1ReferralPartnerCount
  */
  public getUserLevel1ReferralPartnerCount = async (ref_id, dateOption = null) => {
    try {
      if (empty(dateOption)) {
        dateOption = DATE_OPTION.today
      }
      let sql = `select count(id) as cnt from ${this.tableName} where 1=1 and ref_id = '${ref_id}' and status = '${BRAND_PARTNER_STATUS.ACTIVE}'`
      const dateOptionSql = getDateOptionWhereQuery(dateOption)
      sql += dateOptionSql
      const rows = await this.query(sql);
      let cnt = (!empty(rows) ? rows[0]['cnt'] : 0);
      return cnt
    } catch (e) {
      console.log("getUserLevel1ReferralPartnerCount error:::", e)
      return 0
    }
  }

  /**
  * getUserLevel2ReferralPartnerCount
  */
  public getUserLevel2ReferralPartnerCount = async (ref_id, dateOption = null) => { // ref_id: user's encrypted_id
    let cnt = 0
    try {
      // let sql = `select count(id) as cnt from ${TB_USER} where status = '${BRAND_PARTNER_STATUS.ACTIVE}' and ref_id in (select encrypted_id from ${TB_USER} where ref_id = '${ref_id}')`
      // let sqlRes = await this.query(sql)
      // if (sqlRes && sqlRes.length > 0) {
      //   count = sqlRes[0].cnt
      // }
      // return count

      let sql = `select count(id) as cnt from ${TB_USER} where 1=1 and level2_ref_id = '${ref_id}' and status = '${BRAND_PARTNER_STATUS.ACTIVE}'`
      const dateOptionSql = getDateOptionWhereQuery(dateOption)
      sql += dateOptionSql
      const rows = await this.query(sql);
      cnt = (!empty(rows) ? rows[0]['cnt'] : 0);
      return cnt
    } catch (e) {
      console.log("getUserLevel2ReferralPartnerCount error:::", e)
      return cnt
    }
  }

  /**
* getUserLevel2ReferralPartnerCount
*/
  public getUserLevel3ReferralPartnerCount = async (ref_id) => { // ref_id: user's encrypted_id
    let count = 0
    try {
      const where = {
        level3_ref_id: ref_id,
        status: BRAND_PARTNER_STATUS.ACTIVE
      }
      const userCount = await this.countAll(where)
      return userCount
    } catch (e) {
      console.log("getUserLevel3ReferralPartnerCount error:::", e)
      return count
    }
  }

  /**
  * getLevelReferralList
  */
  public getLevelReferralList = async (ref_id) => {
    let level1RefInfo = null
    let level2RefInfo = null
    let level3RefInfo = null
    try {
      ////////////////////////////////////////////////////////////////////////
      level1RefInfo = await this.getOne({ encrypted_id: ref_id })
      if (level1RefInfo && level1RefInfo['ref_id']) {
        level2RefInfo = await this.getOne({ encrypted_id: level1RefInfo['ref_id'] })
        if (level2RefInfo && level2RefInfo['ref_id']) {
          level3RefInfo = await this.getOne({ encrypted_id: level2RefInfo['ref_id'] })
        }
      }
      const data = {
        level1RefInfo,
        level2RefInfo,
        level3RefInfo
      }
      return data
    } catch (e) {
      console.log("getLevelReferralList error:::", e)
      const data = {
        level1RefInfo,
        level2RefInfo,
        level3RefInfo
      }
      return data
    }
  }

  /**
   * update override rank and tier level for all users
   */
  public updateAllUsersRankAndTier = async () => {
    try {
      const userList = await this.getAll({})
      for (let k in userList) {
        const user = userList[k]
        const userId = user['id']
        await this.updateUserRankAndTier(userId)
      }
    } catch (e) {
      console.log("updateAllUsersRankAndTier error:::", e)
    }
  }

  /**
  * update user's override rank and tier level
  */
  public updateUserRankAndTier = async (userId) => {
    try {
      let rank = await this.getUserOverrideRank(userId)
      const userTotalReferralVolumnData = await this.getUserTotalReferralVolumnData(userId)
      const totalReferralAdjustedNet = userTotalReferralVolumnData['total_adjusted_net']
      const totalReferralProcessingVolume = userTotalReferralVolumnData['total_processing_volume']
      const tier = await this.getUserTierLevel(totalReferralProcessingVolume)
      const update_data = {
        rank: rank,
        tier: tier
      }
      await this.update(update_data, { id: userId })
      return update_data
    } catch (e) {
      console.log("updateUserRankAndTier error:::", e)
    }
  }

  /**
  * getUserOverrideRank
  */
  public getUserOverrideRank = async (userId, dateOption = null) => {
    let rank = RANK_TYPE.SILVER
    try {
      const userCount = await this.getUserLevel1ReferralPartnerCount(userId, dateOption)
      if (userCount > 0) {
        if (userCount >= 100 && userCount <= 249) {
          rank = RANK_TYPE.GOLD
        }
        else if (userCount >= 250) {
          rank = RANK_TYPE.PLATINUM
        }
      }
      return rank
    } catch (e) {
      console.log("getUserOverrideRank error:::", e)
      return rank
    }
  }

  /**
  * getNextOverrideRank
  */
  public getUserNextOverrideRank = async (currentRank) => {
    let nextRank = null
    try {
      if (currentRank === RANK_TYPE.SILVER) {
        nextRank = RANK_TYPE.GOLD
      }
      else if (currentRank === RANK_TYPE.GOLD) {
        nextRank = RANK_TYPE.PLATINUM
      } else if (currentRank === RANK_TYPE.PLATINUM) {
        nextRank = null
      }
      return nextRank
    } catch (e) {
      console.log("getUserNextOverrideRank error:::", e)
      return nextRank
    }
  }

  /**
  * getUserNextLevelPercentage
  */
  public getUserNextLevelPercentage = async (userCount) => {
    try {
      if (userCount >= 100 && userCount < 250) { // status is GOLD
        let percentage = ((userCount - 100) / (250 - 100)) * 100;
        // console.log(`You are in GOLD. You are ${percentage.toFixed(2)}% away from PLATINUM`);
        return Number(percentage.toFixed(2))
      }
      else if (userCount >= 250) { // status is GOLD
        return null
      } else { //status is SILVER
        let percentage = (userCount / 100) * 100;
        // console.log(`You are in SILVER. You are ${(100 - percentage).toFixed(2)}% away from GOLD.`);
        return Number(percentage.toFixed(2))
      }
    } catch (e) {
      console.log("getUserNextLevelPercentage error:::", e)
      return 0
    }
  }

  /**
  * getUserTierLevel
  */
  public getUserTierLevel = async (total_processing_volume) => {
    let level = TIER_TYPE.TIER_4
    try {
      const million = 1000000
      if (total_processing_volume >= 10 * million && total_processing_volume < 50 * million) {
        level = TIER_TYPE.TIER_3
      }
      else if (total_processing_volume >= 50 * million && total_processing_volume < 100 * million) {
        level = TIER_TYPE.TIER_2
      }
      else if (total_processing_volume >= 100 * million) {
        level = TIER_TYPE.TIER_1
      }
      return level
    } catch (e) {
      console.log("getUserTierLevel error:::", e)
      return level
    }
  }

  /**
  * getUserNextTierLevel
  */
  public getUserNextTierLevel = async (currentLevel) => {
    let nextLevel = null
    try {
      if (currentLevel === TIER_TYPE.TIER_4) {
        nextLevel = TIER_TYPE.TIER_3
      }
      else if (currentLevel === TIER_TYPE.TIER_3) {
        nextLevel = TIER_TYPE.TIER_2
      }
      else if (currentLevel === TIER_TYPE.TIER_2) {
        nextLevel = TIER_TYPE.TIER_1
      }
      else if (currentLevel === TIER_TYPE.TIER_1) {
        nextLevel = null
      }
      return nextLevel
    } catch (e) {
      console.log("getUserNextTierLevel error:::", e)
      return nextLevel
    }
  }

  /**
  * getUserNextTierLevelPercentage
  */
  public getUserNextTierLevelPercentage = async (total_processing_volume) => {
    try {
      const million = 1000000
      if (total_processing_volume >= 10 * million && total_processing_volume < 50 * million) {
        // level = TIER_TYPE.TIER_3
        let percentage = ((total_processing_volume - 10 * million) / (50 * million - 10 * million)) * 100;
        // console.log(`You are in Tier 3. You are ${percentage.toFixed(2)}% away from Tier 2.`);
        return Number(percentage.toFixed(2))
      }
      else if (total_processing_volume >= 50 * million && total_processing_volume < 100 * million) {
        //level = TIER_TYPE.TIER_2
        let percentage = ((total_processing_volume - 50 * million) / (100 * million - 50 * million)) * 100;
        //console.log(`You are in Tier 2. You are ${percentage.toFixed(2)}% away from Tier 1.`);
        return Number(percentage.toFixed(2))
      }
      else if (total_processing_volume >= 100 * million) {
        //level = TIER_TYPE.TIER_1
        return null
      } else { //total_processing_volume < 10 * million
        //level = TIER_TYPE.TIER_4
        let percentage = (total_processing_volume / (10 * million)) * 100;
        // console.log(`You are in Tier 4. You are ${(100 - percentage).toFixed(2)}% away from Tier 3.`);
        return Number(percentage.toFixed(2))
      }
    } catch (e) {
      console.log("getUserNextTierLevelPercentage error:::", e)
      return 0
    }
  }

  /**
  * getUserTotalReferralAdjustedNet
  */
  public getUserTotalReferralAdjustedNet = async (userId) => {
    let amount = 0
    try {
      const user = await this.getOne({ id: userId })
      if (user && user['id']) {
        const encrypted_id = user['encrypted_id']
        const where = {
          ref_id: encrypted_id
        }
        const fields = "id,mid,adjusted_net,processing_volume"
        const businessList = await businessService.getAll(where, "", fields)
        if (businessList && businessList.length > 0) {
          for (let k in businessList) {
            const business = businessList[k]
            const adjusted_net = business['adjusted_net']
            if (adjusted_net) {
              amount += Number(adjusted_net)
            }
          }
        }
      }
      return amount
    } catch (e) {
      console.log("getUserTotalReferralAdjustedNet error:::", e)
      return amount
    }
  }

  /**
  * getUserTotalReferralProcessingVolume
  */
  public getUserTotalReferralProcessingVolume = async (userId) => {
    let amount = 0
    try {
      const user = await this.getOne({ id: userId })
      if (user && user['id']) {
        const encrypted_id = user['encrypted_id']
        const where = {
          ref_id: encrypted_id
        }
        const fields = "id,mid,adjusted_net,processing_volume"
        const businessList = await businessService.getAll(where, "", fields)
        if (businessList && businessList.length > 0) {
          for (let k in businessList) {
            const business = businessList[k]
            const processing_volume = business['processing_volume']
            if (processing_volume) {
              amount += Number(processing_volume)
            }
          }
        }
      }
      return amount
    } catch (e) {
      console.log("getUserTotalReferralProcessingVolume error:::", e)
      return amount
    }
  }

  /**
  * getUserTotalReferralVolumnData
  */
  public getUserTotalReferralVolumnData = async (userId, dateOption = null) => {
    let data = {
      total_processing_volume: 0,
      total_adjusted_net: 0
    }
    try {
      const user = await this.getOne({ id: userId })
      if (user && user['id']) {
        const encrypted_id = user['encrypted_id']
        const fields = "id,mid,adjusted_net,processing_volume"
        let sql = `select ${fields} from ${TB_BUSINESS} where ref_id = '${encrypted_id}'`
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
            const adjusted_net = business['adjusted_net']
            if (adjusted_net) {
              data['total_adjusted_net'] += Number(adjusted_net)
            }
          }
        }
      }
      return data
    } catch (e) {
      console.log("getUserTotalReferralVolumnData error:::", e)
      return data
    }
  }

  /**
  * assign reward plan
  */
  public applyUsersRewardPlan = async () => {
    try {
      const userList = await this.getAll()
      if (userList && userList.length > 0) {
        for (let k in userList) {
          const user = userList[k]
          await this.applyUserRewardPlan(user)
        }
      }
      return userList
    } catch (e) {
      console.log("applyUsersRewardPlan error:::", e)
    }
  }

  public applyUserRewardPlan = async (user) => {
    try {
      const tierRewardAmount = await this.applyUserTierReward(user)
      const overrideRankRewardAmount = await this.applyUserOverrideRankReward(user)
      const data = {
        tierRewardAmount,
        overrideRankRewardAmount
      }
      return data
    } catch (e) {
      console.log("applyUserRewardPlan error:::", e)
    }
  }

  public applyUserTierReward = async (user) => {
    let rewardAmount = 0
    try {
      const userId = user['id']
      const tierLevel = await this.getUserTierLevel(userId)
      const update_data = {
        tier: tierLevel
      }
      await this.update(update_data, { id: userId })

      const totalAdjustedNet = await this.getUserTotalReferralAdjustedNet(userId)
      //const totalProcessingVolume = await this.getUserTotalReferralProcessingVolume(userId)
      if (tierLevel === TIER_TYPE.TIER_4) {
        rewardAmount = totalAdjustedNet * 22.5 / 100
      }
      else if (tierLevel === TIER_TYPE.TIER_3) {
        rewardAmount = totalAdjustedNet * 27 / 100
      }
      else if (tierLevel === TIER_TYPE.TIER_2) {
        rewardAmount = totalAdjustedNet * 31.5 / 100
      }
      else if (tierLevel === TIER_TYPE.TIER_1) {
        rewardAmount = totalAdjustedNet * 36 / 100
      }
      if (rewardAmount > 0) {
        const desc = `Reward for ${TIER_TYPE_TEXT[tierLevel]}`
        await rewardFundsHistoryService.addFund(user, rewardAmount, REWARD_TYPE.TIER, desc)
      }
      return rewardAmount
    } catch (e) {
      console.log("applyUserTierReward error:::", e)
      return rewardAmount
    }
  }

  public applyUserOverrideRankReward = async (user) => {
    let rewardAmount = 0
    try {
      const userId = user['id']
      const rank = await this.getUserOverrideRank(userId)
      const update_data = {
        rank: rank
      }
      await this.update(update_data, { id: userId })

      let totalReferralAdjustedNet = 0
      const referralUserList = await this.getAll({ ref_id: user['encrypted_id'] })
      if (referralUserList && referralUserList.length > 0) {
        for (let k in referralUserList) {
          const referralUser = referralUserList[k]
          const referralUserId = referralUser['id']
          const totalAdjustedNet = await this.getUserTotalReferralAdjustedNet(referralUserId)
          totalReferralAdjustedNet += totalAdjustedNet
        }
      }
      if (rank === RANK_TYPE.SILVER) {
        rewardAmount = totalReferralAdjustedNet * 2.5 / 100
      }
      else if (rank === RANK_TYPE.GOLD) {
        rewardAmount = totalReferralAdjustedNet * 5 / 100
      }
      else if (rank === RANK_TYPE.PLATINUM) {
        rewardAmount = totalReferralAdjustedNet * 10 / 100
      }

      if (rewardAmount > 0) {
        const desc = `Reward for ${RANK_TYPE_TEXT[rank]}`
        await rewardFundsHistoryService.addFund(user, rewardAmount, REWARD_TYPE.OVERRIDE_RANK, desc)
      }
      return rewardAmount
    } catch (e) {
      console.log("applyUserOverrideRankReward error:::", e)
      return rewardAmount
    }
  }

  public checkProspectDailyLimitReached = async (user) => {
    try {
      let count = 0
      let sql = `select count(id) as cnt from ${TB_USER} where ref_id = '${user['encrypted_id']}'`
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

  public getUserMerchantCount = async (user, merchantType = MERCHANT_STATUS.ACTIVE) => {
    try {
      let count = 0
      let encrypted_id = user['encrypted_id']
      let sql = ""
      sql = `select count(id) as cnt from ${TB_BUSINESS} as a where a.ref_id = '${encrypted_id}'`;
      if (merchantType) {
        sql += ` and a.status = ${merchantType}`;  // Append merchantType condition
      }
      const rows = await this.query(sql)
      if (rows && rows.length > 0) {
        count = rows[0]['cnt']
      }
      if (empty(count)) count = 0
      return count
    } catch (e) {
      console.log("getUserMerchantCount error:::", e)
      return 0
    }
  }

  public getUserPartnerCount = async (user, status = BRAND_PARTNER_STATUS.ACTIVE) => {
    try {
      let count = 0
      let encrypted_id = user['encrypted_id']
      let sql = ""

      sql = `select count(id) as cnt from ${TB_USER} as a where a.ref_id = '${encrypted_id}'`;
      if (status) {
        sql += ` and a.status = '${status}'`;
      }
      console.log(`getUserPartnerCount sql:::`, sql)
      const rows = await this.query(sql)
      if (rows && rows.length > 0) {
        count = rows[0]['cnt']
      }
      if (empty(count)) count = 0
      return count
    } catch (e) {
      console.log("getUserPartnerCount error:::", e)
      return 0
    }
  }
}

export const userService = new UserService();
