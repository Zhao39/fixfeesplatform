import { console_log, empty, get_data_value, intval, isset } from '../helpers/misc'
import { tokenService } from '../services/token.service'
import { userService } from '../services/user.service'
import * as socket from 'socket.io'
import { TB_TICKET_MESSAGE } from '../var/tables'
import { ticketService } from '../services/ticket.service'
import { ticketMessageService } from '../services/ticket.message.service'
import { adminService } from '../services/admin.service'
import { userNotificationService } from '../services/user.notification.service'
import { ENVIRONMENT, USER_NOTIFICATION_STATUS } from '../var/config'
import { adminNotificationService } from '../services/admin.notification.service'
import { businessService } from '../services/business.service'
import { businessAdminService } from '../services/business.admin.service'

export const connected_client_list = {}

export class Socket {
  public io: socket.Server

  constructor(server: any) {
    this.io = new socket.Server(server, {
      cors: {
        origin: '*',
      }
    })
    //this.connected_client_list = {}
    this.connect()
  }

  public connect = () => {
    console_log(`------------Socket started---------------`)

    this.io.on('connection', (client: socket.Socket) => {
      // tslint:disable-next-line: no-console
      console_log(`------------Socket connected--------------- : ${client.id}`)
      console_log('connected_client_list', connected_client_list)
      console_log('Object.keys(connected_client_list)', Object.keys(connected_client_list))
      this.handlers(client)
      client.emit('message', 'test message from server')
    })
  }

  public handlers = (client: socket.Socket) => {
    this.updateConnectedClientList('add', client)

    client.on('disconnect', () => {
      // tslint:disable-next-line: no-console
      console_log(`------------Socket disconnected------------------ : ${client.id}`)
      console_log('Object.keys(connected_client_list)', Object.keys(connected_client_list))
      this.updateConnectedClientList('delete', client)
    })

    client.on("message", (message: any) => {
      console_log('-----------socket MESSAGE-------------', message);
      client.emit('message', 'Server reply message')
    })

    client.on("get_user_notification_data", async (param: any) => {
      //console_log("get_user_notification_data param:::", param)
      const user_notification_data = await this.getUserNotificationData(param, client)
      client.emit('get_user_notification_data', user_notification_data)
    })

    client.on("get_admin_notification_data", async (param: any) => {
      const admin_notification_data = await this.getAdminNotificationData(param, client)
      //console_log(`admin_notification_data:::::`, admin_notification_data)
      client.emit('get_admin_notification_data', admin_notification_data)
    })

    client.on("get_ticket_message_list", async (param: any) => {
      const ticketid = intval(get_data_value(param, 'ticketid'));
      const ticket_message_list = await this.getTicketMessageList(param, client)
      const output_data = {
        ticketid: ticketid,
        ticket_message_list: ticket_message_list
      }
      client.emit('get_ticket_message_list', output_data)
    })

    client.on("submit_new_ticket_message", async (param: any) => {
      console_log("on submit_new_ticket_message::::", param)
      console.log("paramparam:", param)
      const ticketid = intval(get_data_value(param, 'ticketid'));
      const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));

      const ticket_message_list = await this.getTicketMessageList(param, client)
      const output_data = {
        ticketid: ticketid,
        ticket_message_list: ticket_message_list
      }
      const ticket_info = await this.getTicketUserInfo(param, client)
      console_log("on submit_new_ticket_message ticket_info::::", ticket_info)
      if (!empty(ticket_info)) {
        //console_log('Object.keys(connected_client_list)', Object.keys(connected_client_list))

        let user_cleint_list = this.getClientsFromUserID(ticket_info['sender_id'])
        console_log('----------------user client list----------------', user_cleint_list)
        let admin_cleint_list = this.getClientsFromUserID(ticket_info['receiver_id'])
        console_log('----------------admin client list----------------', admin_cleint_list)

        const user_notification_data = await this.getUserNotificationDataFromUserID(ticket_info['sender_id'], environment)
        console_log("user_notification_data::::", user_notification_data)
        for (let i in user_cleint_list) {
          let client_info = user_cleint_list[i]
          console_log('---------send client id----------', client_info.id)
          this.io.sockets.to(client_info.id).emit('get_ticket_message_list', output_data)
          this.io.sockets.to(client_info.id).emit('get_user_notification_data', user_notification_data)
        }

        const admin_notification_data = await this.getAdminNotificationDataFromID(ticket_info['receiver_id'], environment)
        console_log(`submit_new_ticket_message admin_notification_data:::`, admin_notification_data)
        for (let i in admin_cleint_list) {
          let client_info = admin_cleint_list[i]
          //console_log('---------send admin client id----------', client_info.id)
          this.io.sockets.to(client_info.id).emit('get_ticket_message_list', output_data)
          this.io.sockets.to(client_info.id).emit('get_admin_notification_data', admin_notification_data)
        }
        //this.io.sockets.emit('get_ticket_message_list', output_data) //broadcast to all socket
        //this.io.emit('get_ticket_message_list', output_data)//broadcast to all socket
      }
    })

    client.on("read_ticket_message_list", async (param: any) => {
      const ticketid = intval(get_data_value(param, 'ticketid'));
      const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));

      const user = await this.readTicketMessageList(param, client)
      console_log(`read_ticket_message_list user::::::::::::::::::::::`, user)
      if (user['is_admin'] === '1') {
        const admin_notification_data = await this.getAdminNotificationData(param, client)
        console_log(`on read_ticket_message_list admin_notification_data::::::::::::::::::::::`, admin_notification_data)
        client.emit('get_admin_notification_data', admin_notification_data)
      } else {
        const user_notification_data = await this.getUserNotificationData(param, client)
        console_log(`on read_ticket_message_list user_notification_data::::::::::::::::::::::`, user_notification_data)
        client.emit('get_user_notification_data', user_notification_data)
      }
    })

    client.on("read_user_notification", async (param: any) => {
      console_log("on read_user_notification::::", param)
      const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));

      const user = await this.checkLogin(param, client)

      const id = intval(get_data_value(param, 'id'));
      //const notificationInfo = await userNotificationService.getOne({ id: id })

      await userNotificationService.readUserNotification(user['id'], id, environment)
      let user_cleint_list = this.getClientsFromUserID(user['id'])
      console_log('----------------user client list----------------', user_cleint_list)

      const user_notification_data = await this.getUserNotificationDataFromUserID(user['id'], environment)
      console_log("user_notification_data::::", user_notification_data)
      for (let i in user_cleint_list) {
        let client_info = user_cleint_list[i]
        console_log('---------send client id----------', client_info.id)
        this.io.sockets.to(client_info.id).emit('get_user_notification_data', user_notification_data)
      }
    })

    client.on("read_admin_notification", async (param: any) => {
      console_log("on read_admin_notification::::", param)
      const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));

      const user = await this.checkLogin(param, client)
      const adminId = 0

      const id = intval(get_data_value(param, 'id'));
      await adminNotificationService.readUserNotification(adminId, id)

      let admin_cleint_list = this.getClientsFromUserID(adminId)
      console_log('----------------admin client list----------------', admin_cleint_list)

      const admin_notification_data = await this.getAdminNotificationDataFromID(adminId, environment)
      console_log(`on read_admin_notification::::`, admin_notification_data)
      for (let i in admin_cleint_list) {
        let client_info = admin_cleint_list[i]
        //console_log('---------send admin client id----------', client_info.id)
        this.io.sockets.to(client_info.id).emit('get_admin_notification_data', admin_notification_data)
      }
    })

    client.on("do_logout", async (param: any) => {
      console_log('on do_logout')
      this.io.emit('do_logout', {})//broadcast to all socket
    })
  }

  /* action_type: add, delete */
  private updateConnectedClientList = (action_type: string, client: any, user_id: number = 0) => {
    let client_id: string = client.id
    let connected_client_info = get_data_value(connected_client_list, client_id)
    if (action_type === 'add') {
      if (!empty(connected_client_info)) {
        connected_client_info['user_id'] = user_id
        connected_client_list[client_id] = connected_client_info
        //console.log("connected_client_list:::::", connected_client_list)
      } else {
        connected_client_info = {}
        connected_client_info['user_id'] = user_id
        connected_client_info['client'] = { id: client_id }
        connected_client_list[client_id] = connected_client_info
      }
    } else if (action_type === 'delete') {
      if (!empty(connected_client_info)) {
        if (isset(connected_client_list[client_id])) {
          delete connected_client_list[client_id]
        }
      }
    }
  }
  public getClientsFromUserID = (user_id: number) => {
    let client_list = []
    for (let key in connected_client_list) {
      let info = connected_client_list[key]
      if (info['user_id'] === user_id) {
        client_list.push(info['client'])
      }
    }
    return client_list
  }

  /////////////////////////////////////// start functions for logged in users //////////////////////////////////////////////////////////
  private checkLogin = async (param: object, client_info: socket.Socket) => {
    const bearToken = get_data_value(param, 'token')
    const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));

    if (!empty(bearToken)) {
      let condition = { token: bearToken }
      let token_row = await tokenService.getOne(condition)
      if (!empty(token_row)) {
        if (token_row['user_type'] === 'user') {
          let user_id = token_row['user_id']
          let user_info = await userService.getOne({ id: user_id })
          if (!empty(user_info)) {
            user_info['is_admin'] = '0'
            //console_log('user_info', user_info);
            this.updateConnectedClientList('add', client_info, user_info['id'])
            return user_info
          }
        }
        else if (token_row['user_type'] === 'admin') {
          let admin_id = token_row['user_id']
          let user_info = await adminService.getOne({ admin_id: admin_id })
          if (!empty(user_info)) {
            user_info['id'] = admin_id
            user_info['is_admin'] = '1'
            //console_log('user_info', user_info);
            this.updateConnectedClientList('add', client_info, 0)
            return user_info
          }
        }
        else if (token_row['user_type'] === 'business') {
          let user_id = token_row['user_id']
          let user_info = await businessService.getOne({ id: user_id })
          if (!empty(user_info)) {
            user_info['is_admin'] = '0'
            //console_log('user_info', user_info);
            this.updateConnectedClientList('add', client_info, user_info['id'])
            return user_info
          }
        }
        else if (token_row['user_type'] === 'business_admin') {
          let admin_id = token_row['user_id']
          let user_info = await businessAdminService.getOne({ admin_id: admin_id })
          if (!empty(user_info)) {
            user_info['id'] = admin_id
            user_info['is_admin'] = '1'
            //console_log('user_info', user_info);
            this.updateConnectedClientList('add', client_info, 0)
            return user_info
          }
        }
      }
      return false;
    }
  }

  private getUserNotificationData = async (param: object, client_info: socket.Socket) => {
    const notificaiton_data = {}
    const user = await this.checkLogin(param, client_info)
    //console.log("getUserNotificationData user::::", user)

    if (empty(user)) {
      return notificaiton_data
    }

    const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));

    const user_id = user['id'];
    return await this.getUserNotificationDataFromUserID(user_id, environment)
  }
  private getUserNotificationDataFromUserID = async (user_id: number, environment = null) => {
    const user = await userService.getOne({ id: user_id })
    const notificaiton_data = {}
    // const unread_ticket_list = await ticketService.getUnreadTicketList(user_id)
    // notificaiton_data['unread_ticket_list'] = unread_ticket_list
    const notification_list = await userNotificationService.getUserNotificationList(user_id, USER_NOTIFICATION_STATUS.NEW, environment)
    notificaiton_data['notification_list'] = notification_list
    return notificaiton_data
  }
  private getAdminNotificationData = async (param: object, client_info: socket.Socket) => {
    const notificaiton_data = {}
    const user = await this.checkLogin(param, client_info)
    //console_log(`param, user, client_info::::`, param, user)
    if (empty(user)) {
      return notificaiton_data
    }

    const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));
    const user_id = 0
    return await this.getAdminNotificationDataFromID(user_id, environment)
  }
  private getAdminNotificationDataFromID = async (user_id: number, environment = null) => {
    const notificaiton_data = {}
    const notification_list = await adminNotificationService.getUserNotificationList(user_id, USER_NOTIFICATION_STATUS.NEW, environment)
    notificaiton_data['notification_list'] = notification_list
    return notificaiton_data
  }
  private getTicketMessageList = async (param: object, client_info: socket.Socket) => {
    const user = await this.checkLogin(param, client_info)
    if (empty(user)) {
      return []
    }
    /////////////////////////////////////////start functions///////////////////////////////////////
    const user_id = user['id'];
    const ticketid = intval(get_data_value(param, 'ticketid'));
    const last_id = intval(get_data_value(param, 'last_id'));

    let sql = "select u.* from " + TB_TICKET_MESSAGE + " as u where 1=1 and ticket_id=" + ticketid;
    // if (last_id > 0) {
    //   sql += " and id > " + last_id;
    // }
    sql += " order by id asc";

    let row_list = await ticketMessageService.query(sql)
    // for (let key in row_list) {
    //   let row = row_list[key]
    // }
    return row_list
  }
  private getTicketUserInfo = async (param: object, client_info: socket.Socket) => {
    const ticketid = intval(get_data_value(param, 'ticketid'));
    let ticket_info = await ticketService.getOne({ id: ticketid })
    return ticket_info
  }
  private readTicketMessageList = async (param: object, client_info: socket.Socket) => {
    const user = await this.checkLogin(param, client_info)
    if (empty(user)) {
      return []
    }
    /////////////////////////////////////////start functions///////////////////////////////////////
    const user_id = user['id'];
    const ticketid = intval(get_data_value(param, 'ticketid'));
    let reader_id = user_id
    if (user['is_admin'] === '1') {
      reader_id = 0
    }

    const environment = (get_data_value(param, 'environment', ENVIRONMENT.PARTNER));

    await ticketMessageService._mark_as_read(ticketid, reader_id, environment);
    return user
  }


  /////////////////////////////////////////////////////////////public functions/////////////////////////////////////////////////////////////////////////////

  /**
  * reload user's notification list inside socket
  */  
  public reloadUserNotification = async (userId) => {
    try {
      let user_cleint_list = this.getClientsFromUserID(userId)
      console_log('----------------reloadUserNotification user client list----------------', user_cleint_list)

      const user_notification_data = await this.getUserNotificationDataFromUserID(userId)
      console_log("user_notification_data::::", user_notification_data)
      for (let i in user_cleint_list) {
        let client_info = user_cleint_list[i]
        console_log('---------send client id----------', client_info.id)
        this.io.sockets.to(client_info.id).emit('get_user_notification_data', user_notification_data)
      }
    } catch (e) {
      console.log("reloadUserNotification error:::::::::", userId, e)
      return false
    }
  }

  /**
  * reload admin's notification list inside socket
  */  
  public reloadAdminNotification = async (userId) => {
    try {
      userId = 0
      let admin_cleint_list = this.getClientsFromUserID(userId)
      console_log('----------------reloadAdminNotification admin client list----------------', admin_cleint_list)

      const admin_notification_data = await this.getAdminNotificationDataFromID(userId)
      console_log(`reloadAdminNotification::::`, admin_notification_data)

      for (let i in admin_cleint_list) {
        let client_info = admin_cleint_list[i]
        //console_log('---------send admin client id----------', client_info.id)
        this.io.sockets.to(client_info.id).emit('get_admin_notification_data', admin_notification_data)
      }

    } catch (e) {
      console.log("reloadAdminNotification error:::::::::", userId, e)
      return false
    }
  }
}
