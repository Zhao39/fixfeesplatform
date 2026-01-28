import { Request, Response } from 'express'
import * as mysql from 'mysql2';
import { empty, get_data_value, intval, isset } from '../../helpers/misc';
import { RowDataPacket } from 'mysql2';

import AdminBaseController from './admin.base.controller';
import { userService } from '../../services/user.service';
import { TB_BUSINESS, TB_USER } from '../../var/tables';
import { googleCalendarLib } from '../../library/googleCalendarLib';
import { settingService } from '../../services/setting.service';
import { BASE_APP_URL, BASE_PARTNER_URL, GOOGLE_OAUTH_ADMIN_REDIRECT_URL } from '../../var/env.config';
import { ENVIRONMENT } from '../../var/config';

export default class AdminCalendarController extends AdminBaseController {
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
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_ADMIN_REDIRECT_URL)
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

    const uri = `admin/calendar/calendar-settings`
    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_ADMIN_REDIRECT_URL)
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
      const token = post_param['token']
      if (token && token['access_token']) {
        const setting_data = {
          google_oauth_token: JSON.stringify(token)
        }
        await settingService.update_app_settings(setting_data, ENVIRONMENT.PARTNER)
      }

      data['token'] = token
      const google_oauth_token = await settingService.get_app_setting("google_oauth_token", ENVIRONMENT.PARTNER)
      data['google_oauth_token'] = google_oauth_token
      return this.json_output_data(data, "", res)
    } catch (e) {
      console.log(`UserCalendarController saveOauthToken error::`, e)
      return this.json_output_error("", "", res)
    }
  }

  /**
  * get google oauth token
  */
  public getOauthToken = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const google_oauth_token = await settingService.get_app_setting("google_oauth_token", ENVIRONMENT.PARTNER)
      data['google_oauth_token'] = google_oauth_token
      return this.json_output_data(data, "", res)
    } catch (e) {
      console.log(`UserCalendarController getOauthToken error::`, e)
      return this.json_output_error("", "", res)
    }
  }

  /**
  * delete google oauth token
  */
  public deleteOauthToken = async (req: Request, res: Response) => {
    if (empty(await this.init(req, res))) {
      return false
    }

    try {
      let post_param: object = req['fields'];
      let get_param: object = req['query'];
      let data = this.data;
      let user = this.user;
      /**************************************************************************************************/
      const setting_data = {
        google_oauth_token: ""
      }
      await settingService.update_app_settings(setting_data, ENVIRONMENT.PARTNER)

      const google_oauth_token = await settingService.get_app_setting("google_oauth_token", ENVIRONMENT.PARTNER)
      data['google_oauth_token'] = google_oauth_token
      return this.json_output_data(data, "", res)
    } catch (e) {
      console.log(`UserCalendarController getOauthToken error::`, e)
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
      const token = await settingService.get_app_setting('google_oauth_token', ENVIRONMENT.PARTNER)
      if (empty(token)) {
        return this.json_output_error("Please connect your google account.", { google_oauth_token: "" }, res)
      }

      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_ADMIN_REDIRECT_URL)
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
   * add or update an event for authrized calendar
   */
  public saveEvent = async (req: Request, res: Response) => {
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
      if (empty(token)) {
        return this.json_output_error("Please connect your google account.", { google_oauth_token: "" }, res)
      }

      const eventInfo = post_param
      console.log(`eventInfo:::`, eventInfo)
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_ADMIN_REDIRECT_URL)
      let eventData = null
      const eventId = eventInfo['id']
      delete eventInfo['id']
      if (eventId) {
        eventData = await googleCalendarLib.updateEvent(token, eventId, eventInfo, oAuth2Client)
      } else {
        eventData = await googleCalendarLib.createEvent(token, eventInfo, oAuth2Client)
      }
      if (eventData['newTokenObj']) {
        const setting_data = {
          google_oauth_token: JSON.stringify(eventData['newTokenObj'])
        }
        await settingService.update_app_settings(setting_data, ENVIRONMENT.PARTNER)
      }
      console.log(`eventData:::`, eventData)
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
   * delete an event for authrized calendar
   */
  public deleteEvent = async (req: Request, res: Response) => {
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
      if (empty(token)) {
        return this.json_output_error("Please connect your google account.", { google_oauth_token: "" }, res)
      }

      const eventId = post_param['eventId']
      console.log(`eventId:::`, eventId)
      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_ADMIN_REDIRECT_URL)
      const eventData = await googleCalendarLib.deleteEvent(token, eventId, oAuth2Client)
      if (eventData['newTokenObj']) {
        const setting_data = {
          google_oauth_token: JSON.stringify(eventData['newTokenObj'])
        }
        await settingService.update_app_settings(setting_data, ENVIRONMENT.PARTNER)
      }
      console.log(`eventData:::`, eventData)
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
      if (empty(token)) {
        return this.json_output_error("Please connect your google account.", { google_oauth_token: "" }, res)
      }

      const oAuth2Client = await googleCalendarLib.getOAuth2Client(GOOGLE_OAUTH_ADMIN_REDIRECT_URL)
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

export const adminCalendarController = new AdminCalendarController()
