import { MINIMUM_WITHDRAWAL_AMOUNT, REFERRAL_FEE } from "../var/config";
import { empty, floatval, get_message_template, get_utc_timestamp } from "../helpers/misc";
import { TB_REFERRAL_FUND_HISTORY } from "../var/tables";
import { BaseService } from "./base.service";
import { userService } from "./user.service";
import { emailQueueService } from "./email.queue.service";

export default class ReferralFundsHistoryService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_REFERRAL_FUND_HISTORY;
  }

  /**
   * add a referral fund into sponsor's wallet
   */
  public addReferralFund = async (user_info, payment_amount, add_timestamp = 0) => { //user_info: user who pays
    try {
      return false // does not use this function anymore

      if (empty(user_info)) {
        return false;
      }

      let sponsor_encrypted_id = user_info['ref_id']
      let sponsor_info = await userService.getOne({ encrypted_id: sponsor_encrypted_id })
      if (empty(sponsor_encrypted_id) || empty(sponsor_info)) {
        return false;
      }

      if(Number(payment_amount) <= 1) {
        return false
      }

      let referral_amount = payment_amount * REFERRAL_FEE / 100;

      if (referral_amount > 0) {
        if (empty(add_timestamp) || add_timestamp === 0) {
          add_timestamp = get_utc_timestamp();
        }
        const cur_timestamp = add_timestamp

        let sponsor_balance = floatval(sponsor_info['balance']);
        sponsor_balance = sponsor_balance + referral_amount;
        await userService.update({ balance: sponsor_balance.toFixed(2) }, { id: sponsor_info['id'] })

        let row = {
          user_id: sponsor_info['id'], //user who will get referral func. (this is sponsor)
          child_id: user_info['id'], //user who pays (this is referral user)
          child_name: user_info['name'],
          amount: referral_amount, //referral amount
          add_timestamp: cur_timestamp
        }
        await this.insert(row)

        ///////////////////////////////// send email to the sponsor ///////////////////////////////////////////
        let subject = "You just got paid!";
        let message = get_message_template(5);
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, sponsor_info['name']);
        message = message.replace(/%%minimum_withdraw_price%%/gi, `${MINIMUM_WITHDRAWAL_AMOUNT}`);
        let rslt = await emailQueueService.async_send_email(sponsor_info['email'], subject, message);
        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("error::::", e)
      return false
    }
  }

}

export const referralFundsHistoryService = new ReferralFundsHistoryService();
