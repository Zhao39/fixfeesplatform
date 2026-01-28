import * as mysql from 'mysql2';
import { empty, intval } from "../helpers/misc";
import { TB_FUNNEL_TYPES } from "../var/tables";
import { BaseService } from "./base.service";

export default class FunnelTypeService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_FUNNEL_TYPES;
  }
}

export const funnelTypeService = new FunnelTypeService();
