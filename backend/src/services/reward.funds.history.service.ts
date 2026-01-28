import { MINIMUM_WITHDRAWAL_AMOUNT, REFERRAL_FEE } from "../var/config";
import { empty, floatval, get_message_template, get_utc_timestamp } from "../helpers/misc";
import { TB_REWARD_FUND_HISTORY } from "../var/tables";
import { BaseService } from "./base.service";
import { userService } from "./user.service";
import { emailQueueService } from "./email.queue.service";

export default class RewardFundsHistoryService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_REWARD_FUND_HISTORY;
  }

  /**
   * add a reward fund into user's wallet
   */
  public addFund = async (user_info, referral_amount, type, description = "", add_timestamp = 0) => { //type: tier, rank
    try {
      if (referral_amount > 0) {
        if (empty(add_timestamp) || add_timestamp === 0) {
          add_timestamp = get_utc_timestamp();
        }
        const cur_timestamp = add_timestamp

        let balance = Number(user_info['balance']);
        balance = balance + referral_amount;
        await userService.update({ balance: balance.toFixed(2) }, { id: user_info['id'] })

        let row = {
          user_id: user_info['id'], //user who will get reward fund
          type: type,
          description: description,
          amount: referral_amount, //referral amount
          add_timestamp: cur_timestamp
        }
        await this.insert(row)

        ///////////////////////////////// send email to the user ///////////////////////////////////////////
        let subject = "You just got paid!";
        let message = get_message_template(5);
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, user_info['name']);
        message = message.replace(/%%minimum_withdraw_price%%/gi, `${MINIMUM_WITHDRAWAL_AMOUNT}`);
        let rslt = await emailQueueService.async_send_email(user_info['email'], subject, message);
        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("addFund error::::", e)
      return false
    }
  }

}

export const rewardFundsHistoryService = new RewardFundsHistoryService();
