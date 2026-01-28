import { isObject } from "lodash";
import { TB_LOGS } from "../var/tables";
import { BaseService } from "./base.service";

export default class LoggerService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_LOGS;
  }

  /**
   * add a servre log for debugging
   */  
  public debug = async (message?: object | string | any, log_source: string = "main") => {
    let log_type = 'debug'
    let log_id = await this.add_log(log_type, message, log_source)
    return log_id;
  }

  /**
   * add a server log for error
   */  
  public error = async (message?: object | string | any, log_source: string = "main") => {
    let log_type = 'error'
    let log_id = await this.add_log(log_type, message, log_source)
    return log_id;
  }

  /**
   * add a server log for warning
   */  
  public info = async (message?: object | string | any, log_source: string = "main") => {
    let log_type = 'info'
    let log_id = await this.add_log(log_type, message, log_source)
    return log_id;
  }

  /**
   * add a server log
   */
  public add_log = async (log_type: string, message: object | string | any, log_source: string = "main") => {
    try {
      let log_content: string = ""
      if (isObject(message)) {
        log_content = JSON.stringify(message)
      } else {
        log_content = <string>message
      }

      let log_data = {
        log_type: log_type,
        log_content: log_content,
        log_source: log_source
      }
      let log_id = await this.insert(log_data)
      return log_id;
    } catch (e) {
      return false
    }
  }

}

export const loggerService = new LoggerService();
