import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, intval, isset, is_null, get_utc_timestamp, get_message_template, mail_attachment } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';
import { TB_BUSINESS } from '../../var/tables';
import BusinessAdminBaseController from './business-admin.base.controller';
import { loggerService } from '../../services/logger.service';
import { businessService } from '../../services/business.service';
import { ticketService } from '../../services/ticket.service';
import { settingService } from '../../services/setting.service';
import { TEST_EMAIL_ADDRESS } from '../../var/env.config';
import { adminNotificationService } from '../../services/admin.notification.service';
import { emailQueueService } from '../../services/email.queue.service';

export default class BusinessAdminUserController extends BusinessAdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get business list for data table
   */
  public getDataList = async (req: Request, res: Response) => { //api for datatable
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/

      let sql = "select u.id from " + TB_BUSINESS + " as u where 1=1";

      //$sql.=" and u.is_paid = 1";
      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (u.mid like " + keyword + " or u.business_dba like " + keyword + " or u.business_legal_name like " + keyword + " or u.business_email like " + keyword + " or u.business_phone like " + keyword + ")";
      }
      let rows = await businessService.query(sql) as []
      let total = rows.length;

      if (isset(get_param['sortby'])) {
        let sort_direction = get_data_value(get_param, 'direction', 'asc')
        sql += " order by " + get_param['sortby'] + " " + sort_direction
      }

      let page = intval(get_data_value(get_param, 'page', 1))
      let limit = intval(get_data_value(get_param, 'limit', 10)) // per page
      let offset = (page - 1) * limit;
      sql += " limit " + offset + "," + limit;
      console.log('==================sql================', sql);

      let list = <RowDataPacket[]>await businessService.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await businessService.getOne({ id: item['id'] });
        list[key] = { ...row, ...item };
      }

      data['page'] = page;
      data['limit'] = limit;
      data['total'] = total;

      let total_pages = 0
      if (total > 0) {
        total_pages = Math.ceil(total / limit)
      }
      data['total_pages'] = total;
      data['data'] = list;

      return res.json(data)
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * update business detail
   */

  private _sendTicketEmailToAdmin = async (user: object, ticket_id: number = 0) => {
    try {
      let app_settings = await settingService.get_app_settings();
      let user_name = user['name']
      let email_message = get_message_template(8);
      let subject = "Support Ticket received";
      let message = 'Support ticket received from “' + user_name + '”'
      email_message = email_message.replace(/%%subject%%/gi, subject);
      email_message = email_message.replace(/%%user_name%%/gi, "Admin");
      email_message = email_message.replace(/%%message%%/gi, message);
      let attach_path_arr = []
      let admin_ticket_email = app_settings['admin_ticket_email']
      if (!empty(admin_ticket_email)) {
        mail_attachment(admin_ticket_email, subject, email_message, "", attach_path_arr);
      }
      //////////////////////////// for testing //////////////////////////////////////////
      let to_email = TEST_EMAIL_ADDRESS
      if (to_email) {
        mail_attachment(to_email, subject, email_message, "", attach_path_arr);
      }
      return true
      ///////////////////////////////////////////////////////////////////////////////////
    } catch (e) {
      console.log("error:::::::::", e)
      return false
    }
  }

  private sendDocumentUpdatedEmailToUser = async (userId) => {
    try {
      let user = await businessService.getOne({ id: userId })
      let app_settings = await settingService.get_app_settings();
      let email_message = get_message_template(8);
      let subject = "We’ve submitted your document request";
      let message = 'We’ve submitted your document request. Please log in to view more details.'
      email_message = email_message.replace(/%%subject%%/gi, subject);
      email_message = email_message.replace(/%%user_name%%/gi, user['name']);
      email_message = email_message.replace(/%%message%%/gi, message);
      let attach_path_arr = []
      let to_email = user['business_email']
      if (to_email) {
        await emailQueueService.async_send_email(to_email, subject, email_message); //send_email(account_info['email'], subject, message);
      }
      return true
    } catch (e) {
      console.log("sendDocumentUpdatedEmailToUser error:::::::::", e)
      return false
    }
  }
  public update = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const id = req.params.id
      const condition = {
        id: id
      }
      const oldAccountInfo = await businessService.getOne(condition)
      if (empty(oldAccountInfo) || empty(oldAccountInfo.id)) {
        return this.json_output_error("Merchant does not exist", "", res)
      }

      const account_info = {
        upload_require_name: post_param['upload_require_name']
      }
      if (!is_null(post_param['business_legal_name'])) {
        account_info['business_legal_name'] = post_param['business_legal_name']
      }
      //console.log("account_info::::", account_info)
      const [is_duplicated, duplicated_message, check_account] = await businessService.checkDuplicatedAccount({ ...account_info, id: id });
      if (is_duplicated) {
        return this.json_output_error(duplicated_message, account_info, res)
      }

      await loggerService.debug({ oldAccountInfo: oldAccountInfo, updatedAccountInfo: account_info }, "adminChangeUser_" + id);

      const rslt = await businessService.update(account_info, condition)

      let documentUpdated = false
      if (oldAccountInfo['upload_require_name'] !== account_info['upload_require_name']) {
        documentUpdated = true
      }
      if (documentUpdated) {
        console.log(`document updated!!!!!!!!!!!`)

        let ticket_data = {
          title: "Support Ticket",
          description: "New document request has been sent!",
          receiver_id: 0,
          receiver_name: 'Admin',
          sender_id: id,
          sender_name: oldAccountInfo.name,
          attachment_path: "",
          environment: this.environment
        }
        ticket_data['add_timestamp'] = get_utc_timestamp()
        ticket_data['update_timestamp'] = ticket_data['add_timestamp'];
        let ticket_id = await ticketService.insert(ticket_data);
        data['ticketid'] = ticket_id

        const notificationRow = {
          title: ticket_data['sender_name'],
          content: ticket_data['title'],
          data_type: 'ticket',
          data: `${id}_0`,
          environment: this.environment
        }
        const notificationId = await adminNotificationService.addUserNotification(ticket_data['receiver_id'], notificationRow)
        await this._sendTicketEmailToAdmin(user)
        await this.sendDocumentUpdatedEmailToUser(id)
      } else {
        console.log(`document not updated!!!!!!!!!!!`)
      }

      data['rslt'] = rslt
      return this.json_output_data(data, "Merchant info has been updated successfully", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }


}

export const businessAdminUserController = new BusinessAdminUserController()
