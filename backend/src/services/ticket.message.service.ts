import { ENVIRONMENT } from "../var/config";
import { intval, is_null } from "../helpers/misc";
import { TB_TICKET_MESSAGE } from "../var/tables";
import { adminNotificationService } from "./admin.notification.service";
import { BaseService } from "./base.service";
import { ticketService } from "./ticket.service";
import { userNotificationService } from "./user.notification.service";

export default class TicketMessageService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_TICKET_MESSAGE;
  }

  /**
   * mark a ticket as read status
   */
  public _mark_as_read = async (ticket_id, receiver_id, environment = null) => {
    try {
      if (environment === null) {
        environment = ENVIRONMENT.PARTNER
      }
      let where = {}
      where['ticket_id'] = ticket_id
      if (!is_null(receiver_id)) {
        where['receiver_id'] = receiver_id
      }
      await this.update({ is_read: 1 }, where);

      if (!is_null(receiver_id)) {
        if (receiver_id === 0) { //admin
          await adminNotificationService.readUserTicketNotification(receiver_id, ticket_id, null)
        } else {
          await userNotificationService.readUserTicketNotification(receiver_id, ticket_id, null)
        }
      }

      ///////////////////////////////////////////////////////////////////////////////////////
      let condition = { id: ticket_id }
      let info = await ticketService.getOne(condition, "id,last_msg_id");
      if (receiver_id === 0 && intval(info['last_msg_id']) === 0) {
        await ticketService._mark_as_read(ticket_id)
      }
    } catch (e) {
      console.log("error:::::::::", e)
      return null
    }
    return true;
  }

}

export const ticketMessageService = new TicketMessageService();
