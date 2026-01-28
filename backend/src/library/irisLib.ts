import moment from 'moment';
import momentZ from 'moment-timezone';
import { IRIS_API_KEY } from '../var/env.config';
import { console_log, empty } from '../helpers/misc';
import { enumerateBetweenDates } from '../helpers/utils';
import { DEFAULT_PROCESSOR_ID } from '../var/config';

const axios = require('axios')

const API_BASE_URL = "https://login.impactpayments.com/api/"
const API_VERSION = "v1"

export default class IrisLib {
    constructor() {

    }

    /**
     * return IRIS BASE API url
     */
    public getApiBaseUrl = (): string => {
        let apiBaseUrl = `${API_BASE_URL}${API_VERSION}`
        return apiBaseUrl
    }

    /**
     * return Header for IRIS api
     */
    public getApiHeader = () => {
        const header = {
            // 'accept': 'application/json',
            'Content-Type': 'application/json',
        }
        header['X-API-KEY'] = `${IRIS_API_KEY}`
        return header
    }

    /**
     * get user list inside IRIS
     */
    public getUserList = async (rest_params = {}) => {
        try {
            const params = {
                page: 1,
                per_page: 10,
                ...rest_params
            }
            let apiUrl = `${this.getApiBaseUrl()}/users/list`
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            console.log("getUserList data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getUserList errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * create a new user
     */
    public createUser = async (rest_params = {}) => {
        try {
            // const payload = {
            //     "username": "quanseng3",
            //     "email": "quanseng632@gmail.com",
            //     "first_name": "quan",
            //     "last_name": "sheng",
            //     "password": "12345678900AAA",
            //     "is_send_new_password": "No",
            //     "mobile_number": "205-987-8370",
            //     "country_code": 856,
            //     "is_two_step": "No",
            //     "is_mobile_internal_only": "No",
            //     "is_forwarding_enabled": "Yes",
            //     "class": 3,
            //     "user_groups": [
            //         2
            //     ],
            //     "primary_group": 2,
            //     "page_size": 10,
            //     "timezone": "Eastern",
            //     "is_active": "Yes",
            //     "restrict_local": [],
            //     "restrict_time": "Yes",
            //     "notes": "string",
            //     "residual_split": 72,
            //     "group_split": 82,
            //     "split_type": "Gross",
            //     "split_expiration_date": 0,
            //     "split_after_expiration": 52,
            //     "split_after_expiration_group_split": 82,
            //     "split_after_expiration_type": "Gross",
            //     "copy_from_user": {},
            //     "reports_to": {},
            //     "manages": {},
            //     "set_events_for": {},
            //     "merchants": {},
            //     "residual_templates": {}
            // }

            const defaultPayload = {
                "country_code": 1,
                "is_two_step": "No",
                "is_mobile_internal_only": "No",
                "is_forwarding_enabled": "Yes",
                "class": 3,
                "user_groups": [
                    2
                ],
                "primary_group": 2,
                "page_size": 10,
                "timezone": "Eastern",
                "is_active": "Yes",
                "restrict_local": [],
                "restrict_time": "Yes",
                "notes": "string",
                "residual_split": 72,
                "group_split": 82,
                "split_type": "Gross",
                "split_expiration_date": 0,
                "split_after_expiration": 52,
                "split_after_expiration_group_split": 82,
                "split_after_expiration_type": "Gross",
                "copy_from_user": {},
                "reports_to": {},
                "manages": {},
                "set_events_for": {},
                "merchants": {},
                "residual_templates": {}
            }

            const payload = {
                ...defaultPayload,
                ...rest_params
            }
            let apiUrl = `${this.getApiBaseUrl()}/users`
            let config = {
                method: 'post',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader(),
                },
                data: JSON.stringify(payload)
            };
            const { data } = await axios(config);
            const apiData = data
            return [true, apiData];
        } catch (e) {
            //console.log("createUser error:::", e)
            const errorResData = e?.response?.data
            console.log("IrisLib createUser errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * update a user
     */
    public updateUser = async (userId, rest_params = {}) => {
        try {
            const defaultPayload = {}

            const payload = {
                ...defaultPayload,
                ...rest_params
            }
            let apiUrl = `${this.getApiBaseUrl()}/users/${userId}`
            let config = {
                method: 'patch',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader(),
                },
                data: JSON.stringify(payload)
            };
            const { data } = await axios(config);
            const apiData = data
            return [true, apiData];
        } catch (e) {
            //console.log("createUser error:::", e)
            const errorResData = e?.response?.data
            console.log("IrisLib updateUser errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * assign a merchant to a user
     */
    public assignMerchantToUser = async (userId, rest_params = {}) => {
        try {
            // const payloadSmaple = {
            //     "merchants": {
            //         "set": [
            //             {
            //                 "mid": 8040689022555,
            //                 "year": 2024,
            //                 "month": 12,
            //                 "residual_split": 72,
            //                 "split_type": "Gross",
            //                 "group_split": 82,
            //                 "apply_for_future": "Yes",
            //                 "note": "string",
            //                 "split_should_expire": "Yes",
            //                 "split_expire_year": 2024,
            //                 "split_expire_month": 11,
            //                 "split_after_expiration": 52,
            //                 "split_after_expiration_type": "Gross",
            //                 "split_after_expiration_group_split": 82
            //             }
            //         ],
            //         "unset": []
            //     }
            // }

            const defaultPayload = {}

            const payload = {
                ...defaultPayload,
                ...rest_params
            }
            let apiUrl = `${this.getApiBaseUrl()}/users/${userId}`
            let config = {
                method: 'patch',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader(),
                },
                data: JSON.stringify(payload)
            };
            const { data } = await axios(config);
            const apiData = data
            return [true, apiData];
        } catch (e) {
            //console.log("createUser error:::", e)
            const errorResData = e?.response?.data
            console.log("IrisLib assignMerchantToUser errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get all processor list inside IRIS
     */
    public getProcessorList = async (rest_params = {}) => {
        try {
            // {
            //     "processors": [
            //         {
            //             "name": "Elavon",
            //             "datasources": [
            //                 {
            //                     "id": 1,
            //                     "name": "Elavon"
            //                 }
            //             ]
            //         },
            //         {
            //             "name": "HBS",
            //             "datasources": [
            //                 {
            //                     "id": 2,
            //                     "name": "HBS"
            //                 }
            //             ]
            //         },
            //         {
            //             "name": "Maverick Payments",
            //             "datasources": [
            //                 {
            //                     "id": 3,
            //                     "name": "Maverick"
            //                 }
            //             ]
            //         },
            //         {
            //             "name": "Card Connect CoPilot",
            //             "datasources": []
            //         }
            //     ]
            // }

            const params = {
                page: 1,
                per_page: 10,
                ...rest_params
            }
            let apiUrl = `${this.getApiBaseUrl()}/processors`
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            console.log("IrisLib getProcessorList data::::", data)
            let processorList = data['processors']
            // const apiData = processorList
            const apiData = [
                {
                    "id": "3",
                    "name": "Elavon"
                },
                {
                    "id": "6",
                    "name": "Maverick Payments"
                },
                {
                    "id": "7",
                    "name": "Card Connect CoPilot"
                }
            ]
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getProcessorList errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get all merchant list
     */
    public getMerchantList = async (rest_params = {}) => {
        try {
            //     {
            //          "data": [
            //         {
            //             "mid": "8040689021",
            //             "name": "AUVORIA PRIME",
            //             "opened": "10/25/2022",
            //             "closed": null,
            //             "created": "2022-10-26T09:04:47-04:00",
            //             "modified": "2024-07-19T04:02:19-04:00",
            //             "first_batch": "11/09/2022",
            //             "last_batch": "02/23/2025",
            //             "group": "Fix My Fees",
            //             "processor": "Elavon",
            //             "datasource": "Elavon",
            //             "sic_code": "",
            //             "vim": "No",
            //             "deactivated": null,
            //             "status": "Open",
            //             "active": "Yes",
            //             "leads": [
            //                 105
            //             ]
            //         },
            //         {
            //             "mid": "8040689022",
            //             "name": "AUVORIA PRIMER QUAN TEST",
            //             "opened": "12/22/2021",
            //             "closed": "05/01/2024",
            //             "created": "2024-04-25T15:36:20-04:00",
            //             "modified": "2024-05-01T09:01:22-04:00",
            //             "first_batch": null,
            //             "last_batch": null,
            //             "group": "Fix My Fees",
            //             "processor": "Elavon",
            //             "datasource": "Elavon",
            //             "sic_code": "1731",
            //             "vim": "Yes",
            //             "deactivated": "05/01/2024",
            //             "status": "Closed",
            //             "active": "No",
            //             "leads": []
            //         }
            //     ],
            //     "links": {
            //         "first": "https://login.impactpayments.com/api/v1/merchants?page=1",
            //         "last": "https://login.impactpayments.com/api/v1/merchants?page=1",
            //         "prev": null,
            //         "next": null
            //     },
            //     "meta": {
            //         "current_page": 1,
            //         "from": 1,
            //         "last_page": 1,
            //         "links": [
            //             {
            //                 "url": null,
            //                 "label": "&laquo; Previous",
            //                 "active": false
            //             },
            //             {
            //                 "url": "https://login.impactpayments.com/api/v1/merchants?page=1",
            //                 "label": "1",
            //                 "active": true
            //             },
            //             {
            //                 "url": null,
            //                 "label": "Next &raquo;",
            //                 "active": false
            //             }
            //         ],
            //         "path": "https://login.impactpayments.com/api/v1/merchants",
            //         "per_page": 1000,
            //         "to": 95,
            //         "total": 95
            //     }
            // }

            const params = {
                page: 1,
                per_page: 10,
                ...rest_params
            }
            let apiUrl = `${this.getApiBaseUrl()}/merchants`
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            console.log("getMerchantList data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getMerchantList errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * Create a new merchant
     */
    public createMerchant = async (rest_params = {}) => {
        try {
            // const payload = {
            //     "mid": 8040689022,
            //     "name": "AUVORIA PRIMER Quan Test",
            //     "opened": "2021-12-22",
            //     "closed": null,
            //     "status": "Open",
            //     "active": "Yes",
            //     "vim": "Yes",
            //     "sic": 1731,
            //     "group": "Fix My Fees",
            //     "processor": "Elavon",
            //     "datasource": "Elavon",
            //     "create_lead": "Yes",
            //     "link_to_lead": 1,
            //     "user_splits": [
            //       {
            //         "uid": 142,
            //         "split": {
            //           "type": "Gross",
            //           "value": 50,
            //           "group_split": 60,
            //           "has_expiration_date": "No",
            //           "expiration": {
            //             "type": "Gross",
            //             "value": 50,
            //             "group_split": 75,
            //             "date": "12/2024"
            //           }
            //         }
            //       }
            //     ]
            //   }

            const defaultPayload = {
                "status": "Open",
                "active": "Yes",
                "vim": "Yes",
                "sic": 1731,
                "group": "Fix My Fees",
                "processor": "Elavon",
                "datasource": "Elavon",
            }

            const payload = {
                ...defaultPayload,
                ...rest_params
            }
            let apiUrl = `${this.getApiBaseUrl()}/merchants`
            let config = {
                method: 'post',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader(),
                },
                data: JSON.stringify(payload)
            };
            const { data } = await axios(config);
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib createMerchant errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get merchant detail
     */
    public getMerchantDetail = async (merchantNumber, withPerformaceData = false, dateOption = 'today') => {
        try {
            // {
            //     "general": {
            //         "mid": "8040689021",
            //         "name": "AUVORIA PRIME",
            //         "opened": "10/25/2022",
            //         "closed": null,
            //         "created": "2022-10-26T09:04:47-04:00",
            //         "modified": "2024-07-19T04:02:19-04:00",
            //         "first_batch": "11/09/2022",
            //         "last_batch": "02/23/2025",
            //         "group": "Fix My Fees",
            //         "processor": "Elavon",
            //         "datasource": "Elavon",
            //         "sic_code": "",
            //         "vim": "No",
            //         "deactivated": null,
            //         "status": "Open",
            //         "active": "Yes"
            //     },
            //     "account_information": {
            //         "Corporate": "AUVORIA PRIME LLC",
            //         "DBA Name": "AUVORIA PRIME",
            //         "Contact": "BILL WYNNE",
            //         "Status": "Approved",
            //         "Status Date": "October, 25 2022 14:00:00",
            //         "Approval Date": "October, 25 2022 00:00:00",
            //         "Phone": "4243583342",
            //         "Fax": "",
            //         "Email": "BWYNNE@AUVORIAPRIME.COM",
            //         "Website": "auvoriaprime.com/",
            //         "Address": "30 N GOULD ST STE R ",
            //         "Mail Address": "30 N GOULD ST STE R ",
            //         "City": "SHERIDAN",
            //         "Mail City": "SHERIDAN",
            //         "State": "WY",
            //         "Mail State": "WY",
            //         "Postal Code": "82801-6317",
            //         "Mail Postal Code": "82801-6317",
            //         "Amex": "",
            //         "Discover": "601113028590811",
            //         "SIC": "7392",
            //         "Business Structure": "",
            //         "Type": "",
            //         "Service & Products": "MGMT, CONSULT, AND PR SERVICES",
            //         "Elavon ID": "42487",
            //         "Date Added": "October, 24 2022 15:55:39",
            //         "Division": "Main",
            //         "Elavon App ID": "AWB4795689",
            //         "Merchant Type": "Elavon",
            //         "Ref Source": "1001",
            //         "Rep ID": "60953",
            //         "Terminals": "a:21:{s:16:\"EQUIPMENTLEASERM\";d:0;s:11:\"VMC_CHARGED\";i:0;s:13:\"LEASEVERIFIED\";i:0;s:9:\"TOBE_PAID\";i:0;s:23:\"EQUIPMENTLEASETOTALCOST\";d:0;s:4:\"PAID\";i:0;s:25:\"EQUIPMENTLEASECOSTTOMERCH\";d:0;s:12:\"CUSTOMSTATUS\";s:0:\"\";s:17:\"EQUIPMENTLEASERM2\";d:0;s:6:\"TAXES1\";s:0:\"\";s:6:\"TAXES2\";s:0:\"\";s:12:\"TERMINALTYPE\";s:23:\"Service Provider Hosted\";s:6:\"STATUS\";s:0:\"\";s:27:\"EQUIPMENTLEASECREDITQUALITY\";s:0:\"\";s:21:\"MERCH_OWNED_REPROGRAM\";i:0;s:11:\"VMC_PAYMENT\";i:0;s:20:\"EQUIPMENTLEASEFACTOR\";d:0;s:17:\"EQUIPMENTLEASEAM2\";d:0;s:13:\"PURCHASE_DATE\";s:25:\"October, 25 2022 00:00:00\";s:16:\"EQUIPMENTLEASEAM\";d:0;s:18:\"elavon_terminal_id\";i:300;}",
            //         "PCI Type": "Sysnet",
            //         "PCI Date Added": "October, 23 2024 19:01:04",
            //         "SAQ Status": "SAQ Upcoming",
            //         "Scanner Status": "Not Applicable",
            //         "Annual Fee Date": "",
            //         "Terminals_JSON": "{\"EQUIPMENTLEASERM\":0,\"VMC_CHARGED\":0,\"LEASEVERIFIED\":0,\"TOBE_PAID\":0,\"EQUIPMENTLEASETOTALCOST\":0,\"PAID\":0,\"EQUIPMENTLEASECOSTTOMERCH\":0,\"CUSTOMSTATUS\":\"\",\"EQUIPMENTLEASERM2\":0,\"TAXES1\":\"\",\"TAXES2\":\"\",\"TERMINALTYPE\":\"Service Provider Hosted\",\"STATUS\":\"\",\"EQUIPMENTLEASECREDITQUALITY\":\"\",\"MERCH_OWNED_REPROGRAM\":0,\"VMC_PAYMENT\":0,\"EQUIPMENTLEASEFACTOR\":0,\"EQUIPMENTLEASEAM2\":0,\"PURCHASE_DATE\":\"October, 25 2022 00:00:00\",\"EQUIPMENTLEASEAM\":0,\"elavon_terminal_id\":300}"
            //     },
            //     "leads": [
            //         105
            //     ]
            // }

            const apiData = {}
            const params = {}
            let apiUrl = `${this.getApiBaseUrl()}/merchants/${merchantNumber}`
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            //console.log("getMerchantDetail data::::", data)
            apiData['merchantInfo'] = data
            if (withPerformaceData) {
                const [performaceApiResult, performaceData] = await this.getMerchantTopPerformanceData(merchantNumber, dateOption)
                if (performaceApiResult) {
                    apiData['performaceData'] = performaceData
                }
            }
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getMerchantDetail errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get merchant deposit list
     */
    public getMerchantDepositList = async (merchantNumber, options) => {
        try {
            const { year, month, day, end_date } = options

            const params = {
                end_date: end_date
            }
            let apiUrl = `${this.getApiBaseUrl()}/merchants/${merchantNumber}/deposits/${year}/${month}/${day}`
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            //console.log("getMerchantDepositList data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getMerchantDepositList errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get merchant transaction list
     */
    public getMerchantTransactionList = async (merchantNumber, options) => {
        try {
            const { page, per_page, start_date, end_date } = options
            const params = {
                // page,
                // per_page,
                start_date,
                end_date
            }
            let apiUrl = `${this.getApiBaseUrl()}/merchants/${merchantNumber}/transactions`
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            //console.log("getMerchantTransactionList data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getMerchantTransactionList errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get merchant top performance data
     */
    public getMerchantTopPerformanceData = async (merchantNumber, dateOption) => {
        try {
            const apiData = {}
            const currentDateStr = moment().format('YYYY-MM-DD')
            let startDate = null // need to adjust (max is 90 days)

            if (dateOption === 'today') {
                startDate = moment().clone().subtract(1, "days");
            }
            else if (dateOption === 'last_7') {
                startDate = moment().clone().subtract(7, "days");
            }
            else if (dateOption === 'last_30') {
                startDate = moment().clone().subtract(30, "days");
            }
            else if (dateOption === 'last_90') {
                startDate = moment().clone().subtract(90, "days"); // need to adjust (max is 90 days)
            }

            if (empty(startDate)) {
                return [false, "Invalid request"];
            }

            const start_date = startDate.format('YYYY-MM-DD')
            console_log(`start_date::::`, start_date)

            const end_date = currentDateStr
            const year = startDate.format('YYYY')
            const month = startDate.format('MM')
            const day = startDate.format('DD')

            const depositOptions = {
                year,
                month,
                day,
                end_date
            }
            console_log(`depositOptions:::`, depositOptions)
            const [depositApiResult, depositApiData] = await this.getMerchantDepositList(merchantNumber, depositOptions)
            if (depositApiResult) {
                apiData['depositList'] = depositApiData
            } else {
                apiData['depositList'] = []
            }

            // const transactionOptions = {
            //     page: 1,
            //     per_page: 100,
            //     start_date,
            //     end_date
            // }
            // console_log(`transactionOptions:::`, transactionOptions)
            // const [transactionApiResult, transactionApiData] = await this.getMerchantTransactionList(merchantNumber, transactionOptions)
            // if (transactionApiResult) {
            //     apiData['transactionList'] = transactionApiData
            // } else {
            //     apiData['transactionList'] = []
            // }

            return [true, apiData];

        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getMerchantTopPerformanceData errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get Residuals Summary Data
     */
    public getResidualSummaryData = async (options) => {
        try {
            const { processor_id = "", year, month, search = "", hide_null_merchants = 0 } = options // processor_id: 3
            const params = {
                // page,
                // per_page,
                // group,
                // agent,
                // search
            }
            if (search) {
                params['search'] = search
            }
            params['hide_null_merchants'] = hide_null_merchants

            let apiUrl = `${this.getApiBaseUrl()}/residuals/reports/summary/${year}/${month}`
            if (processor_id) {
                params['processor'] = processor_id
            }
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            // console.log("getResidualSummaryData data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getResidualSummaryData errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get Residuals Summary with Merchant Rows
     */
    public getResidualSummaryWithMerchantRows = async (options) => {
        try {
            const { processor_id = "", year, month, search = "", hide_null_merchants = 0 } = options // processor_id: 3
            const params = {
                // page,
                // per_page,
                // group,
                // agent,
                // search
            }
            if (search) {
                params['search'] = search
            }
            params['hide_null_merchants'] = hide_null_merchants

            let apiUrl = `${this.getApiBaseUrl()}/residuals/reports/summary/rows/${processor_id}/${year}/${month}`

            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            // console.log("getResidualSummaryWithMerchantRows data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getResidualSummaryWithMerchantRows errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get Residual Line Items
     */
    public getResidualLineItems = async (options) => {
        try {
            const { dba = "", year, month } = options
            const params = {
                // page,
                // per_page,
                // group,
                // dba
            }
            if (dba) {
                params['dba'] = dba
            }
            if (options['user_id']) {
                params['user_id'] = options['user_id']
            }
            let apiUrl = `${this.getApiBaseUrl()}/residuals/lineitems/${year}/${month}`
            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            //console.log("getResidualLineItems data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getResidualLineItems errorResData:::", errorResData)
            return [false, errorResData]
        }
    }

    /**
     * get Residual reports
     */
    public getResidualReports = async (options) => {
        let data = []
        try {
            const { processor_id = DEFAULT_PROCESSOR_ID, mid = "" } = options
            const currentMoment = moment()
            const monthCount = 5 // for 5 months
            const endMonthSubstract = 3; // 3 months ago
            const startMonthSubstract = endMonthSubstract + (monthCount - 1);
            const endMoment = currentMoment.clone().subtract(endMonthSubstract, 'months')
            const startMoment = currentMoment.clone().subtract(startMonthSubstract, 'months')
            const monthList = enumerateBetweenDates(startMoment, endMoment, 'monthly')
            if (monthList && monthList.length > 0) {
                for (let k in monthList) {
                    const monthStr = monthList[k]
                    const monthMoment = moment(monthStr, 'YYYY-MM')
                    const year = monthMoment.format('YYYY')
                    const month = monthMoment.format('MM')
                    const params = {
                        processor_id,
                        mid,
                        year,
                        month
                    }
                    const [apiSuccess, apiRes] = await this.getResidualSummaryWithMerchantRows(params)
                    if (apiSuccess) {
                        let reportData = apiRes?.data ?? []
                        if (mid) {
                            reportData = reportData.filter((x) => `${x.mid}` === `${mid}`)
                        }
                        const item = {
                            monthStr: monthStr,
                            reportData: reportData
                        }
                        data = [item, ...data]
                    }
                }
            }
            return data;
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getResidualReports errorResData:::", errorResData)
            return data
        }
    }

    /**
     * get residual for last month
     */
    public getLastMonthResidual = async (options) => {
        try {
            const { processor_id = DEFAULT_PROCESSOR_ID, mid = "" } = options
            const currentMoment = moment()
            const monthCount = 1 // for 1 months
            const endMonthSubstract = 3; // 3 months ago
            const startMonthSubstract = endMonthSubstract + (monthCount - 1);
            const endMoment = currentMoment.clone().subtract(endMonthSubstract, 'months')
            const startMoment = currentMoment.clone().subtract(startMonthSubstract, 'months')
            const monthList = enumerateBetweenDates(startMoment, endMoment, 'monthly')
            if (monthList && monthList.length > 0) {
                for (let k in monthList) {
                    const monthStr = monthList[k]
                    const monthMoment = moment(monthStr, 'YYYY-MM')
                    const year = monthMoment.format('YYYY')
                    const month = monthMoment.format('MM')
                    const params = {
                        processor_id,
                        mid,
                        year,
                        month
                    }
                    const [apiSuccess, apiRes] = await this.getResidualSummaryWithMerchantRows(params)
                    if (apiSuccess) {
                        let reportData = apiRes?.data ?? []
                        if (mid) {
                            reportData = reportData.filter((x) => `${x.mid}` === `${mid}`)
                            if (reportData) {
                                const item = reportData[0]
                                // const item = {
                                //     "mid": "",
                                //     "merchant": "",
                                //     "transactions": 0,
                                //     "sales_amount": 0,
                                //     "expense": 0,
                                //     "income": 0,
                                //     "net": 0,
                                //     "percentage": 0,
                                //     "bps": 0,
                                //     "agent_net": 0
                                // }
                                return item
                            }
                        }
                    }
                }
            }
            return {}
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getLastMonthResidual errorResData:::", errorResData)
            return {}
        }
    }

    /**
     * get Merchant Residual reports
     */
    public getMerchantResidualReports = async (options) => {
        let data = []
        try {
            const { processor_id = DEFAULT_PROCESSOR_ID, mid = "", date_range = "" } = options
            const currentMoment = moment()
            let monthCount = 3 // for 3 months
            if (date_range === "last_3_month") {
                monthCount = 3
            }
            else if (date_range === "last_6_month") {
                monthCount = 6
            }
            else if (date_range === "last_12_month") {
                monthCount = 12
            }

            const endMonthSubstract = 0; // 3 months ago
            const startMonthSubstract = endMonthSubstract + (monthCount - 1);
            const endMoment = currentMoment.clone().subtract(endMonthSubstract, 'months')
            const startMoment = currentMoment.clone().subtract(startMonthSubstract, 'months')
            const monthList = enumerateBetweenDates(startMoment, endMoment, 'monthly')
            if (monthList && monthList.length > 0) {
                for (let k in monthList) {
                    const monthStr = monthList[k]
                    const monthMoment = moment(monthStr, 'YYYY-MM')
                    const year = monthMoment.format('YYYY')
                    const month = monthMoment.format('MM')
                    const params = {
                        processor_id,
                        mid,
                        year,
                        month
                    }

                    const [apiSuccess, apiRes] = await this.getResidualSummaryWithMerchantRows(params)
                    if (apiSuccess) {
                        let reportData = apiRes?.data ?? []
                        if (mid) {
                            reportData = reportData.filter((x) => `${x.mid}` === `${mid}`)
                        }
                        const item = {
                            monthStr: monthStr,
                            reportData: reportData
                        }
                        data = [item, ...data]
                    }
                }
            }
            return data;
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getMerchantResidualReports errorResData:::", errorResData)
            return data
        }
    }

    /**
     * get Get residuals merchant summary
     */
    public GetResidualsMerchantSummary = async (options) => {
        try {
            const { processor_id, mid, year, month, search = "", hide_null_merchants = 0 } = options
            const params = {
                // page,
                // per_page,
                // group,
                // agent,
                // search
            }
            // if (search) {
            //     params['search'] = search
            // }
            // params['hide_null_merchants'] = hide_null_merchants

            let apiUrl = `${this.getApiBaseUrl()}/residuals/summary/merchant/${mid}/${year}/${month}`
            console.log(`apiUrl::::`, apiUrl)

            let config = {
                method: 'get',
                url: apiUrl,
                headers: {
                    ...this.getApiHeader()
                },
                params: {
                    ...params
                },
            };
            const { data } = await axios(config);
            // console.log("GetResidualsMerchantSummary data::::", data)
            const apiData = data
            return [true, apiData];
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib GetResidualsMerchantSummary errorResData:::", e)
            return [false, errorResData]
        }
    }

    /**
     * getMerchantProfitData
     */
    public getMerchantProfitData = async (options) => {
        let data = {
            ytd_profit: 0,
            ytd_sales_amount: 0,
            ytd_profit_bps: 0,
            lifetime_profit: 0,
            lifetime_sales_amount: 0,
            lifetime_profit_bps: 0
        }
        try {
            const { processor_id = DEFAULT_PROCESSOR_ID, mid = "" } = options
            const currentMoment = moment()
            const curYear = currentMoment.clone().format('YYYY')
            const startOfYear = `${curYear}-01-01`
            const startMoment = moment(startOfYear, 'YYYY-MM-DD')
            const endMoment = currentMoment.clone()
            const ytdMonthList = enumerateBetweenDates(startMoment, endMoment, 'monthly')

            const startLifetimeMoment = currentMoment.clone().subtract(12, 'months')
            const monthList = enumerateBetweenDates(startLifetimeMoment, endMoment, 'monthly')

            // console.log(`monthList::::`, monthList)
            if (monthList && monthList.length > 0) {
                for (let k in monthList) {
                    const monthStr = monthList[k]
                    const monthMoment = moment(monthStr, 'YYYY-MM')
                    const year = monthMoment.format('YYYY')
                    const month = monthMoment.format('MM')
                    const params = {
                        processor_id,
                        mid,
                        year,
                        month
                    }
                    const [apiSuccess, apiRes] = await this.getResidualSummaryWithMerchantRows(params)
                    if (apiSuccess) {
                        let reportData = apiRes?.data ?? []
                        if (mid) {
                            reportData = reportData.filter((x) => `${x.mid}` === `${mid}`)
                        }
                        // const item = {
                        //     monthStr: monthStr,
                        //     reportData: reportData
                        // }
                        if (reportData.length > 0) {
                            if (ytdMonthList.includes(monthStr)) {
                                if (reportData[0]['agent_net']) {
                                    const profit = Number(reportData[0]['agent_net']) // Number(reportData[0]['income']) - Number(reportData[0]['expense'])
                                    data['ytd_profit'] += profit
                                }
                                if (reportData[0]['sales_amount']) {
                                    const sales_amount = Number(reportData[0]['sales_amount'])
                                    data['ytd_sales_amount'] += sales_amount
                                }
                            }
                            if (reportData[0]['agent_net']) {
                                const profit = Number(reportData[0]['agent_net']) // Number(reportData[0]['income']) - Number(reportData[0]['expense'])
                                data['lifetime_profit'] += profit
                            }
                            if (reportData[0]['sales_amount']) {
                                const sales_amount = Number(reportData[0]['sales_amount'])
                                data['lifetime_sales_amount'] += sales_amount
                            }
                        }
                    }
                }
            }
            if (data['ytd_sales_amount'] > 0) {
                data['ytd_profit_bps'] = 100 * data['ytd_profit'] / data['ytd_sales_amount']
                data['ytd_profit_bps'] = Number(data['ytd_profit_bps'].toFixed(2))
            }
            if (data['lifetime_sales_amount'] > 0) {
                data['lifetime_profit_bps'] = 100 * data['lifetime_profit'] / data['lifetime_sales_amount']
                data['lifetime_profit_bps'] = Number(data['lifetime_profit_bps'].toFixed(2))
            }
            return data;
        } catch (e) {
            const errorResData = e?.response?.data
            console.log("IrisLib getMerchantProfitData errorResData:::", errorResData)
            return data
        }
    }

}

export const irisLib = new IrisLib();
