import { console_log, empty, get_utc_timestamp } from "../helpers/misc";
import { TB_ADMIN_NOTIFICATION } from "../var/tables";
import { BaseService } from "./base.service";
import * as mysql from 'mysql2';
import { RowDataPacket } from 'mysql2';
import { ENVIRONMENT, NOTIFICATION_TYPE, USER_NOTIFICATION_STATUS } from "../var/config";
import { socketInstance } from "../index";

export default class AdminNotificationService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_ADMIN_NOTIFICATION;
  }

  /**
   * add a notification record for admin
   */
  public addUserNotification = async (userId, row) => {
    try {
      const currentTimestamp = get_utc_timestamp()
      const item = {
        user_id: userId,
        notify_type: NOTIFICATION_TYPE.ALARM,
        status: USER_NOTIFICATION_STATUS.NEW,
        add_timestamp: currentTimestamp,
        update_timestamp: currentTimestamp,
        ...row
      }
      const id = await this.insert(item)
      return id
    } catch (e) {
      console.log("addUserNotification error:::::::::", userId, row, e)
      return false
    }
  }

  /**
   * get notification list for admin
   */  
  public getUserNotificationList = async (userId, status = "", environment = null) => {
    try {
      console_log(`getUserNotificationList environment::::`, environment)
      if (environment === null) {
        environment = ENVIRONMENT.PARTNER
      }

      const currentTimestamp = get_utc_timestamp()
      let sql = `select id from ${TB_ADMIN_NOTIFICATION} where 1=1`

      sql += ` and environment = '${environment}'`

      if (userId) {
        sql += ` and user_id = ${userId}`
      }
      if (status) {
        // const statusList = status.split(',')
        // sql += ` and status in ('${statusList.join("','")}')`

        sql += ` and status = '${status}'`
      }
      sql += " order by add_timestamp desc"
      // sql += " limit " + offset + "," + limit;
      //console_log(`getUserNotificationList sql::::::`, sql)

      let list = <RowDataPacket[]>await this.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await this.getOne({ id: item['id'] });
        list[key] = { ...row, ...item };
      }
      //console_log(`getUserNotificationList list::::::`, list)
      return list
    } catch (e) {
      console.log("getUserNotificationList error:::::::::", userId, status, e)
      return []
    }
  }

  /**
   * read notification for admin
   */  
  public readUserNotification = async (userId, notificationId = null) => {
    try {
      const currentTimestamp = get_utc_timestamp()
      const condition = {
        user_id: userId
      }
      if (notificationId) {
        condition['id'] = notificationId
      }
      const update_data = {
        status: USER_NOTIFICATION_STATUS.READ,
        update_timestamp: currentTimestamp
      }
      await this.update(update_data, condition)
      return true
    } catch (e) {
      console.log("readUserNotification error:::::::::", userId, notificationId, e)
      return false
    }
  }

  /**
   * read a notfication for ticket
   */  
  public readUserTicketNotification = async (userId, ticket_id, ticket_msg_id = "") => {
    try {
      const currentTimestamp = get_utc_timestamp()

      let keyword = `${ticket_id}`
      if (ticket_msg_id) {
        keyword = `${keyword}_${ticket_msg_id}`
      } else {
        keyword = `${keyword}_`
      }
      keyword = "%" + keyword + "%";
      keyword = mysql.escape(keyword);

      let condition = `user_id = ${userId} and data_type = 'ticket' and status = '${USER_NOTIFICATION_STATUS.NEW}' and data like ` + keyword;
      let sql = `update ${TB_ADMIN_NOTIFICATION} set status='${USER_NOTIFICATION_STATUS.READ}', update_timestamp=${currentTimestamp} where ` + condition
      //let sql = `select id from ${TB_USER_NOTIFICATION} where ` + condition
      //console.log(`sql::::::::::::::::::`, sql)
      await this.query(sql)
      socketInstance.reloadAdminNotification(userId)

      return true
    } catch (e) {
      console.log("readUserTicketNotification error:::::::::", userId, ticket_id, ticket_msg_id, e)
      return false
    }
  }

}

export const adminNotificationService = new AdminNotificationService();
