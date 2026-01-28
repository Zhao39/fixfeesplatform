import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, get_utc_timestamp, intval, isset } from '../../helpers/misc';
import { couponService } from '../../services/coupon.service';
import { RowDataPacket } from 'mysql2';
import { TB_COUPON } from '../../var/tables';
import AdminBaseController from './admin.base.controller';

export default class AdminCouponController extends AdminBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  ///////////////////////////////////// starting apis //////////////////////////////////////////////
  public getDataList = async (req: Request, res: Response) => { //api for datatable
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/

    let per_page = intval(get_data_value(get_param, 'per_page', 10))
    let sql = ""
    sql = "select u.id from " + TB_COUPON + " as u where 1=1";
    if (isset(get_param['keyword1']) && !empty(get_param['keyword1'])) {
      let keyword1 = "%" + get_param['keyword1'] + "%";
      keyword1 = mysql.escape(keyword1);
      sql += " and (u.name like " + keyword1 + " or u.type_desc like " + keyword1 + ")";
    }

    //console.log('==================sql================', sql);

    let rows = await couponService.query(sql) as []
    let total = rows.length;

    if (isset(get_param['sort_column'])) {
      let sort_direction = get_data_value(get_param, 'sort_direction', 'asc')
      sql += " order by " + get_param['sort_column'] + " " + sort_direction
    }

    let page = intval(get_data_value(get_param, 'page', 1))

    let offset = (page - 1) * per_page;
    sql += " limit " + offset + "," + per_page;
    let list = <RowDataPacket[]>await couponService.query(sql)
    if (empty(list)) list = []
    for (let key in list) {
      let item = list[key]
      let row = await couponService.getOne({ id: item['id'] });
      list[key] = { ...row, ...item };
    }

    data['page'] = page;
    data['per_page'] = per_page;
    data['total'] = total;

    let total_pages = 0
    if (total > 0) {
      total_pages = Math.ceil(total / per_page)
    }
    data['total_pages'] = total;
    data['data'] = list;

    return res.json(data)
  }
  public getInfo = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let id = get_data_value(get_param, 'coupon_id')
    let condition = { id: id }
    let info = await couponService.getOne(condition);
    if (empty(info)) info = { name: "" }
    data['info'] = info;
    return this.json_output_data(data, "", res);
  }
  public submitCoupon = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    let id = intval(get_data_value(post_param, 'id'))
    let update_data = {}
    update_data['name'] = post_param['name'];
    update_data['type'] = post_param['type'];
    update_data['type_id'] = post_param['type_id'];
    update_data['desc'] = post_param['desc'];
    update_data['value'] = post_param['value'];
    let couponExists = await couponService.checkCouponExists(update_data, id);
    if (couponExists) {
      return this.json_output_error("Coupon code already exists", "", res);
    }
    if (id > 0) {
      let condition = { id: id }
      update_data['status'] = 1;
      await couponService.update(update_data, condition)
      return this.json_output_data(data, "Coupon been updated successfully", res);
    } else {
      update_data['status'] = 1;
      update_data['add_timestamp'] = get_utc_timestamp()
      await couponService.insert(update_data)
      return this.json_output_data(data, "Coupon has been added successfully", res);
    }
  }
  public deleteCoupon = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }
    let post_param: object = req['fields'];
    let get_param: object = req['query'];
    let data = this.data;
    let user = this.user;
    /**************************************************************************************************/
    const id = Number(req.params.id)
    let condition = { id: id }
    let info = await couponService.getOne(condition);
    await couponService.delete(condition);
    return this.json_output_data(data, "Coupon has been deleted successfully.", res);
  }


}

export const adminCouponController = new AdminCouponController()
