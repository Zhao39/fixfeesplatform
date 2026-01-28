/**
 * this cron runs every day (00:01:01 GMT)
 */
import { CronJob } from 'cron';
import { businessService } from '../services/business.service';

export default class CronResidualData {

    cronJob: CronJob;

    constructor() {
        this.cronJob = new CronJob('1 0 0 * * *', async () => { //every day
            try {
                await this.runCron(); 
            } catch (e) {
                console.error(e);
            }
        });
        //this.startCron()
    }

    public startCron = async () => {
        if (!this.cronJob.running) {
            this.cronJob.start();
        }
    }

    public runCron = async () => {
        await businessService.getLastResidualDataOfMerchantList()
    }
}

export const cronResidualData = new CronResidualData()