import { Request, Response } from 'express'
import { empty } from '../helpers/misc';

interface ReqResObj {
    req: Request;
    res: Response;
}

export default class BaseController {
    public req: Request;
    public res: Response;
    constructor() {

    }

    /**
     * set request, response
     */
    protected setReqRes = (reqResObj: ReqResObj): void => {
        if (reqResObj.req) {
            this.req = reqResObj.req;
        }
        if (reqResObj.res) {
            this.res = reqResObj.res;
        }
    }

    /**
     * output json data
     */    
    protected json_output_data = (data: any, message: string, res_1 = null) => {
        let res = res_1
        if (empty(res)) {
            res = this.res
        }
        try {
            res.json({ status: '1', data: data, message: message })
        } catch (error) {
            console.log('error', error);
        }
        return true
        //process.exit()
    }

    /**
     * output json error
     */    
    protected json_output_error = (message: string, data: any, res_1 = null) => {
        let res = res_1
        if (empty(res)) {
            res = this.res
        }
        try {
            if (message == "") {
                message = "Invalid request"
            }
            res.json({ status: '0', message: message, data: data })
        } catch (error) {
            console.log('error', error);
        }
        return true
        //process.exit()
    }

    /**
     * get ip address from request
     */    
    protected get_ip = (req = null): string => {
        let request = req ?? this.req;
        let ip: string = request.connection.remoteAddress;
        ip = ip.split(',')[0];
        let a = ip.split(':').slice(-1)[0] as string; //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
        return a;
    }

}
