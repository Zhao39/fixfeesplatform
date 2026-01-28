import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, get_utc_timestamp, intval, isset } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';
import { TB_TRAINING_VIDEOS } from '../../var/tables';
import AdminBaseController from './admin.base.controller';
import { trainingVideoService } from '../../services/training.videos.service';
import { TRAINING_TYPE } from '../../var/config';

export default class AdminTrainingVideoController extends AdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * get training video list for data table
   */
  public getDataList = async (req: Request, res: Response) => { //api for datatable
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/

      let sql = "select u.id from " + TB_TRAINING_VIDEOS + " as u where 1=1";
      if (isset(get_param['keyword']) && !empty(get_param['keyword'])) {
        let keyword = "%" + get_param['keyword'] + "%";
        keyword = mysql.escape(keyword);
        sql += " and (u.video_id like " + keyword + " or u.headline like " + keyword + ")";
      }
      if (isset(get_param['training_type']) && !empty(get_param['training_type'])) {
        let keyword = get_param['training_type'];
        keyword = mysql.escape(keyword);
        sql += " and (u.training_type = " + keyword + ")";
      }
      //sql += " group by u.id";

      let rows = await trainingVideoService.query(sql) as []
      let total = rows.length;

      if (isset(get_param['sortby'])) {
        let sort_direction = get_data_value(get_param, 'direction', 'asc')
        sql += " order by `" + get_param['sortby'] + "` " + sort_direction
      }

      //console.log('==================sql================', sql);
      let page = intval(get_data_value(get_param, 'page', 1))
      let limit = intval(get_data_value(get_param, 'limit', 10)) // per page
      let offset = (page - 1) * limit;
      sql += " limit " + offset + "," + limit;
      let list = <RowDataPacket[]>await trainingVideoService.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await trainingVideoService.getOne({ id: item['id'] });
        list[key] = { ...row, ...item };
      }

      data['page'] = page;
      data['limit'] = limit;
      data['total'] = total;

      let total_pages = 0
      if (total > 0) {
        total_pages = Math.ceil(total / limit)
      }
      data['total_pages'] = total;
      data['data'] = list;

      return res.json(data)
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * get all training video list
   */
  public getList = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const vide_list = await trainingVideoService.getList(get_param)
      data['vide_list'] = vide_list;
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * add training video
   */
  public add = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const cur_timestamp = get_utc_timestamp()
      const video_id = get_data_value(post_param, 'video_id')
      const video_url_text = get_data_value(post_param, 'video_url_text')
      const headline = get_data_value(post_param, 'headline')
      const link = get_data_value(post_param, 'link')
      const training_data = get_data_value(post_param, 'training_data')
      const training_type = get_data_value(post_param, 'training_type', TRAINING_TYPE.MERCHANT)
      const priority = await trainingVideoService.getNewPriority()
      const status = 1

      const info = {
        video_id: video_id,
        video_url_text: video_url_text,
        headline: headline,
        link: link,
        training_data: training_data,
        priority: priority,
        status: status,
        add_timestamp: cur_timestamp,
        training_type: training_type
      }

      const checkExist = await trainingVideoService.checkExists(info, 0)
      if (checkExist) {
        return this.json_output_error("Video already exists!", {}, res)
      }

      const rslt = await trainingVideoService.insert(info)
      data['rslt'] = rslt

      let msg = "New training video has been added successfully!"
      return this.json_output_data(data, msg, res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * update training video
   */
  public update = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const cur_timestamp = get_utc_timestamp()

      const id = Number(req.params.id)
      const condition = {
        id: id
      }
      const row = await trainingVideoService.getOne(condition)
      if (empty(row?.id)) {
        return this.json_output_error("Video doest not exists!", {}, res)
      }

      const video_id = get_data_value(post_param, 'video_id')
      const video_url_text = get_data_value(post_param, 'video_url_text')
      const headline = get_data_value(post_param, 'headline')
      const link = get_data_value(post_param, 'link')
      const training_data = get_data_value(post_param, 'training_data')
      const training_type = get_data_value(post_param, 'training_type', TRAINING_TYPE.MERCHANT)

      const info = {
        video_id: video_id,
        video_url_text: video_url_text,
        headline: headline,
        link: link,
        training_data: training_data,
        add_timestamp: cur_timestamp,
        //training_type: training_type
      }
      const checkExist = await trainingVideoService.checkExists(info, id)
      if (checkExist) {
        return this.json_output_error("Training video already exists!", {}, res)
      }

      const rslt = await trainingVideoService.update(info, condition)
      data['rslt'] = rslt

      let msg = "Training video has been updated successfully!"
      return this.json_output_data(data, msg, res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * delete training video
   */
  public delete = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const id = Number(req.params.id)
      const condition = {
        id: id
      }
      const row = await trainingVideoService.getOne(condition)
      if (empty(row?.id)) {
        return this.json_output_error("Video doest not exists!", {}, res)
      }

      const rslt = await trainingVideoService.delete(condition)
      data['rslt'] = rslt

      let msg = "Training video has been deleted successfully!"
      return this.json_output_data(data, msg, res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * update meta data for training video
   */
  public updatePriority = async (req: Request, res: Response) => {
    try {
      if (empty(await this.init(req, res))) {
        return false
      }
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const cur_timestamp = get_utc_timestamp()
      const training_type = get_data_value(post_param, 'training_type', TRAINING_TYPE.MERCHANT)
      const video_list = get_data_value(post_param, 'video_list')
      const videList = JSON.parse(video_list)
      for (let k in videList) {
        const info = videList[k]
        const id = info['id']
        const where = { id: id }
        const update_data = {
          priority: k
        }
        await trainingVideoService.update(update_data, where)
      }

      const vide_list = await trainingVideoService.getList({ ...get_param, training_type: training_type })
      data['vide_list'] = vide_list;
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log("error::::", e)
      return this.json_output_error("", "", res)
    }
  }

}

export const adminTrainingVideoController = new AdminTrainingVideoController()
