import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, intval, isset } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';

import UserBaseController from './user.base.controller';
import { businessService } from '../../services/business.service';
import { userService } from '../../services/user.service';
import { TB_BUSINESS, TB_USER } from '../../var/tables';
import { googleCalendarLib } from '../../library/googleCalendarLib';
import { BASE_APP_URL, BASE_PARTNER_URL, GOOGLE_OAUTH_USER_REDIRECT_URL } from '../../var/env.config';
import { settingService } from '../../services/setting.service';
import { ENVIRONMENT } from '../../var/config';

export default class UserCalendarController extends UserBaseController {
  constructor() {
    super();
  }

  public init = async (req: Request, res: Response) => {
    this.setReqRes({ req: req, res: res });
    return await this.checkLogin(req, res)
  }

  /**
   * Authorize Google Calendar
   */
  public getAuthUrl = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_USER_REDIRECT_URL)
      const authUrl = await googleCalendarLib.getAuthUrl(oAuth2Client)
      data['authUrl'] = authUrl
      return this.json_output_data(data, "", res);
    } catch (e) {
      console.log(`UserCalendarController getauthUrl error::`, e)
      return this.json_output_error("", "", res)
    }
  }
  /**
  * process OAuth2Callback (This function must not require bearToken)
  */
  public processOAuth2Callback = async (req: Request, res: Response) => {
    // if (empty(await this.init(req, res))) {
    //   return false
    // }

    this.setReqRes({ req: req, res: res });

    const uri = `user/calendar/calendar-settings`
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_USER_REDIRECT_URL)
      const oauthCallbackData = await googleCalendarLib.oauth2Callback(req, oAuth2Client)
      if (oauthCallbackData['error']) {
        const redirectUrl = `${BASE_PARTNER_URL}${uri}?status=error&error=${encodeURIComponent(oauthCallbackData['error'])}`
        return res.redirect(redirectUrl)
      } else {
        console.log(`oauthCallbackData:::`, oauthCallbackData)
        const token = oauthCallbackData['token']
        const tokenStr = JSON.stringify(token)
        const redirectUrl = `${BASE_PARTNER_URL}${uri}?status=success&token=${encodeURIComponent(tokenStr)}`
        return res.redirect(redirectUrl)
      }
    } catch (e) {
      console.log(`UserCalendarController processOAuth2Callback error::`, e)
      const errorStr = `Invalid request`
      const redirectUrl = `${BASE_PARTNER_URL}${uri}?status=error&error=${encodeURIComponent(errorStr)}`
      return res.redirect(redirectUrl)
    }
  }

  /**
  * save google oauth token
  */
  public saveOauthToken = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const user_id = user['id']
      const token = post_param['token']
      if (token && token['access_token']) {
        const update_data = {
          google_oauth_token: JSON.stringify(token)
        }
        await userService.update(update_data, { id: user_id })
      }

      data['token'] = token
      return this.json_output_data(data, "", res)
    } catch (e) {
      console.log(`UserCalendarController saveOauthToken error::`, e)
      return this.json_output_error("", "", res)
    }
  }

  /**
  * get events for authrized calendar
  */
  public getEvents = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      // const token = user['google_oauth_token']
      const token = await settingService.get_app_setting('google_oauth_token', ENVIRONMENT.PARTNER)
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_USER_REDIRECT_URL)
      const eventListData = await googleCalendarLib.getEvents(token, oAuth2Client)
      if (eventListData['newTokenObj']) {
        const setting_data = {
          google_oauth_token: JSON.stringify(eventListData['newTokenObj'])
        }
        await settingService.update_app_settings(setting_data, ENVIRONMENT.PARTNER)
      }
      //console.log(`eventListData:::`, eventListData)
      if (eventListData['error']) {
        return this.json_output_error(eventListData['error'], "", res)
      } else {
        return this.json_output_data(eventListData, "", res);
      }
    } catch (e) {
      console.log(`UserCalendarController getEvents error::`, e)
      return this.json_output_error("", "", res)
    }
  }

  /**
   * add an event for authrized calendar
   */
  public createEvent = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const token = null
      const eventInfo = post_param['event']
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_USER_REDIRECT_URL)
      const eventData = await googleCalendarLib.createEvent(token, eventInfo, oAuth2Client)
      if (eventData['error']) {
        return this.json_output_error(eventData['error'], "", res)
      } else {
        return this.json_output_data(eventData, "", res);
      }
    } catch (e) {
      console.log(`UserCalendarController createEvent error::`, e)
      return this.json_output_error("", "", res)
    }
  }

  
  /**
  * get color list of a calendar
  */
  public getColors = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const token = await settingService.get_app_setting('google_oauth_token', ENVIRONMENT.PARTNER)
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_USER_REDIRECT_URL)
      const colorListData = await googleCalendarLib.getColors(token, oAuth2Client)
      if (colorListData['newTokenObj']) {
        const setting_data = {
          google_oauth_token: JSON.stringify(colorListData['newTokenObj'])
        }
        await settingService.update_app_settings(setting_data, ENVIRONMENT.PARTNER)
      }
      //console.log(`colorListData:::`, colorListData)
      if (colorListData['error']) {
        return this.json_output_error(colorListData['error'], "", res)
      } else {
        return this.json_output_data(colorListData, "", res);
      }
    } catch (e) {
      console.log(`UserCalendarController getEvents error::`, e)
      return this.json_output_error("", "", res)
    }
  }

}

export const userCalendarController = new UserCalendarController()
