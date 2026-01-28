import { ENVIRONMENT, TOKEN_EXPIRE_TIMESTAMP } from "../var/config";
import { TB_TOKENS } from "../var/tables";
import { BaseService } from "./base.service";
import { get_utc_timestamp } from "../helpers/misc";

export default class TokenService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_TOKENS;
  }

  /**
   * remove all JWT tokens for a user
   */
  public clearUserTokens = async (environment = null, with_admin = false) => {
    if (environment === null) {
      environment = ENVIRONMENT.PARTNER // by default
    }

    let condition = {}
    if (environment === ENVIRONMENT.PARTNER) {
      condition = {
        user_type: "user"
      }
    } else if (environment === ENVIRONMENT.BUSINESS) {
      condition = {
        user_type: "business"
      }
    }

    await this.delete(condition)
    if (with_admin) {
      if (environment === ENVIRONMENT.PARTNER) {
        condition = {
          user_type: "admin"
        }
      } else if (environment === ENVIRONMENT.BUSINESS) {
        condition = {
          user_type: "business_admin"
        }
      }
      await this.delete(condition)
    }
    return true;
  }

  /**
   * check and update token login timestamp
   */
  public checkTokenExpired = async (token_row) => {
    try {
      const cur_timestamp = get_utc_timestamp()
      const login_time = Number(token_row['login_time'])
      const diff = cur_timestamp - login_time
      if (diff > TOKEN_EXPIRE_TIMESTAMP) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log(`checkTokenExpired error:::`, e)
      return true
    }
  }
}

export const tokenService = new TokenService();
