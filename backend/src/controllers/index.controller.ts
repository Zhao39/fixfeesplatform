import { Request, Response } from 'express'
import { get_data_value, get_transaprent_1_pixel_file, get_utc_timestamp, sleep } from '../helpers/misc';
import BaseController from './base.controller';
import { API_VERSION } from '../var/config';

export default class IndexController extends BaseController {
  constructor() {
    super();
  }

  public init = (req: Request, res: Response): void => {
    this.setReqRes({ req: req, res: res });
  }

  /********************************************** main controllers **************************************************************/

  public index = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////

    this.json_output_data("aaaa", "", res);
  }

  /**
   * waiting endpoint
   */    
  public waitLoading = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////  
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      const res_type = get_data_value(get_param, 'res_type', 'image')
      const ms = Number(get_data_value(get_param, 'ms', 1000))
      await sleep(ms)
      if (res_type === 'image') {
        const png_file = await get_transaprent_1_pixel_file()
        //console.log(`png_file:::`, png_file)
        return res.download(png_file) //return res.send("")
      }
      else {
        return res.send("")
      }
    } catch (e) {
      console.log("error", e)
      return res.send("")
    }
  }

  public test = async (req: Request, res: Response) => {
    this.init(req, res);
    /////////////////////////////////////////////////////////////////
    let api_version = API_VERSION
    let tmp_setting_update_data = {
        cronjob_test_field: api_version + " - " + get_utc_timestamp()
    }
    
    let data = {
      api_version: api_version,
      cur_utc_timestamp : get_utc_timestamp(),
      cronjob_test_field: tmp_setting_update_data['cronjob_test_field']
    }
    this.json_output_data(data, "", res);
  };
 
}

export const indexController = new IndexController()
