import { TB_MEMBERSHIP } from "../var/tables";
import { BaseService } from "./base.service";

export default class MembershipService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_MEMBERSHIP;
  }

  /**
   * get membership detail
   */  
  public getDetail = async (membership) => {
    try {
      const membershipCondition = {
        id: membership
      }
      const membershipRow = await this.getOne(membershipCondition)
      if (membershipRow && membershipRow.id && membershipRow.meta_data) {
        membershipRow.meta_data = JSON.parse(membershipRow.meta_data)
      }
      return membershipRow
    } catch (e) {
      console.log("getDetail error:::", e)
      return false
    }
  }

}

export const membershipService = new MembershipService();
