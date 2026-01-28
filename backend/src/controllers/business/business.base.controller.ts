// base class for all business classes

import BaseController from '../base.controller'
import { Request, Response } from 'express'
import { empty, get_data_value, get_utc_timestamp, intval } from '../../helpers/misc';
import { tokenService } from '../../services/token.service';
import { settingService } from '../../services/setting.service';
import { businessService } from '../../services/business.service';
import { ENVIRONMENT } from '../../var/config';

export default class BusinessBaseController extends BaseController {
    public user: object = {};
    public data: object = {};
    public environment = ENVIRONMENT.BUSINESS
    constructor() {
        super();
    }

    /**
     * Check bearToken from http request header
     */
    protected checkLogin = async (req: Request, res: Response) => {
        let post_param: object = req['fields']
        let get_param: object = req['query']
        //console.log('req', req)
        let app_settings = await settingService.get_app_settings();
        if (app_settings['maintenance_mode'] == "true") {
            let msg = "The website is under maintenance, please check back later."
            this.json_output_error(msg, { login_required: '1' }, res);
            return false
        }

        let headers = req.headers
        let bearHeader = get_data_value(headers, 'authorization')
        //console.log('bearHeader:::', bearHeader)
        let bearToken = ""
        if (!empty(bearHeader)) {
            const bear = bearHeader.split(' ');
            bearToken = bear[1];
            //console.log('bearToken', bearToken)
            if (!empty(bearToken)) {
                let condition = { token: bearToken, user_type: 'business' }
                let token_row = await tokenService.getOne(condition)
                //console.log('token_row', token_row);
                if (!empty(token_row)) {
                    const tokenExpired = await tokenService.checkTokenExpired(token_row)
                    if (!tokenExpired) {
                        let user_id = token_row['user_id']
                        let user_info = await businessService.getDetail({ id: user_id })
                        //console.log('user_info', user_info);
                        user_info['action_required'] = (app_settings['action_required'] === "true" ? "1" : "")
                        if (!empty(user_info)) {
                            if (intval(user_info['status']) === 1) {
                                await tokenService.update({ login_time: get_utc_timestamp() }, { token_id: token_row['token_id'] })
                                this.user = user_info;
                                this.data = { user: user_info }; //this.data['user'] = user_info; //  
                                return this.data
                            } else {
                                this.json_output_error("Account has been blocked by admin", { login_required: '1', bearToken: bearToken }, res);
                                return false;
                            }
                        }
                    }
                }
            }
        }
        this.json_output_error("Please login", { login_required: '1', bearToken: bearToken }, res);
        return false;
    }

    /**
     * Check login status from bearToken
     */
    protected checkLoginToken = async (token: string) => {
        // let req = this.req
        // let post_param: object = req['fields']
        // let get_param: object = req['query']
        if (!empty(token)) {
            let condition = { token: token, user_type: 'business' }
            let token_row = await tokenService.getOne(condition)
            if (!empty(token_row)) {
                const tokenExpired = await tokenService.checkTokenExpired(token_row)
                if (!tokenExpired) {
                    let user_id = token_row['user_id']
                    let user_info = await businessService.getOne({ id: user_id })
                    if (!empty(user_info)) {
                        await tokenService.update({ login_time: get_utc_timestamp() }, { token_id: token_row['token_id'] })
                        return user_info
                    }
                }
            }
        }
        return false
    }
}
