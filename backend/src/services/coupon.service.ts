import * as mysql from 'mysql2';
import { empty, intval } from "../helpers/misc";
import { TB_COUPON, TB_USER } from "../var/tables";
import { BaseService } from "./base.service";
import { BACKEND_LOCATION, DB_HOST } from "../var/env.config";
import { LICENSE_TRIAL_PRICE } from '../var/config';

export default class CouponService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_COUPON;
  }

  /**
   * check if coupon info is correct
   */  
  public checkCouponIsValid = async (coupon: string) => {
    try {
      let condition = {
        name: coupon
      };
      let row = await this.getOne(condition);
      if (!empty(row)) {
        if (intval(row['status']) === 1) {
          return row;
        }
      }
      return false
    } catch (e) {
      console.log('checkCouponIsValid error:::', e)
    }
  }

  /**
   * check if current coupon exist
   */  
  public checkCouponExists = async (info: object, id: number) => {
    try {
      let name = info['name'];
      name = mysql.escape(name);
      let sql = "select id from " + TB_COUPON + " where 1=1"
      sql += " and (name = " + name + ")";
      sql += " and id <> " + id
      let row = await this.query(sql);
      if (empty(row)) {
        return false
      } else {
        return true
      }
    } catch (e) {
      console.log('checkCouponExists error:::', e)
    }
  }

  /**
   * check if coupon is already used by a user
   */  
  public checkCouponSecurity = async (clientIp, coupon = "") => {
    if (BACKEND_LOCATION === 'localhost' && DB_HOST === 'localhost') {
      return true //true false
    }

    try {
      let ip = mysql.escape(clientIp);
      let sql = `select id from ${TB_USER} where ip = ${ip} and user_verified = '1'`
      if (!empty(coupon)) {
        coupon = mysql.escape(coupon);
        sql += ` and coupon = ${coupon}`
      } else {
        sql += ` and coupon <> ''`
      }
      sql += ` limit 0,1`
      //console.log("sql:::::::", sql)
      let rowList = await this.query(sql);
      if (empty(rowList)) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log("checkCouponSecurity error:::::::", e)
      return false
    }
  }

  /**
   * get a price coupon applied
   */  
  public getCouponAppliedPrice = async (name_or_row, amount) => {
    try {
      amount = Number(amount)
      let row = null
      const inputType = typeof name_or_row;
      if (inputType === "number" || inputType === "string") {
        let condition = {
          name: name_or_row
        };
        row = await this.getOne(condition);
      } else {
        row = name_or_row
      }

      if (row) {
        const type = row.type
        const value = row.value
        if (type === 0) { // day trial coupon type
          amount = LICENSE_TRIAL_PRICE
        }
        else if (type === 1) { // percent discount coupon type
          amount = Math.floor(amount * value / 100);
        }
        else if (type === 2) { // 100% discount forever
          amount = 0
        }
        return amount
      }
    } catch (e) {
      console.log('getCouponAppliedPrice error:::', e)
    }
    return amount
  }
}

export const couponService = new CouponService();
