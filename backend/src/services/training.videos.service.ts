import * as mysql from 'mysql2';
import { console_log, empty, isset } from '../helpers/misc';
import { RowDataPacket } from 'mysql2';
import { TB_TRAINING_VIDEOS } from "../var/tables";
import { BaseService } from "./base.service";

export default class TrainingVideoService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_TRAINING_VIDEOS;
  }

  /**
   * check if same video exist
   */
  public checkExists = async (info: object, id: number) => {
    try {
      let video_id = info['video_id'];
      video_id = mysql.escape(video_id);
      let sql = "select id from " + TB_TRAINING_VIDEOS + " where 1=1"
      sql += " and (video_id = " + video_id + ")";
      sql += " and id <> " + id
      let training_type = info['training_type']
      training_type = mysql.escape(training_type);
      sql += " and (training_type = " + training_type + ")";
      console_log(`sql::::`, sql)
      let row = await this.query(sql);
      if (empty(row)) {
        return false
      } else {
        return true
      }
    } catch (e) {
      console.log('checkExists error:::', e)
    }
  }

  /**
   * get training video list
   */
  public getList = async (get_param = {}) => {
    try {
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
      sql += " order by `priority` asc"
      console_log('==================sql================', sql);
      let list = <RowDataPacket[]>await this.query(sql)
      if (empty(list)) list = []

      for (let key in list) {
        let item = list[key]
        let row = await this.getOne({ id: item['id'] });
        list[key] = { ...row, ...item };
      }
      return list
    } catch (e) {
      console.log('getList error:::', e)
      return []
    }
  }

  /**
   * get next index of new video
   */
  public getNewPriority = async () => {
    try {
      let priority = 0
      let sql = "select u.id, u.priority from " + TB_TRAINING_VIDEOS + " as u where 1=1";
      sql += " order by `priority` desc"
      sql += " limit 0, 1"

      let list = <RowDataPacket[]>await this.query(sql)
      if (empty(list)) list = []
      if (list && list.length > 0) {
        priority = list[0].priority + 1
      }
      return priority
    } catch (e) {
      console.log('getNewPriority error:::', e)
      return 0
    }
  }
}

export const trainingVideoService = new TrainingVideoService();
