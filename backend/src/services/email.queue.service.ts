import { TB_EMAIL_QUEUE } from "../var/tables";
import { BaseService } from "./base.service";
import { settingService } from "./setting.service";
import { get_message_template, send_email } from "../helpers/misc";

export default class EmailQueueService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_EMAIL_QUEUE;
  }

  /**
   * insert a record for email sending, then email cron will process to send email
   */
  public async_send_email = async (to: string, subject: string, message: string, attachments: string = '', priority: number = 0, cc_email: boolean = false, reply_email: string = '', from_name: string = '') => {
    try {
      let app_settings = await settingService.get_app_settings();
      if (app_settings['email_func'] === 'false') {
        return true
      }

      if (to == '') {
        return false;
      }
      let email_data = {
        to: to,
        subject: subject,
        message: message,
        cc_email: cc_email ? 1 : 0,
        reply_email: reply_email,
        from_name: from_name,
        attachments: attachments,
        priority: priority
      }
      //console_log('', email_data)
      const id = await this.insert(email_data);
      return id
    } catch (e) {
      console.log(`async_send_email error::::`, e)
    }
  }

  public sendTestEmailTemplate = async (email, template_id, immediately = false) => { // for testing
    try {
      let subject = ""
      let message = get_message_template(template_id);
      if (template_id === 1) {
        subject = "Welcome to Fix My Fees! Your Journey Begins Here";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 2) {
        subject = "Reminder: Next Steps with Fix My Fees - Let's Get Started!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 3) {
        subject = "What Makes Fix My Fees The Best Payment Processor?";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 4) {
        subject = "Real Stories, Real Success: Testimonials from Satisfied Fix My Fees Partners";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 5) {
        subject = "Need Assistance with Your Onboarding Process?";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 6) {
        subject = "Unlocking the Mystery Behind How Fix My Fees Is Able To Cut Payment Processing Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 7) {
        subject = "Taking Charge: Own Your Merchant Account with Fix My Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 8) {
        subject = "Say Goodbye to Chargeback Worries with Fix My Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 9) {
        subject = "We Value Your Feedback: How's Your Onboarding Experience Going?";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 10) {
        subject = "Unlock Your Income Potential: Become a Brand Partner with Fix My Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      /////////////////////////////////////// partner email  //////////////////////////////////////////////////////////////////
      else if (template_id === 11) {
        subject = "Welcome to the Fix My Fees Family!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 12) {
        subject = "Don’t Forget to Get Started with Fix My Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 13) {
        subject = "Essential Tools for Your Success With Fix My Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 14) {
        subject = "Get to Know Your Fix My Fees Dashboard!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 15) {
        subject = "Top Tips for Recruiting Success With Fix My Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 16) {
        subject = "Leverage Your Network for Maximum Impact - Fix My Fees";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 17) {
        subject = "Handling Common Objections Like a Pro";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 18) {
        subject = "Celebrate Your Brand Partner Successes!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 19) {
        subject = "Send 10 Days after registering as a new brand partner";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 20) {
        subject = "Reminder: Tap into Your Partner Portal Resources and Support Channels";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      /////////////////////////////////////////// 10 Emails (Didn’t Join): //////////////////////////////////////////////////////////////
      else if (template_id === 21) {
        subject = "Unlock Your Potential: Join Fix My Fees as a Brand Partner Today!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 22) {
        subject = "It’s Time to Start Earning – Join Fix My Fees Today!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 23) {
        subject = "Unlock the Tools to Skyrocket Your Earnings!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 24) {
        subject = "Act Now – Join Fix My Fees and Unlock Your Earning Potential";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 25) {
        subject = "Begin Your Path to Financial Independence with Fix My Fees!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 26) {
        subject = "Elevate Your Income - Join Us as a Brand Partner!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 27) {
        subject = "Mastering Objections to Boost Your Income";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 28) {
        subject = "Witness Success Stories - Join Our Brand Partner Team Today!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 29) {
        subject = "Don't Miss Out on Your Chance to Boost Your Income!";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }
      else if (template_id === 30) {
        subject = "Elevate Your Future with Fix My Fees";
        message = message.replace(/%%subject%%/gi, subject);
        message = message.replace(/%%user_name%%/gi, "Quanseng");
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (immediately) {
        await send_email(email, subject, message)
      } else {
        await this.async_send_email(email, subject, message); // await send_email(email, subject, message);
      }
    } catch (e) {
      console.log(`sendTestEmailTemplate error::::`, e)
    }
  }

}

export const emailQueueService = new EmailQueueService();
