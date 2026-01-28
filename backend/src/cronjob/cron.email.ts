/**
 * this cron runs every 3 seconds, 
 * it sends an email from email_queue table
 */

//import { CronJob } from 'cron';
import { empty, send_email, sleep } from '../helpers/misc';
import { emailQueueService } from '../services/email.queue.service';
import { TB_EMAIL_QUEUE } from '../var/tables';

export default class CronEmail {
    constructor() {
       
    }

    public startCron = async () => {
        console.log("doSendBulkEmail started...........")
        while (true) {
            await this.runCron()
        }
    }

    public runCron = async () => {
        try {
            let sql = "select id from " + TB_EMAIL_QUEUE + " where result = '' order by priority asc, id asc limit 0,10";
            //addToLogFile(sql, 'test_sql')
            let list = await emailQueueService.query(sql)
            for (let key in list) {
                let row = list[key]
                await this.do_send_email(row['id']);
            }
        } catch (e) {
            console.log(`CronEmail runCron error:::`, e)
        }

        await sleep(3000) //need to sleep for some seconds (for cpu performance)
    }

    /**
     * send a email from email id (email_queue)
     */    
    public do_send_email = async (email_id: number) => { //processor in background for async function
        try {
            let where = { id: email_id }
            let email_record = await emailQueueService.getOne(where)
            if (empty(email_record)) {
                return false;
            }
            if (email_record['result'] !== "") {
                return false;
            }

            let update_data = { result: 'processing' }
            await emailQueueService.update(update_data, where)

            let result = await send_email(email_record['to'], email_record['subject'], email_record['message']);
            update_data = { result: 'failed' }
            if (result) {
                update_data = { result: 'success' }
            }
            await emailQueueService.update(update_data, where)
        } catch (e) {
            console.log("do_send_email error:::", e)
            return false
        }
        return true

    }


}

export const cronEmail = new CronEmail()