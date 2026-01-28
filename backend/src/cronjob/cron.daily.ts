/**
 * this cron runs every day (00:01:01 GMT)
 */

import { CronJob } from 'cron';
import { decrypt__data, empty, floatval, get_utc_timestamp, intval, makePaySn } from '../helpers/misc';
import { TB_LICENSE } from '../var/tables';
import { TRIAL_LICENSE_DURATION } from '../var/config';
import { userService } from '../services/user.service';
import { licenseService } from '../services/license.service';
import { transactionService } from '../services/transaction.service';
import { loggerService } from '../services/logger.service';
import { referralFundsHistoryService } from '../services/referral.funds.history.service';
import { paymentService } from '../services/payment.service';

export default class CronDaily {

    cronJob: CronJob;

    constructor() {
        this.cronJob = new CronJob('1 1 0 * * *', async () => { //every day
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
        await loggerService.info('-------------------running cron (daliy cron) (every day: ' + new Date().toLocaleTimeString() + ')----------------------', 'cron')

        await this.check_cancelled_license();
        await this.check_trial_license();
        await this.check_expired_license();

        await this.updateAllUsersRankAndTier()
    }

    /**
     * check all cancelled licenses, and mark each user as inactive
     */
    public check_cancelled_license = async () => {
        try {
            await loggerService.info('check cancelled licenses', 'cron');
            let sql = "select * from " + TB_LICENSE + " where status = '1' and is_cancelled = 1 order by id asc";
            let license_list = await licenseService.query(sql)
            if (empty(license_list)) {
                return false;
            }
            for (let key in license_list) {
                let license_info = license_list[key]
                let user_id = intval(license_info['user_id']);
                let add_timestamp = intval(license_info['add_timestamp']);
                let period_fee_duration = licenseService.getLicenseDuration(license_info);
                if (get_utc_timestamp() - add_timestamp >= period_fee_duration * 86400) {
                    sql = "delete from " + TB_LICENSE + " where user_id = " + user_id;
                    await licenseService.query(sql);
                    await userService.check_user_is_active(user_id);
                }
            }
        } catch (e) {
            console.log("check_cancelled_license error:::", e)
        }
    }

    /**
     * check all all licenses, and mark each user as inactive or active
     */
    public check_trial_license = async () => {
        try {
            await loggerService.info('check trial license', 'cron');
            let period_fee_duration = TRIAL_LICENSE_DURATION;
            const condition = {
                is_deleted: 0,
                is_active: 1,
                member_type: ''
            }
            let user_list = await userService.getAll(condition);
            if (empty(user_list)) return false;
            for (let key in user_list) {
                let user_info = user_list[key]
                const isFreeMember = userService.isFreeMember(user_info)
                if (isFreeMember) {
                    continue;
                }
                let user_id = user_info['id'];
                let sql = "select * from " + TB_LICENSE + " where status = '1' and is_trial = 1 and is_cancelled = 0 and user_id = " + user_id + " order by id asc limit 0,1";
                let license_list = await licenseService.query(sql)
                if (empty(license_list)) continue;
                for (let key1 in license_list) {
                    let license_info = license_list[key1]
                    let add_timestamp = intval(license_info['add_timestamp']);
                    period_fee_duration = licenseService.getLicenseDuration(license_info);
                    if (get_utc_timestamp() - add_timestamp >= period_fee_duration * 86400) {
                        await this.rebill_license(license_info);
                    }
                }
            }
        } catch (e) {
            console.log("check_trial_license error:::", e)
        }
    }

    /**
     * check all cancelled licenses, and mark each user as inactive or active
     */
    public check_expired_license = async () => {
        try {
            await loggerService.info('check expired license', 'cron');
            const DayLimit = 100
            const curTimestamp = get_utc_timestamp()
            let period_fee_duration = 0
            const condition = {
                is_deleted: 0,
                is_active: 1,
                member_type: ''
            }
            let user_list = await userService.getAll(condition);
            if (empty(user_list)) return false;

            let processedIndex = 0;
            for (let key in user_list) {
                let user_info = user_list[key]
                const isFreeMember = userService.isFreeMember(user_info)
                if (isFreeMember) {
                    continue;
                }
                let user_id = user_info['id'];
                let sql = "select * from " + TB_LICENSE + " where status = '1' and is_trial = 0 and is_cancelled = 0 and user_id = " + user_id + " order by id asc limit 0,1";
                let license_list = await licenseService.query(sql)
                if (empty(license_list)) continue;
                for (let key1 in license_list) {
                    let license_info = license_list[key1]
                    let add_timestamp = intval(license_info['add_timestamp']);
                    period_fee_duration = licenseService.getLicenseDuration(license_info);
                    if (curTimestamp - add_timestamp >= period_fee_duration * 86400) {
                        await this.rebill_license(license_info);
                        processedIndex = processedIndex + 1;
                        if (processedIndex >= DayLimit) {
                            return false
                        }
                    }
                }
            }
        } catch (e) {
            console.log("check_expired_license error:::", e)
        }
    }

    /**
     * rebill current license
     */
    public rebill_license = async (license_info) => {
        try {
            await loggerService.info('rebill license', 'cron');
            await loggerService.info(JSON.stringify(license_info), 'cron');

            let license_price = licenseService.getMembershipPrice(license_info);

            let where = { user_id: license_info['user_id'] }
            let user_id = license_info['user_id'];
            let condition = { id: user_id, is_deleted: 0 }
            let user_info = await userService.getOne(condition);
            let rebill_license_with_balance_result = await this.rebill_license_with_balance(user_info, license_info, license_price)
            if (rebill_license_with_balance_result) {
                return true;
            }

            if (empty(user_info) || empty(user_info['customer_id'])) {
                if (empty(user_info)) {
                    return false;
                }
                await licenseService.update({ status: '0', license_type: 0, coupon: "", coupon_type: 0, coupon_value: 0 }, where);
                await userService.check_user_is_active(user_id);
                return false;
            } else {
                let params = {
                    payment_type: 'rebill',
                    customer_id: user_info['customer_id'],
                }
                params['pay_sn'] = "rebill_" + makePaySn(user_id);
                if (intval(license_info['is_trial']) > 0) {
                    params['is_trial'] = 1;
                } else {
                    params['is_trial'] = 0;
                }
                params['amount'] = license_price;
                params['client_ip'] = "127.0.0.1";
                params['description'] = "rebill_license";
                params['user_id'] = user_id;
                params['payment_product'] = params['description'];
                await licenseService.update({ pay_sn: params['pay_sn'] }, where);
                let pay_result = await this.rebillCardPayment(params); //pay_result is transaction id
                if (!pay_result) {
                    await licenseService.update({ status: '0', license_type: 0, coupon: "", coupon_type: 0, coupon_value: 0 }, where);
                    await userService.check_user_is_active(user_id);
                    //await transactionService.afterPaymentResultFailed(params, user_info);
                    return false;
                } else {
                    //do nothing because we use webhook for nmi
                    return true;
                }
            }

        } catch (e) {
            console.log("rebill_license error:::", e)
        }
    }

    /**
     * rebill license by using user's balance
     */
    public rebill_license_with_balance = async (user_info, license_info, license_price) => {
        try {
            if (empty(user_info)) {
                return false;
            }

            let user_id = user_info['id'];
            let balance = floatval(user_info['balance']);
            if (balance < license_price) {
                return false;
            } else {
                balance = balance - license_price;
                let params = {}
                params['trans_id'] = "rebill_license_" + user_id + "_" + license_info['id'] + "_" + get_utc_timestamp();
                params['paid_amount'] = license_price;
                params['amount'] = license_price;
                params['client_ip'] = "127.0.0.1";
                params['description'] = "rebill_license";
                params['user_id'] = user_id;
                params['payment_product'] = "rebill_license";
                params['environment'] = "live";
                params['pay_sn'] = license_info['pay_sn'];
                await transactionService.add_transaction(params, 'wallet');
                await userService.update_license_status(params);
                await userService.update({ balance: balance }, { id: user_id });

                await referralFundsHistoryService.addReferralFund(user_info, params['amount'])
                return true;
            }
        } catch (e) {
            console.log("rebill_license_with_balance error:::", e)
            return false
        }
    }

    /**
     * rebill license by using credit card
     */
    public rebillCardPayment = async (params) => {
        try {
            let user_info = await userService.getDetail({ id: params['user_id'], is_deleted: 0 });
            if (empty(user_info)) {
                return false;
            }
            let card_params = decrypt__data(user_info['customer_detail']);
            if (empty(card_params)) {
                return false;
            }

            let licenseInfo = user_info?.license_info
            if (licenseInfo && licenseInfo.id) {
                let membership = Number(licenseInfo['membership'])
                let amount = licenseService.getMembershipPrice(membership)
                params['amount'] = amount
            }

            ///////////// before charge credit card, add transaction for pending transaction ////////////////
            params['paid_amount'] = floatval(params['amount']);
            await transactionService.add_transaction(params, 'nmi', 'pending');
            /////////////////////////////////////////////////////////////////////////////////////////////////
            let pay_result: any;
            let message: any;
            [pay_result, message] = await paymentService.pay_with_customer(user_info['id'], null, params)

            const log_data = { user_id: params['user_id'], pay_result: pay_result, message: message };
            if (pay_result) {
                await loggerService.info('credit card charge success:::: ' + JSON.stringify(log_data) + '', 'cron'); //return params['trans_id'];
            } else {
                await loggerService.info('credit card charge failed:::: ' + JSON.stringify(log_data) + '', 'cron');
            }
        } catch (e) {
            console.log("rebillCardPayment error:::", e)
        }
        return true; //it should be true because we use webhook for nmi
    }

    public updateAllUsersRankAndTier = async () => {
        try {
            await userService.updateAllUsersRankAndTier();
        } catch (e) {
            console.log("cron updateAllUsersRankAndTier error:::", e)
        }
    }
}

export const cronDaily = new CronDaily()