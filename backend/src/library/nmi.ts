import xmlbuilder = require("xmlbuilder");
import queryString from 'query-string';

import { NMI_IS_LIVE, NMI_LIVE_SECRET_KEY, NMI_TEST_SECRET_KEY } from "../var/env.config";
import { console_log, empty, get_utc_timestamp_ms, number_format } from "../helpers/misc";
import { loggerService } from "../services/logger.service";

const axios = require('axios')

/////NMI library for nodejs
const GW_APPROVED = 1;
const GW_DECLINED = 1;
const GW_ERROR = 1;

export default class Nmi {
    public live_mode: boolean;
    public gateway_info: object = {};
    public billing: object = {};
    public shipping: object = {};
    public order: object = {};
    constructor() {
        //console.log('NMI_IS_LIVE', NMI_IS_LIVE)
        this.live_mode = NMI_IS_LIVE === "true";
        let gateway_info = {
            security_key: NMI_TEST_SECRET_KEY,
            gatewayURL: 'https://secure.nmi.com/api/v2/three-step'
        };

        if (this.live_mode) {
            gateway_info = {
                security_key: NMI_LIVE_SECRET_KEY,
                gatewayURL: 'https://secure.nmi.com/api/v2/three-step'
            };
        }
        this.gateway_info = gateway_info;
    }

    /**
     * get XML format for NMI
     */    
    public get_form_url = (form_data?: object): void => {
        let root = xmlbuilder.create('root',
            { version: '1.0', encoding: 'UTF-8', standalone: true },
            { pubID: null, sysID: null },
            {
                keepNullNodes: false, keepNullAttributes: false,
                headless: false, ignoreDecorators: false,
                separateArrayItems: false, noDoubleEncoding: false,
                noValidation: false, invalidCharReplacement: undefined,
                stringify: {}
            });
        console.info(root)
    }

    /**
     * set billing info into NMI payload
     */    
    public setBilling = (form_data?: object): void => {
        let default_form_data: object = {
            firstname: "",
            lastname: "",
            company: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            phone: "",
            fax: "",
            email: "",
            website: ""
        }
        this.billing = { ...default_form_data, ...form_data }
    }

    /**
     * set shipping info into NMI payload
     */    
    public setShipping = (form_data?: object): void => {
        let default_form_data: object = {
            shipping_firstname: "",
            shipping_lastname: "",
            shipping_company: "",
            shipping_address1: "",
            shipping_address2: "",
            shipping_city: "",
            shipping_state: "",
            shipping_zip: "",
            shipping_country: "",
            shipping_email: ""
        }
        this.shipping = { ...default_form_data, ...form_data }
    }

    /**
     * set order info into payload
     */    
    public setOrder = (form_data?: object): void => {
        let default_form_data: object = {
            ipaddress: "",
            orderid: "",
            orderdescription: "",
            tax: "",
            shipping: "",
            ponumber: ""
        }
        this.order = { ...default_form_data, ...form_data }
    }

    /**
     * process sale function
     */    
    public doSale = async (card_info: object) => {
        const gateway_info = this.gateway_info;
        if (!empty(gateway_info['security_key'])) {
            let params: object = {
                security_key: gateway_info['security_key'],
                ccnumber: card_info['ccnumber'],
                ccexp: card_info['ccexp'],
                cvv: card_info['cvv'],
                amount: number_format(card_info['amount'], 2, ".", ""),
                type: "sale"
            };
            let post_params: object = { ...params, ...this.billing, ...this.shipping, ...this.order };
            console_log(`nmi post_params::::`, post_params)
            const [payment_result, response_data] = await this._doPost(post_params);
            return [payment_result, response_data]
        }
        else {
            const payment_result = true
            const transactionid = `fake_${get_utc_timestamp_ms()}`
            const response_data = {
                "authcode": "112227",
                "avsresponse": "N",
                "cvvresponse": "M",
                "orderid": "931706628152122",
                "response": "1",
                "response_code": "100",
                "responsetext": "APPROVAL",
                "transactionid": transactionid,
                "type": "sale",
                "livemode": false
            }
            return [payment_result, response_data]
        }
    }

    /**
     * post a payload to NMI
     */    
    public _doPost = async (params: object) => {
        try {
            let apiUrl = "https://secure.nmi.com/api/transact.php"
            let config = {
                method: 'post',
                url: apiUrl,
                headers: {
                    //      'Content-Type': 'application/json',
                },
                params: {
                    ...params
                }
            };
            const { data } = await axios(config);
            console_log(`axios _doPost data:::::`, data)
            await loggerService.info('NMI post result data: ' + JSON.stringify({ params: params, data: data }), 'nmi');

            let response_str = data
            console_log('response_str::::', response_str);
            let obj = queryString.parse(response_str);
            console_log('payment obj:::::', obj);
            let response_status = obj.response;
            if (response_status === '1') {
                return [true, { ...obj, livemode: this.live_mode }]
            } else {
                return [false, obj.responsetext]
            }
            return [false, "Payment failed"]
        } catch (e) {
            return [false, "Payment failed"]
        }
    }

}

export const nmi = new Nmi()
