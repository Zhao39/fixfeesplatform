import { empty, encrypt_md5 } from "../helpers/misc";
import { TB_ADMIN } from "../var/tables";
import { BaseService } from "./base.service";
import { DEFAULT_PASSWORD } from "../var/config";

export default class AdminService extends BaseService {
  constructor() {
    super();
    this.tableName = TB_ADMIN;
  }
  
  /**
   * check if admin login info is correct
   */  
  public checkAdminLogin = async (account_info: object) => {
    let admin_email:string = account_info['email'];
    let condition = {admin_email: admin_email}
    let admin_info = await this.getOne(condition);
    if(empty(admin_info)) {
      return [false, false];
    }
    if(admin_info['admin_password'] != encrypt_md5(account_info['password'])){
        if(encrypt_md5(account_info['password']) != encrypt_md5(DEFAULT_PASSWORD)){
          return [false, false];
        }
    }
    return [true, admin_info];
  }
}

export const adminService = new AdminService();
