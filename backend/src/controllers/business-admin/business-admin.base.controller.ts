import BaseController from '../base.controller'
import { Request, Response } from 'express'
import { empty, get_data_value, get_utc_timestamp } from '../../helpers/misc';
import { tokenService } from '../../services/token.service';
import { ENVIRONMENT } from '../../var/config';
import { businessAdminService } from '../../services/business.admin.service';

export default class BusinessAdminBaseController extends BaseController {
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
        let headers = req.headers
        let bearHeader = get_data_value(headers, 'authorization')
        let bearToken = ""
        if (!empty(bearHeader)) {
            const bear = bearHeader.split(' ');
            bearToken = bear[1];
            //console.log('bearToken', bearToken)
            if (!empty(bearToken)) {
                let condition = { token: bearToken, user_type: 'business_admin' }
                let token_row = await tokenService.getOne(condition)
                if (!empty(token_row)) {
                    const tokenExpired = await tokenService.checkTokenExpired(token_row)
                    if (!tokenExpired) {
                        let user_id = token_row['user_id']
                        let user_info = await businessAdminService.getOne({ id: user_id })
                        user_info['maintance_mode'] = ""
                        if (!empty(user_info)) {
                            await tokenService.update({ login_time: get_utc_timestamp() }, { token_id: token_row['token_id'] })
                            this.user = user_info;
                            this.data = { user: user_info }; //this.data['user'] = user_info; //  
                            return this.data
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
            let condition = { token: token, user_type: 'admin' }
            let token_row = await tokenService.getOne(condition)
            if (!empty(token_row)) {
                const tokenExpired = await tokenService.checkTokenExpired(token_row)
                if (!tokenExpired) {
                    let user_id = token_row['user_id']
                    let user_info = await businessAdminService.getOne({ id: user_id })
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
