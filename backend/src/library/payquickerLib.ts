import xmlbuilder = require("xmlbuilder");
import queryString from 'query-string';

import { PAYQUICKER_CLIENT_ID, PAYQUICKER_CLIENT_SECRET } from "../var/env.config";
import { console_log, empty, get_utc_timestamp_ms, number_format } from "../helpers/misc";
import { loggerService } from "../services/logger.service";

const axios = require('axios')
const qs = require('qs');

const X_MyPayQuickerVersion = '01-15-2018';
const FundingAccountPublicId = 'cf8cd2a975cf49969b0dac9a81f4dbad';

export default class PayquickerLib {
    public live_mode: boolean;
    public IdpBaseUrl: string;
    public ApiBaseUrl: string;

    constructor() {
        this.live_mode = false;
        this.IdpBaseUrl = 'https://identity.mypayquicker.build';
        this.ApiBaseUrl = 'https://platform.mypayquicker.build';
    }

    public getClientAccessToken = async () => {
        try {
            const url = `${this.IdpBaseUrl}/core/connect/token`;
            let payload = qs.stringify({
                'grant_type': 'client_credentials',
                'scope': 'api useraccount_balance useraccount_debit useraccount_payment useraccount_invitation'
            });
            const token = Buffer.from(`${PAYQUICKER_CLIENT_ID}:${PAYQUICKER_CLIENT_SECRET}`).toString("base64");
            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${token}`,
                    'Cookie': 'datadome=VaL3EpcFXnucYJT9a~ROns_kDO4vjasrQjfSiOH_FZPJOJU3HpVUR~51433XUnraUlT96rT3oFJ2OrWOszRDcx9vR5~eb8P3R5N7R0xIGUjvVqtGw0agkdu1YlKIqUwN'
                },
                data: payload
            };
            const { data } = await axios(config);
            console.log(`PayquickerLib getClientAccessToken response:::`, data)
            const access_token = data.access_token
            return access_token;
        } catch (error) {
            console.log(`PayquickerLib getClientAccessToken error:::`, error)
        }
    }

    public sendPayments = async (params) => {
        const {
            amount = 5.02,
            fundingAccountPublicId = FundingAccountPublicId,
            userCompanyAssignedUniqueKey = 'demoUser01',
            userNotificationEmailAddress = 'paulyaxispqflexttest01+demoUser01@gmail.com',
            accountingId = 'demoUser01-001' // order number or invoice number
        } = params
        const accessToken = await this.getClientAccessToken()
        try {
            const url = `${this.ApiBaseUrl}/api/v1/companies/accounts/payments`;
            console_log(`sendPayments url:::`, url);
            let payload = JSON.stringify({
                "payments": [
                    {
                        "fundingAccountPublicId": fundingAccountPublicId,
                        "monetary": {
                            "amount": amount
                        },
                        "userCompanyAssignedUniqueKey": userCompanyAssignedUniqueKey,
                        "userNotificationEmailAddress": userNotificationEmailAddress,
                        "accountingId": accountingId,
                        "recipientUserLanguageCode": "en-us",
                        "issuePlasticCard": false
                    }
                ]
            });
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json; charset=utf-8',
                    'X-MyPayQuicker-Version': X_MyPayQuickerVersion,
                    'Content-Type': 'application/json',
                    'Cookie': 'datadome=VaL3EpcFXnucYJT9a~ROns_kDO4vjasrQjfSiOH_FZPJOJU3HpVUR~51433XUnraUlT96rT3oFJ2OrWOszRDcx9vR5~eb8P3R5N7R0xIGUjvVqtGw0agkdu1YlKIqUwN'
                },
                data: payload
            };

            const { data } = await axios(config);
            console.log(`PayquickerLib sendPayments response:::`, JSON.stringify(data))
            return data;
        } catch (error) {
            console.log(`PayquickerLib sendPayments error:::`, error)
        }
    }

    public getBalanceForUser = async (params) => {
        const { userCompanyAssignedUniqueKey } = params //  = 'demoUser01' 
        const accessToken = await this.getClientAccessToken()
        try {
            const url = `${this.ApiBaseUrl}/api/v1/users/${userCompanyAssignedUniqueKey}/accounts/action?balance=`;
            console_log(`getBalanceForUser url:::`, url);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json; charset=utf-8',
                    'X-MyPayQuicker-Version': X_MyPayQuickerVersion,
                    'Content-Type': 'application/json',
                    'Cookie': 'datadome=VaL3EpcFXnucYJT9a~ROns_kDO4vjasrQjfSiOH_FZPJOJU3HpVUR~51433XUnraUlT96rT3oFJ2OrWOszRDcx9vR5~eb8P3R5N7R0xIGUjvVqtGw0agkdu1YlKIqUwN'
                }
            };
            const { data } = await axios(config);
            console.log(`PayquickerLib getBalanceForUser response:::`, data)
            return data;
        } catch (error) {
            console.log(`PayquickerLib getBalanceForUser error:::`, error)
        }
    }
}

export const payquickerLib = new PayquickerLib()
