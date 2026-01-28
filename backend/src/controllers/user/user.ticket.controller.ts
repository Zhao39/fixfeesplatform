import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, get_message_template, get_utc_timestamp, intval, isset, mail_attachment } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';
import { TEST_EMAIL_ADDRESS } from '../../var/env.config';

import UserBaseController from './user.base.controller';
import { TB_TICKET } from '../../var/tables';
import { ticketService } from '../../services/ticket.service';
import FileUploader from '../../library/fileuploader';
import { settingService } from '../../services/setting.service';
import { ticketMessageService } from '../../services/ticket.message.service';
import { adminNotificationService } from '../../services/admin.notification.service';

export default class UserTicketController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get ticket list for data table
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
      let sql = ""
      sql = "select * from " + TB_TICKET + " where sender_id = " + user['id'];
      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (sender_name like " + keyword + " or title like " + keyword + " or description like " + keyword + ")";
      }
      if (isset(get_param['item_type']) && get_param['item_type'] !== "") {
        let item_type = mysql.escape(get_param['item_type']);
        sql += " and status = " + item_type;
      }

      sql += ` and environment = '${this.environment}'`

      let rows = await ticketService.query(sql) as []
      let total = rows.length;

      if (isset(get_param['sortby'])) {
        let sort_direction = get_data_value(get_param, 'direction', 'asc')
        sql += " order by " + get_param['sortby'] + " " + sort_direction
      }

      //console.log('==================sql================', sql);
      let page = intval(get_data_value(get_param, 'page', 1))
      let limit = intval(get_data_value(get_param, 'limit', 10)) // per page
      let offset = (page - 1) * limit;
      sql += " limit " + offset + "," + limit;
      let list = <RowDataPacket[]>await ticketService.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await ticketService.getOne({ id: item['id'] });
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
   * submit a ticket
   */  
  public submitTicket = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let is_limited = await ticketService._ticket_is_limited(user);
      if (is_limited) {
        return this.json_output_error("Maximum ticket limit reached,<br/> please try again in 24 hours.", "", res)
      }
      //console.log('============req files==============', req['files'] )

      let attachment_path = ""
      if (!empty(req['files'])) {
        let myUploader = new FileUploader(req['files'])
        //console.log("=================req['files']=================", req['files'])
        const [uploadResult, fileName] = await myUploader.uploadFile('upload_file', "ticket")
        //console.log('uploadResult, fileName', uploadResult, fileName)
        if (!uploadResult) {
          let errorMsg = <string>fileName
          return this.json_output_error(errorMsg, "", res)
        } else {
          attachment_path = <string>fileName
        }
      }

      let title = get_data_value(post_param, 'title')
      let description = get_data_value(post_param, 'description')
      if (title == "") {
        return this.json_output_error("Subject is empty", "", res)
      }
      let update_data = {
        title: title,
        description: description,
        sender_id: user['id'],
        sender_name: user['name'],
        receiver_id: 0,
        receiver_name: 'Admin',
        attachment_path: attachment_path
      }
      update_data['add_timestamp'] = get_utc_timestamp()
      update_data['update_timestamp'] = update_data['add_timestamp'];
      let id = await ticketService.insert(update_data);
      data['ticketid'] = id

      const notificationRow = {
        title: update_data['sender_name'],
        content: update_data['title'],
        data_type: 'ticket',
        data: `${id}_0`,
      }
      const notificationId = await adminNotificationService.addUserNotification(update_data['receiver_id'], notificationRow)

      await this._sendTicketEmailToAdmin(user)
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error:::::::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * send a ticket email to admin
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

  /**
   * get ticket detail
   */  
  public getTicketDetail = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let id = get_data_value(get_param, 'ticketid')
      let condition = { id: id }
      let info = await ticketService.get_detail(condition);
      if (empty(info)) info = null
      await ticketMessageService._mark_as_read(id, user['id'])
      data['ticket_info'] = info;
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error:::::::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * submit a ticket message
   */  
  public submitTicketMessage = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      //console.log('============req files==============', req['files'] )

      let attachment_path = ""
      if (!empty(req['files'])) {
        let myUploader = new FileUploader(req['files'])
        const [uploadResult, fileName] = await myUploader.uploadFile('upload_file', "ticket")
        console.log('uploadResult, fileName', uploadResult, fileName)
        if (!uploadResult) {
          let errorMsg = <string>fileName
          return this.json_output_error(errorMsg, "", res)
        } else {
          attachment_path = <string>fileName
        }
      }

      const ticket_id = get_data_value(post_param, 'ticket_id')
      let condition = { id: ticket_id }
      let ticket_info = await ticketService.getOne(condition);
      if (empty(ticket_info)) {
        return this.json_output_error("Invalid request", "", res)
      }
      if (intval(ticket_info['sender_id']) !== intval(user['id'])) {
        return this.json_output_error("Permission is denied", "", res)
      }
      if (ticket_info['status'] == 'Closed') {
        return this.json_output_error("Ticket is already closed", "", res)
      }
      let message = get_data_value(post_param, 'description')
      if (message == "") {
        return this.json_output_error("Your reply is empty", "", res)
      }
      let update_data = {
        ticket_id: ticket_id,
        sender_id: user['id'],
        sender_name: user['name'],
        receiver_id: 0,
        receiver_name: 'Admin',
        message: message
      }
      update_data['attachment_path'] = attachment_path
      update_data['add_timestamp'] = get_utc_timestamp()
      let msg_id = await ticketMessageService.insert(update_data);
      let ticket_update_data = {
        status: 'Replied',
        last_msg_id: msg_id,
        update_timestamp: update_data['add_timestamp']
      }
      await ticketService.update(ticket_update_data, { id: ticket_id })
      await ticketMessageService._mark_as_read(ticket_id, user['id'])

      const notificationRow = {
        title: update_data['sender_name'],
        content: update_data['message'],
        data_type: 'ticket',
        data: `${ticket_id}_${msg_id}`,
      }
      const notificationId = await adminNotificationService.addUserNotification(update_data['receiver_id'], notificationRow)

      await this._sendTicketEmailToAdmin(user)

      let ticket_info_updated = await ticketService.getOne({ id: ticket_id });
      data['ticket_info'] = ticket_info_updated
      return this.json_output_data(data, "Your reply has been submitted", res);
    } catch (e) {
      console.log("error:::::::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * close a ticket
   */  
  public closeTicket = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      let id = get_data_value(post_param, 'id')
      let condition = {
        id: id
      }
      let info = await ticketService.get_detail(condition);
      if (empty(info)) {
        return this.json_output_error("Invalid request", "", res);
      }
      if (intval(info['sender_id']) !== intval(user['id'])) {
        return this.json_output_error("Permission is denied", "", res);
      }
      await ticketService.update({ status: 'Closed' }, condition);
      return this.json_output_data(data, "Ticket has been closed successfully", res);
    } catch (e) {
      console.log("error:::::::::", e)
      return this.json_output_error("", "", res)
    }
  }

}

export const userTicketController = new UserTicketController()
