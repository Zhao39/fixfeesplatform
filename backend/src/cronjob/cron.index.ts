import { isMainThread } from 'worker_threads';
import { BACKEND_LOCATION, CRON_FUNC } from '../var/env.config';
import { cronEmail } from './cron.email';
import { cronDaily } from './cron.daily';
import { cronResidualData } from './cron.residual.data';
import { cronRewardsPlan } from './cron.rewards.plan';

export default class CronIndex {
    constructor() {
        this.startCron()
    }

    /**
     * start cron function
     */
    public startCron = async () => {
        if (BACKEND_LOCATION === "localhost") {
            return false;
        } else if (CRON_FUNC === "enabled") {
            if (isMainThread) {
                console.log('---------------cron started----------------')
                cronDaily.startCron()
                // cronHourly.startCron()
                cronResidualData.startCron()
                cronRewardsPlan.startCron()

                console.log('---------------cron (loop) started----------------')
                cronEmail.startCron()
            }
        }
    }
}

export const cronIndex = new CronIndex()