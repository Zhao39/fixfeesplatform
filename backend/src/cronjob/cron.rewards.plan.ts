/**
 * this cron runs every 10th day (00:01:01 GMT)
 */

import { CronJob } from 'cron';
import { userService } from '../services/user.service';

export default class CronRewardsPlan {

    cronJob: CronJob;

    constructor() {
        this.cronJob = new CronJob('1 1 1 10 * *', async () => { //every 10th of month
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
        await userService.applyUsersRewardPlan()
    }

}

export const cronRewardsPlan = new CronRewardsPlan()