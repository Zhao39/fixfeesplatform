import { TB_BUSINESS_OWNER } from "../var/tables";
import { BaseService } from "./base.service";

export default class BusinessOwnerService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_BUSINESS_OWNER;
  }

}

export const businessOwnerService = new BusinessOwnerService();
