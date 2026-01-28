import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, get_message_template, get_utc_timestamp, intval, isset, mail_attachment, send_email } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';
import AdminBaseController from './admin.base.controller';
import { TB_TICKET } from '../../var/tables';
import { ticketService } from '../../services/ticket.service';
import FileUploader from '../../library/fileuploader';
import { ticketMessageService } from '../../services/ticket.message.service';
import { userService } from '../../services/user.service';
import { userNotificationService } from '../../services/user.notification.service';

export default class AdminTicketController extends AdminBaseController {
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
      sql = "select * from " + TB_TICKET + " where receiver_id = 0";
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
   * get ticket detail from id
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
      if (empty(info)) info = {}
      await ticketMessageService._mark_as_read(id, 0)
      data['ticket_info'] = info;
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error:::::::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * add ticket nessage
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
      let ticket_id = get_data_value(post_param, 'ticket_id')
      let condition = { id: ticket_id }
      let ticket_info = await ticketService.getOne(condition);
      if (empty(ticket_info)) {
        return this.json_output_error("Invalid request", "", res)
      }
      if (ticket_info['status'] === 'Closed') {
        return this.json_output_error("Ticket is already closed", "", res)
      }

      let message = get_data_value(post_param, 'description')
      if (message == "") {
        return this.json_output_error("Your reply is empty", "", res)
      }

      let attachment_path = ""
      if (!empty(req['files'])) {
        let myUploader = new FileUploader(req['files'])
        const [uploadResult, fileName] = await myUploader.uploadFile('upload_file', "ticket")
        console.log('-----------------uploadResult, fileName--------------', uploadResult, fileName)
        if (!uploadResult) {
          let errorMsg = <string>fileName
          return this.json_output_error(errorMsg, "", res)
        } else {
          attachment_path = <string>fileName
        }
      }

      let to_email = intval(get_data_value(post_param, 'to_email'));
      if (to_email === 1) {
        let update_data = {
          message: message
        }
        if (attachment_path !== "") {
          update_data['attachment_path'] = attachment_path
        }

        let receiver_info = await userService.getOne({ id: ticket_info['sender_id'] })
        if (!empty(receiver_info)) {
          this.send_ticket_email(update_data, receiver_info);
        }
        return this.json_output_data('1', "Ticket email has been sent successfully", res);
      } else {
        let sender_admin_id = user['admin_id'];
        let sender_name = (user['admin_type'] == 'assistant' ? "Staff" : "Admin");

        let update_data = {
          ticket_id: ticket_id,
          sender_id: 0,
          sender_admin_id: sender_admin_id,
          sender_name: sender_name,
          receiver_id: ticket_info['sender_id'],
          receiver_name: ticket_info['sender_name'],
          message: message
        }
        if (attachment_path !== "") {
          update_data['attachment_path'] = attachment_path
        }
        update_data['add_timestamp'] = get_utc_timestamp()
        let msg_id = await ticketMessageService.insert(update_data);
        let ticket_update_data = {
          status: 'Answered',
          last_msg_id: msg_id,
          update_timestamp: update_data['add_timestamp']
        }
        await ticketService.update(ticket_update_data, { id: ticket_id });
        await ticketMessageService._mark_as_read(ticket_id, 0)

        /**************************************** send ticket email ***************************************************/
        let receiver_info = await userService.getOne({ id: ticket_info['sender_id'] });
        if (!empty(receiver_info)) {
          let email_message = get_message_template(9);
          let subject = "We replied to your ticket!";
          email_message = email_message.replace(/%%subject%%/gi, subject);
          email_message = email_message.replace(/%%user_name%%/gi, receiver_info['name']);
          send_email(receiver_info['email'], subject, email_message);

          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          const notificationRow = {
            user_id: receiver_info['id'],
            email: receiver_info['email'],
            title: update_data['sender_name'],
            content: update_data['message'],
            data_type: 'ticket',
            data: `${ticket_id}_${msg_id}`,
          }
          const notificationId = await userNotificationService.addUserNotification(receiver_info['id'], notificationRow)
        }
        /**************************************** end send ticket email ***************************************************/
      }

      let ticket_info_updated = await ticketService.getOne({ id: ticket_id });
      data['ticket_info'] = ticket_info_updated
      return this.json_output_data(data, "Your reply has been submitted", res);
    } catch (e) {
      console.log("error:::::::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * send ticket email
   */
  private send_ticket_email = async (update_data: object, receiver_info: object) => { // send email to user (email only)
    try {
      let email_message = get_message_template(10);
      let subject = "We replied to your ticket!";
      email_message = email_message.replace(/%%subject%%/gi, subject);
      email_message = email_message.replace(/%%user_name%%/gi, receiver_info['name']);
      email_message = email_message.replace(/%%message%%/gi, update_data['message']);
      let attach_path_arr = []
      if (isset(update_data['attachment_path']) && !empty(update_data['attachment_path'])) {
        attach_path_arr.push(update_data['attachment_path'])
      }
      mail_attachment(receiver_info['email'], subject, email_message, "", attach_path_arr);
    } catch (e) {
      console.log("error:::::::::", e)
    }
  }

}

export const adminTicketController = new AdminTicketController()
