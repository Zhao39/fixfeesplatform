import BaseController from '../base.controller'
import { Request, Response } from 'express'

export default class WebhookBaseController extends BaseController {
    public user: object = {};
    public data: object = {};
    constructor() {
        super();
    }

    protected checkLogin = async (req: Request, res: Response) => {
        let post_param: object = req['fields']
        let get_param: object = req['query']
        
        return true
     }

}
